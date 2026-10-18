import React, { useState } from "react";
import { Users, MapPin, Package, StickyNote, Plus, Search, Trash2, Edit2, Check, X, Sparkles, Wand2, CheckCheck } from "lucide-react";
import { extractLoreFromManuscript } from "../engine/loreExtractor";

export default function CodexPanel({ novel, codex, onAddEntry, onDeleteEntry, onUpdateEntry }) {
  const [activeCategory, setActiveCategory] = useState("Postavy");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [extractedCandidates, setExtractedCandidates] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // New entry form state
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const categories = [
    { id: "Postavy", label: "Postavy", icon: Users },
    { id: "Místa", label: "Místa", icon: MapPin },
    { id: "Předměty", label: "Předměty", icon: Package },
    { id: "Poznámky", label: "Poznámky", icon: StickyNote }
  ];

  const filteredEntries = codex.filter((item) => {
    const matchesCat = item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.role && item.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddEntry({
      id: `codex-${Date.now()}`,
      category: activeCategory,
      name: newName,
      role: newRole,
      description: newDesc
    });
    setNewName("");
    setNewRole("");
    setNewDesc("");
    setIsAdding(false);
  };

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditName(entry.name);
    setEditRole(entry.role || "");
    setEditDesc(entry.description || "");
  };

  const saveEditing = (id) => {
    onUpdateEntry(id, {
      name: editName,
      role: editRole,
      description: editDesc
    });
    setEditingId(null);
  };

  // Run Lore Extraction Engine on current novel text
  const handleRunLoreExtraction = () => {
    setIsExtracting(true);
    const candidates = extractLoreFromManuscript(novel);

    // Filter out candidates that are already present in Codex
    const codexNameSet = new Set(codex.map((c) => c.name.toLowerCase()));
    const freshCandidates = candidates.filter((cand) => !codexNameSet.has(cand.name.toLowerCase()));

    setExtractedCandidates(freshCandidates);
    setIsExtracting(false);
  };

  // Add extracted candidate into Codex with 1-click
  const handleAddExtractedCandidate = (cand) => {
    onAddEntry({
      id: `codex-ext-${Date.now()}`,
      category: cand.category,
      name: cand.name,
      role: `Extrahováno z textu (nalezeno ${cand.count}x)`,
      description: cand.snippet
    });

    // Remove candidate from local extracted list
    setExtractedCandidates((prev) => prev.filter((c) => c.id !== cand.id));
  };

  return (
    <div className="codex-panel">
      <div className="codex-header">
        <div className="codex-title">
          <Users className="icon-sm text-purple" />
          <h2>Postavy a Svět (Codex)</h2>
        </div>
        <div className="codex-header-actions">
          <button
            className="btn-secondary-sm"
            onClick={handleRunLoreExtraction}
            title="Automaticky prohledat rukopis a najít jména postav, místa a předměty"
          >
            <Wand2 className="icon-xs text-amber" />
            <span>Extrahovat Lore z textu</span>
          </button>
          <button className="btn-primary-sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="icon-xs" />
            <span>Přidat ručně</span>
          </button>
        </div>
      </div>

      {/* Extracted Lore Suggestions Banner */}
      {extractedCandidates !== null && (
        <div className="extracted-lore-banner">
          <div className="extracted-header">
            <div className="title">
              <Sparkles className="icon-xs text-amber" />
              <span>Nalezené položky v rukopisu ({extractedCandidates.length})</span>
            </div>
            <button className="icon-btn-close" onClick={() => setExtractedCandidates(null)}>
              <X className="icon-xs" />
            </button>
          </div>

          {extractedCandidates.length === 0 ? (
            <p className="no-lore-msg">Žádné nové neznámé postavy ani místa nebyly v textu nalezeny.</p>
          ) : (
            <div className="extracted-cards-grid">
              {extractedCandidates.slice(0, 8).map((cand) => (
                <div key={cand.id} className="extracted-cand-card">
                  <div className="cand-top">
                    <span className="cand-name">{cand.name}</span>
                    <span className="cand-cat">{cand.category} ({cand.count}x)</span>
                  </div>
                  <p className="cand-snippet">„...{cand.snippet}...“</p>
                  <button className="btn-add-cand" onClick={() => handleAddExtractedCandidate(cand)}>
                    <Plus className="icon-xs" /> Přidat do Codexu
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="codex-category-tabs">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = codex.filter((c) => c.category === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`codex-tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat.id);
                setIsAdding(false);
              }}
            >
              <Icon className="icon-xs" />
              <span>{cat.label} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="codex-search-box">
        <Search className="icon-xs text-muted" />
        <input
          type="text"
          placeholder={`Hledat v kategorií ${activeCategory}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery("")}>
            <X className="icon-xs" />
          </button>
        )}
      </div>

      {/* Add New Entry Form */}
      {isAdding && (
        <form className="codex-add-form" onSubmit={handleCreate}>
          <h3>Nová položka ({activeCategory})</h3>
          <input
            type="text"
            placeholder="Jméno / Název..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
          />
          <input
            type="text"
            placeholder="Role / Podnázev (např. Důstojník, Historická budova)..."
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          />
          <textarea
            placeholder="Popis, historie, povaha nebo charakteristika..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={3}
          />
          <div className="form-actions">
            <button type="submit" className="btn-save">Uložit položku</button>
            <button type="button" className="btn-cancel" onClick={() => setIsAdding(false)}>Zrušit</button>
          </div>
        </form>
      )}

      {/* Entry Cards List */}
      <div className="codex-entries-grid">
        {filteredEntries.length === 0 ? (
          <div className="codex-empty">
            <p>Žádná položka v kategorií „{activeCategory}“.</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="codex-card">
              {editingId === entry.id ? (
                <div className="codex-edit-box">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Jméno..."
                  />
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="Role..."
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Popis..."
                  />
                  <div className="form-actions">
                    <button className="btn-save" onClick={() => saveEditing(entry.id)}>
                      <Check className="icon-xs" /> Uložit
                    </button>
                    <button className="btn-cancel" onClick={() => setEditingId(null)}>
                      <X className="icon-xs" /> Storno
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="codex-card-header">
                    <div>
                      <h4 className="entry-name">{entry.name}</h4>
                      {entry.role && <span className="entry-role">{entry.role}</span>}
                    </div>

                    <div className="codex-card-actions">
                      <button title="Upravit" onClick={() => startEditing(entry)}>
                        <Edit2 className="icon-xs" />
                      </button>
                      <button
                        title="Smazat"
                        onClick={() => {
                          if (confirm(`Opravdu smazat "${entry.name}"?`)) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                      >
                        <Trash2 className="icon-xs text-red" />
                      </button>
                    </div>
                  </div>

                  {entry.description && <p className="entry-desc">{entry.description}</p>}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
