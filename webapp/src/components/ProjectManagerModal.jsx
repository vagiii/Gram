import React, { useState, useRef } from "react";
import {
  FolderOpen,
  Plus,
  Trash2,
  X,
  BookMarked,
  Upload,
  Download,
  Calendar,
  FileText,
  Target,
  Edit3,
  Check
} from "lucide-react";

const GENRES = [
  "Historický román",
  "Detektivní příběh",
  "Fantasy / Sci-fi",
  "Romantický román",
  "Thriller",
  "Povídková sbírka",
  "Autobiografie",
  "Jiné"
];

export default function ProjectManagerModal({ projects, activeProjectId, onSelectProject, onCreateProject, onDeleteProject, onImportProject, onClose }) {
  const [view, setView] = useState("list"); // 'list' | 'create'
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newGenre, setNewGenre] = useState("Historický román");
  const [newTarget, setNewTarget] = useState(50000);
  const [editingId, setEditingId] = useState(null);
  const importRef = useRef(null);

  const getTotalWords = (project) => {
    return project.chapters.reduce((acc, chap) => {
      return acc + chap.scenes.reduce((sAcc, sc) => {
        return sAcc + (sc.content.trim() ? sc.content.trim().split(/\s+/).length : 0);
      }, 0);
    }, 0);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const id = `proj-${Date.now()}`;
    onCreateProject({
      id,
      title: newTitle.trim(),
      author: newAuthor.trim() || "Neznámý autor",
      genre: newGenre,
      targetWordCount: Number(newTarget) || 50000,
      dailyGoal: 1000,
      chapters: [
        {
          id: `chap-${Date.now()}`,
          title: "Kapitola 1",
          scenes: [{ id: `scene-${Date.now()}`, title: "Scéna 1", content: "" }]
        }
      ],
      codex: [],
      createdAt: new Date().toISOString()
    });
    setNewTitle("");
    setNewAuthor("");
    setNewGenre("Historický román");
    setNewTarget(50000);
    setView("list");
  };

  const handleExport = (project) => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}_bohemica.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (!parsed.title || !parsed.chapters) {
          alert("Soubor není platný Bohemica projekt.");
          return;
        }
        const newProj = {
          ...parsed,
          id: `proj-import-${Date.now()}`,
          createdAt: parsed.createdAt || new Date().toISOString()
        };
        onImportProject(newProj);
      } catch {
        alert("Nelze načíst soubor – neplatný formát JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("cs-CZ", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <BookMarked className="icon-sm text-amber" />
            <h2>Správce projektů</h2>
            <span className="issue-count-badge">{projects.length}</span>
          </div>
          <div className="pm-header-actions">
            <button className="pm-import-btn" onClick={() => importRef.current?.click()} title="Importovat projekt ze souboru">
              <Upload className="icon-xs" />
              <span>Import</span>
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImportFile} />
            <button className="icon-btn-close" onClick={onClose}>
              <X className="icon-sm" />
            </button>
          </div>
        </div>

        <div className="modal-body pm-body">
          {view === "list" ? (
            <>
              {/* Project Cards Grid */}
              <div className="pm-projects-grid">
                {projects.map((proj) => {
                  const words = getTotalWords(proj);
                  const pct = Math.min(100, Math.round((words / (proj.targetWordCount || 50000)) * 100));
                  const isActive = proj.id === activeProjectId;

                  return (
                    <div
                      key={proj.id}
                      className={`pm-card ${isActive ? "pm-card-active" : ""}`}
                      onClick={() => { onSelectProject(proj.id); onClose(); }}
                    >
                      <div className="pm-card-top">
                        <div className="pm-card-icon">
                          <BookMarked className="icon-sm" />
                        </div>
                        {isActive && <span className="pm-active-badge">Aktivní</span>}
                      </div>

                      <h3 className="pm-card-title">{proj.title}</h3>
                      <p className="pm-card-author">{proj.author}</p>
                      {proj.genre && <p className="pm-card-genre">{proj.genre}</p>}

                      <div className="pm-card-stats">
                        <span className="pm-stat">
                          <FileText className="icon-xs" />
                          {words.toLocaleString()} slov
                        </span>
                        <span className="pm-stat">
                          <Target className="icon-xs" />
                          Cíl: {(proj.targetWordCount || 50000).toLocaleString()}
                        </span>
                        <span className="pm-stat">
                          <Calendar className="icon-xs" />
                          {formatDate(proj.createdAt)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="pm-progress-wrap">
                        <div className="pm-progress-labels">
                          <span>{pct}% splněno</span>
                          <span>{proj.chapters?.length || 0} kap.</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pm-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="pm-open-btn"
                          onClick={() => { onSelectProject(proj.id); onClose(); }}
                        >
                          <FolderOpen className="icon-xs" />
                          Otevřít
                        </button>
                        <button
                          className="pm-export-btn"
                          title="Exportovat projekt jako JSON zálohu"
                          onClick={() => handleExport(proj)}
                        >
                          <Download className="icon-xs" />
                        </button>
                        {projects.length > 1 && (
                          <button
                            className="pm-delete-btn"
                            title="Smazat projekt"
                            onClick={() => {
                              if (confirm(`Opravdu smazat projekt „${proj.title}"? Tato akce je nevratná.`)) {
                                onDeleteProject(proj.id);
                              }
                            }}
                          >
                            <Trash2 className="icon-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* New Project Tile */}
                <div className="pm-card pm-card-new" onClick={() => setView("create")}>
                  <Plus className="pm-new-icon" />
                  <span className="pm-new-label">Nový projekt</span>
                </div>
              </div>
            </>
          ) : (
            /* Create New Project Form */
            <form className="pm-create-form" onSubmit={handleCreate}>
              <h3>Nový projekt románu</h3>

              <div className="pm-form-group">
                <label>Název románu *</label>
                <input
                  type="text"
                  placeholder="Např. Stíny nad Prahou"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="pm-form-group">
                <label>Autor</label>
                <input
                  type="text"
                  placeholder="Jméno autora"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                />
              </div>

              <div className="pm-form-group">
                <label>Žánr</label>
                <select value={newGenre} onChange={(e) => setNewGenre(e.target.value)}>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="pm-form-group">
                <label>Cíl počtu slov</label>
                <div className="pm-target-row">
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                  />
                  <span className="pm-target-hint">slov (typický román: 50 000–100 000)</span>
                </div>
              </div>

              <div className="pm-form-actions">
                <button type="submit" className="btn-primary">
                  <Check className="icon-xs" /> Vytvořit projekt
                </button>
                <button type="button" className="btn-secondary" onClick={() => setView("list")}>
                  Zpět
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
