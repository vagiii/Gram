import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import GrammarPanel from "./components/GrammarPanel";
import CodexPanel from "./components/CodexPanel";
import DeclensionModal from "./components/DeclensionModal";
import StatsModal from "./components/StatsModal";
import ExportModal from "./components/ExportModal";
import ImportModal from "./components/ImportModal";
import SettingsModal from "./components/SettingsModal";
import ProjectManagerModal from "./components/ProjectManagerModal";
import { INITIAL_NOVEL } from "./data/sampleNovel";
import { loadProjectsFromStorage } from "./engine/projectManager";
import { analyzeCzechText } from "./engine/grammarParser";
import { Menu, Sparkles } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function saveProjects(projects) {
  localStorage.setItem("bohemica_projects", JSON.stringify(projects));
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // Multi-project state: list of all projects
  const [projects, setProjects] = useState(() => loadProjectsFromStorage());

  // Active project ID (persist across reloads)
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const saved = localStorage.getItem("bohemica_active_project_id");
    const list = loadProjectsFromStorage();
    if (saved && list.some((p) => p.id === saved)) return saved;
    return list[0]?.id || "";
  });

  // Derive the active novel from projects + activeProjectId
  const novel = projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_NOVEL;

  // Convenience: update a single project in the list
  const updateActiveProject = useCallback((updater) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? updater(p) : p))
    );
  }, [activeProjectId]);

  // Persist projects list whenever it changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => saveProjects(projects), 500);
    return () => clearTimeout(t);
  }, [projects]);

  // Persist active project id
  useEffect(() => {
    localStorage.setItem("bohemica_active_project_id", activeProjectId);
  }, [activeProjectId]);

  // ─── UI State ──────────────────────────────────────────────────────────────
  const [activeSceneId, setActiveSceneId] = useState(
    () => novel.chapters[0]?.scenes[0]?.id || ""
  );
  const [activeTab, setActiveTab] = useState("editor");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [grammarPanelOpen, setGrammarPanelOpen] = useState(() => !window.matchMedia("(max-width: 820px)").matches);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [fontFamily, setFontFamily] = useState("literata");
  const [theme, setTheme] = useState("obsidian");
  const [checkGrammarEnabled, setCheckGrammarEnabled] = useState(true);

  // Modals
  const [showDeclensionModal, setShowDeclensionModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);

  // Reset scene selection when project changes
  useEffect(() => {
    const firstScene = novel.chapters[0]?.scenes[0]?.id || "";
    setActiveSceneId(firstScene);
    setSelectedIssue(null);
    setIssues([]);
  }, [activeProjectId]);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && focusMode) { setFocusMode(false); return; }
      if (e.ctrlKey && e.shiftKey && e.key === "G") { e.preventDefault(); setGrammarPanelOpen((p) => !p); return; }
      if (e.ctrlKey && e.shiftKey && e.key === "F") { e.preventDefault(); setFocusMode((p) => !p); return; }
      if (e.ctrlKey && (e.key === "e" || e.key === "E") && !e.shiftKey) { e.preventDefault(); setShowExportModal(true); return; }
      if (e.ctrlKey && e.shiftKey && e.key === "P") { e.preventDefault(); setShowProjectManager((p) => !p); return; }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMode]);

  // ─── Active scene & chapter ───────────────────────────────────────────────
  let activeScene = null;
  let activeChapter = null;
  for (const chap of novel.chapters) {
    const found = chap.scenes.find((s) => s.id === activeSceneId);
    if (found) { activeScene = found; activeChapter = chap; break; }
  }

  // ─── Grammar analysis (debounced) ─────────────────────────────────────────
  const [issues, setIssues] = useState([]);
  useEffect(() => {
    // Never show findings from the previous scene/text while a fresh analysis is pending.
    setIssues([]);
    if (!checkGrammarEnabled || !activeScene?.content) { setIssues([]); return; }
    const t = setTimeout(() => setIssues(analyzeCzechText(activeScene.content)), 350);
    return () => clearTimeout(t);
  }, [activeSceneId, activeScene?.content, checkGrammarEnabled]);

  // ─── Content handlers ─────────────────────────────────────────────────────
  const handleContentChange = useCallback((sceneId, newContent) => {
    updateActiveProject((p) => ({
      ...p,
      chapters: p.chapters.map((chap) => ({
        ...chap,
        scenes: chap.scenes.map((sc) => (sc.id === sceneId ? { ...sc, content: newContent } : sc))
      }))
    }));
  }, [updateActiveProject]);

  const handleApplyFix = (issue, replacement) => {
    if (!activeScene) return;
    const before = activeScene.content.substring(0, issue.startIndex);
    const after = activeScene.content.substring(issue.endIndex);
    handleContentChange(activeScene.id, before + replacement + after);
    setSelectedIssue(null);
  };

  // ─── Chapter / Scene operations ───────────────────────────────────────────
  const handleAddChapter = () => {
    const newId = `chap-${Date.now()}`;
    const newSceneId = `scene-${Date.now()}`;
    updateActiveProject((p) => ({
      ...p,
      chapters: [...p.chapters, { id: newId, title: `Kapitola ${p.chapters.length + 1}`, scenes: [{ id: newSceneId, title: "Scéna 1", content: "" }] }]
    }));
    setActiveSceneId(newSceneId);
  };

  const handleAddScene = (chapterId) => {
    const newSceneId = `scene-${Date.now()}`;
    updateActiveProject((p) => ({
      ...p,
      chapters: p.chapters.map((chap) =>
        chap.id === chapterId
          ? { ...chap, scenes: [...chap.scenes, { id: newSceneId, title: `Scéna ${chap.scenes.length + 1}`, content: "" }] }
          : chap
      )
    }));
    setActiveSceneId(newSceneId);
  };

  const handleDeleteChapter = (chapId) => {
    updateActiveProject((p) => {
      const remaining = p.chapters.filter((c) => c.id !== chapId);
      if (remaining.length > 0 && !remaining.some((c) => c.scenes.some((s) => s.id === activeSceneId))) {
        setActiveSceneId(remaining[0].scenes[0]?.id || "");
      }
      return { ...p, chapters: remaining };
    });
  };

  const handleDeleteScene = (sceneId) => {
    updateActiveProject((p) => ({
      ...p,
      chapters: p.chapters.map((chap) => ({ ...chap, scenes: chap.scenes.filter((s) => s.id !== sceneId) }))
    }));
  };

  const handleRenameChapter = (chapId, newTitle) => {
    updateActiveProject((p) => ({
      ...p,
      chapters: p.chapters.map((c) => (c.id === chapId ? { ...c, title: newTitle } : c))
    }));
  };

  const handleRenameScene = (sceneId, newTitle) => {
    updateActiveProject((p) => ({
      ...p,
      chapters: p.chapters.map((chap) => ({
        ...chap,
        scenes: chap.scenes.map((s) => (s.id === sceneId ? { ...s, title: newTitle } : s))
      }))
    }));
  };

  const handleImportManuscript = (importedChapters) => {
    updateActiveProject((p) => ({ ...p, chapters: importedChapters }));
    if (importedChapters[0]?.scenes[0]?.id) setActiveSceneId(importedChapters[0].scenes[0].id);
  };

  // ─── Codex operations ─────────────────────────────────────────────────────
  const handleAddCodexEntry = (entry) => {
    updateActiveProject((p) => ({ ...p, codex: [...(p.codex || []), entry] }));
  };
  const handleDeleteCodexEntry = (entryId) => {
    updateActiveProject((p) => ({ ...p, codex: (p.codex || []).filter((c) => c.id !== entryId) }));
  };
  const handleUpdateCodexEntry = (entryId, updatedFields) => {
    updateActiveProject((p) => ({
      ...p,
      codex: (p.codex || []).map((c) => (c.id === entryId ? { ...c, ...updatedFields } : c))
    }));
  };

  // ─── Project Manager operations ───────────────────────────────────────────
  const handleSelectProject = (id) => {
    setActiveProjectId(id);
    setShowProjectManager(false);
  };

  const handleCreateProject = (newProj) => {
    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    setShowProjectManager(false);
  };

  const handleDeleteProject = (id) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (id === activeProjectId && remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleImportProject = (proj) => {
    setProjects((prev) => [...prev, proj]);
    setActiveProjectId(proj.id);
    setShowProjectManager(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={`app-container theme-${theme} ${focusMode ? "focus-mode-active" : ""}`}>
      {!focusMode && (
        <Sidebar
          novel={novel}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          activeSceneId={activeSceneId}
          onSelectScene={(id) => { setActiveSceneId(id); setSelectedIssue(null); setMobileMenuOpen(false); }}
          onAddChapter={handleAddChapter}
          onAddScene={handleAddScene}
          onDeleteChapter={handleDeleteChapter}
          onDeleteScene={handleDeleteScene}
          onRenameChapter={handleRenameChapter}
          onRenameScene={handleRenameScene}
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }}
          onOpenDeclension={() => { setMobileMenuOpen(false); setShowDeclensionModal(true); }}
          onOpenStats={() => { setMobileMenuOpen(false); setShowStatsModal(true); }}
          onOpenExport={() => { setMobileMenuOpen(false); setShowExportModal(true); }}
          onOpenImport={() => { setMobileMenuOpen(false); setShowImportModal(true); }}
          onOpenSettings={() => { setMobileMenuOpen(false); setShowSettingsModal(true); }}
          onOpenProjectManager={() => { setMobileMenuOpen(false); setShowProjectManager(true); }}
          projectsCount={projects.length}
        />
      )}

      {!focusMode && mobileMenuOpen && (
        <button
          className="mobile-menu-backdrop"
          aria-label="Zavřít navigační nabídku"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {!focusMode && (
        <header className="mobile-appbar">
          <button className="mobile-appbar-icon" onClick={() => setMobileMenuOpen(true)} aria-label="Otevřít nabídku">
            <Menu />
          </button>
          <div className="mobile-appbar-title">
            <strong>{activeTab === "editor" ? (activeScene?.title || "Rukopis") : "Postavy a svět"}</strong>
            <span>{novel.title}</span>
          </div>
          {activeTab === "editor" && (
            <button
              className={`mobile-appbar-check ${grammarPanelOpen ? "is-open" : ""}`}
              onClick={() => setGrammarPanelOpen((open) => !open)}
              aria-label={grammarPanelOpen ? "Skrýt korekturu" : "Zobrazit korekturu"}
            >
              <Sparkles />
              <span>{issues.length}</span>
            </button>
          )}
        </header>
      )}

      <main className="main-content">
        {activeTab === "editor" ? (
          <div className="editor-layout">
            <Editor
              scene={activeScene}
              chapterTitle={activeChapter?.title || ""}
              onContentChange={handleContentChange}
              issues={issues}
              onApplyFix={handleApplyFix}
              selectedIssue={selectedIssue}
              onSelectIssue={setSelectedIssue}
              focusMode={focusMode}
              setFocusMode={setFocusMode}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              checkGrammarEnabled={checkGrammarEnabled}
              setCheckGrammarEnabled={setCheckGrammarEnabled}
              onOpenGrammarPanel={() => setGrammarPanelOpen(true)}
            />

            {!focusMode && grammarPanelOpen && (
              <GrammarPanel
                issues={issues}
                onApplyFix={handleApplyFix}
                onSelectIssue={setSelectedIssue}
                selectedIssueId={selectedIssue?.id}
                onClose={() => setGrammarPanelOpen(false)}
              />
            )}

            {!focusMode && !grammarPanelOpen && (
              <button
                className="toggle-grammar-drawer-btn"
                onClick={() => setGrammarPanelOpen(true)}
                title="Otevřít korekční panel gramatiky"
              >
                <Sparkles className="icon-xs text-amber" />
                <span>Gramatika ({issues.length})</span>
              </button>
            )}
          </div>
        ) : (
          <CodexPanel
            novel={novel}
            codex={novel.codex || []}
            onAddEntry={handleAddCodexEntry}
            onDeleteEntry={handleDeleteCodexEntry}
            onUpdateEntry={handleUpdateCodexEntry}
          />
        )}
      </main>

      {/* Modals */}
      {showDeclensionModal && <DeclensionModal onClose={() => setShowDeclensionModal(false)} />}
      {showStatsModal && <StatsModal novel={novel} onClose={() => setShowStatsModal(false)} />}
      {showExportModal && <ExportModal novel={novel} onClose={() => setShowExportModal(false)} />}
      {showImportModal && (
        <ImportModal onImportManuscript={handleImportManuscript} onClose={() => setShowImportModal(false)} />
      )}
      {showSettingsModal && (
        <SettingsModal
          theme={theme} setTheme={setTheme}
          fontFamily={fontFamily} setFontFamily={setFontFamily}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
      {showProjectManager && (
        <ProjectManagerModal
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onImportProject={handleImportProject}
          onClose={() => setShowProjectManager(false)}
        />
      )}
    </div>
  );
}



