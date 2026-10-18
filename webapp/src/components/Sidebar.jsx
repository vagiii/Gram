import React, { useState } from "react";
import {
  BookOpen,
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Users,
  BarChart3,
  Download,
  Settings,
  BookMarked,
  Upload,
  FolderOpen
} from "lucide-react";

export default function Sidebar({
  novel,
  mobileMenuOpen,
  onCloseMobile,
  activeSceneId,
  onSelectScene,
  onAddChapter,
  onAddScene,
  onDeleteChapter,
  onDeleteScene,
  onRenameChapter,
  onRenameScene,
  activeTab,
  setActiveTab,
  onOpenDeclension,
  onOpenStats,
  onOpenExport,
  onOpenImport,
  onOpenSettings,
  onOpenProjectManager,
  projectsCount
}) {
  const [expandedChapters, setExpandedChapters] = useState(
    novel.chapters.reduce((acc, chap) => ({ ...acc, [chap.id]: true }), {})
  );
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const toggleChapter = (chapId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  const startRename = (id, currentTitle, e) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveRename = (type, id, e) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    if (type === "chapter") {
      onRenameChapter(id, editTitle);
    } else {
      onRenameScene(id, editTitle);
    }
    setEditingId(null);
  };

  // Calculate total manuscript word count
  const totalWords = novel.chapters.reduce((acc, chap) => {
    return (
      acc +
      chap.scenes.reduce((sAcc, sc) => {
        const words = sc.content.trim() ? sc.content.trim().split(/\s+/).length : 0;
        return sAcc + words;
      }, 0)
    );
  }, 0);

  const progressPercent = Math.min(100, Math.round((totalWords / novel.targetWordCount) * 100));

  return (
    <aside className={`sidebar-container ${mobileMenuOpen ? "mobile-drawer-open" : ""}`}>
      {/* App Branding */}
      <div className="sidebar-header">
        <div className="brand-badge">
          <BookMarked className="brand-icon" />
          <div className="brand-info">
            <span className="brand-title">Bohemica</span>
            <span className="brand-subtitle">Novel Studio & Gramatika</span>
          </div>
          <button className="mobile-drawer-close" onClick={onCloseMobile} aria-label="Zavřít nabídku">
            <X />
          </button>
        </div>
      </div>

      {/* Novel Info & Progress Bar */}
      <div className="manuscript-card">
        <div className="manuscript-title">{novel.title}</div>
        <div className="manuscript-author">Autor: {novel.author}</div>

        <div className="progress-section">
          <div className="progress-labels">
            <span>Slov: {totalWords.toLocaleString()}</span>
            <span>Cíl: {novel.targetWordCount.toLocaleString()} ({progressPercent}%)</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="sidebar-nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === "editor" ? "active" : ""}`}
          onClick={() => setActiveTab("editor")}
          title="Rukopis a Kapitoly"
        >
          <BookOpen className="tab-icon" />
          <span>Rukopis</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === "codex" ? "active" : ""}`}
          onClick={() => setActiveTab("codex")}
          title="Postavy a Svět (Codex)"
        >
          <Users className="tab-icon" />
          <span>Postavy a Svět</span>
        </button>
      </div>

      {/* Chapters & Scenes Tree */}
      {activeTab === "editor" && (
        <div className="tree-container">
          <div className="tree-header">
            <span className="tree-title">Struktura románu</span>
            <button className="icon-btn-add" onClick={onAddChapter} title="Přidat novou kapitolu">
              <FolderPlus className="icon-sm" />
            </button>
          </div>

          <div className="tree-list">
            {novel.chapters.map((chap, chapIdx) => {
              const isExpanded = expandedChapters[chap.id];
              return (
                <div key={chap.id} className="chapter-node">
                  {/* Chapter Header */}
                  <div
                    className="chapter-header-row"
                    onClick={() => toggleChapter(chap.id)}
                  >
                    <button className="expand-btn">
                      {isExpanded ? <ChevronDown className="icon-xs" /> : <ChevronRight className="icon-xs" />}
                    </button>

                    {editingId === chap.id ? (
                      <div className="inline-edit-box" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && saveRename("chapter", chap.id, e)}
                        />
                        <button onClick={(e) => saveRename("chapter", chap.id, e)}>
                          <Check className="icon-xs text-green" />
                        </button>
                        <button onClick={() => setEditingId(null)}>
                          <X className="icon-xs text-red" />
                        </button>
                      </div>
                    ) : (
                      <span className="chapter-title">{chap.title}</span>
                    )}

                    <div className="node-actions">
                      <button
                        title="Přidat scénu"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddScene(chap.id);
                        }}
                      >
                        <FilePlus className="icon-xs" />
                      </button>
                      <button title="Přejmenovat" onClick={(e) => startRename(chap.id, chap.title, e)}>
                        <Edit2 className="icon-xs" />
                      </button>
                      {novel.chapters.length > 1 && (
                        <button
                          title="Smazat kapitolu"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Opravdu smazat kapitolu "${chap.title}"?`)) {
                              onDeleteChapter(chap.id);
                            }
                          }}
                        >
                          <Trash2 className="icon-xs text-red" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scenes List */}
                  {isExpanded && (
                    <div className="scenes-list">
                      {chap.scenes.map((scene) => {
                        const isActive = scene.id === activeSceneId;
                        const wordCount = scene.content.trim() ? scene.content.trim().split(/\s+/).length : 0;
                        return (
                          <div
                            key={scene.id}
                            className={`scene-node ${isActive ? "active-scene" : ""}`}
                            onClick={() => onSelectScene(scene.id)}
                          >
                            <div className="scene-indicator"></div>

                            {editingId === scene.id ? (
                              <div className="inline-edit-box" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  autoFocus
                                  onKeyDown={(e) => e.key === "Enter" && saveRename("scene", scene.id, e)}
                                />
                                <button onClick={(e) => saveRename("scene", scene.id, e)}>
                                  <Check className="icon-xs text-green" />
                                </button>
                                <button onClick={() => setEditingId(null)}>
                                  <X className="icon-xs text-red" />
                                </button>
                              </div>
                            ) : (
                              <div className="scene-info">
                                <span className="scene-title">{scene.title}</span>
                                <span className="scene-words">{wordCount} slov</span>
                              </div>
                            )}

                            <div className="node-actions scene-actions">
                              <button title="Přejmenovat" onClick={(e) => startRename(scene.id, scene.title, e)}>
                                <Edit2 className="icon-xs" />
                              </button>
                              {chap.scenes.length > 1 && (
                                <button
                                  title="Smazat scénu"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Opravdu smazat scénu "${scene.title}"?`)) {
                                      onDeleteScene(scene.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="icon-xs text-red" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Tools & Helper Buttons */}
      <div className="sidebar-tools">
        <button className="tool-btn tool-btn-primary" onClick={onOpenProjectManager} title="Spravovat projekty románů (Ctrl+Shift+P)">
          <FolderOpen className="tool-icon text-amber" />
          <span>Projekty románů</span>
          {projectsCount > 1 && <span className="issue-badge-count">{projectsCount}</span>}
        </button>

        <button className="tool-btn" onClick={onOpenImport} title="Importovat soubor a rozdělit na kapitoly">
          <Upload className="tool-icon text-amber" />
          <span>Import souboru (Kapitoly)</span>
        </button>

        <button className="tool-btn" onClick={onOpenDeclension} title="Příručka českých vzorů a skloňování">
          <Sparkles className="tool-icon text-amber" />
          <span>České vzory (Skloňování)</span>
        </button>

        <button className="tool-btn" onClick={onOpenStats} title="Statistiky a analýza textu">
          <BarChart3 className="tool-icon text-blue" />
          <span>Statistiky psaní</span>
        </button>

        <button className="tool-btn" onClick={onOpenExport} title="Exportovat rukopis">
          <Download className="tool-icon text-green" />
          <span>Export rukopisu</span>
        </button>

        <button className="tool-btn" onClick={onOpenSettings} title="Nastavení vzhledu a AI">
          <Settings className="tool-icon" />
          <span>Nastavení</span>
        </button>
      </div>
    </aside>
  );
}
