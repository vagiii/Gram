import React from "react";
import { X, Settings, Palette, Type } from "lucide-react";

export default function SettingsModal({
  theme,
  setTheme,
  fontFamily,
  setFontFamily,
  onClose
}) {
  const themes = [
    { id: "obsidian", name: "Obsidian Night", desc: "Tmavý obsidian s jantarovými prvky (doporučeno)", bg: "#0f172a", accent: "#f59e0b" },
    { id: "parchment", name: "Warm Parchment", desc: "Teplý papírový podklad v sepiovém tónu", bg: "#fefbcf", accent: "#78350f" },
    { id: "emerald", name: "Emerald Ink", desc: "Tmavá smaragdová noc s jasným svitem", bg: "#064e3b", accent: "#34d399" },
    { id: "sapphire", name: "Midnight Sapphire", desc: "Hluboká safírová modř", bg: "#0f172a", accent: "#38bdf8" }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Settings className="icon-sm" />
            <h2>Nastavení Bohemica Studio</h2>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {/* Theme Palette Options */}
          <div className="settings-section">
            <h3><Palette className="icon-xs text-amber" /> Vzhled a Téma studia</h3>
            <div className="theme-grid">
              {themes.map((t) => (
                <div
                  key={t.id}
                  className={`theme-card ${theme === t.id ? "active" : ""}`}
                  onClick={() => setTheme(t.id)}
                >
                  <div className="theme-preview-dot" style={{ backgroundColor: t.bg, borderColor: t.accent }}></div>
                  <div className="theme-info">
                    <div className="theme-name">{t.name}</div>
                    <div className="theme-desc">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography options */}
          <div className="settings-section">
            <h3><Type className="icon-xs text-blue" /> Písmo pro psaní románu</h3>
            <div className="font-options-row">
              <button
                className={`font-card ${fontFamily === "literata" ? "active" : ""}`}
                onClick={() => setFontFamily("literata")}
              >
                <span className="font-title font-literata">Literata</span>
                <span className="font-sub">Moderní serif určený pro beletrii</span>
              </button>

              <button
                className={`font-card ${fontFamily === "merriweather" ? "active" : ""}`}
                onClick={() => setFontFamily("merriweather")}
              >
                <span className="font-title font-merriweather">Merriweather</span>
                <span className="font-sub">Tradiční knižní typografie</span>
              </button>

              <button
                className={`font-card ${fontFamily === "inter" ? "active" : ""}`}
                onClick={() => setFontFamily("inter")}
              >
                <span className="font-title font-inter">Inter</span>
                <span className="font-sub">Čistý bezpatkový font</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


