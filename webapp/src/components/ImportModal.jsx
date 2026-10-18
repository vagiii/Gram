import React, { useState } from "react";
import { X, Upload, FileText, Sparkles, Check, Layers, BookOpen } from "lucide-react";
import { parseManuscriptText } from "../engine/manuscriptImporter";

export default function ImportModal({ onImportManuscript, onClose }) {
  const [importMode, setImportMode] = useState("file"); // 'file' | 'paste'
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [preview, setPreview] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setRawText(content);
      generatePreview(content, customDelimiter);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text) => {
    setRawText(text);
    generatePreview(text, customDelimiter);
  };

  const generatePreview = (text, delimiter) => {
    if (!text.trim()) {
      setPreview(null);
      return;
    }
    const result = parseManuscriptText(text, { splitByHeadings: true, customDelimiter: delimiter });
    setPreview(result);
  };

  const handleConfirmImport = () => {
    if (!preview || preview.chapters.length === 0) return;
    onImportManuscript(preview.chapters);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Upload className="icon-sm text-amber" />
            <h2>Importovat rukopis a rozdělit do kapitol</h2>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {/* Import Source Mode */}
          <div className="segmented-control import-mode-selector">
            <button
              className={`seg-btn ${importMode === "file" ? "active" : ""}`}
              onClick={() => setImportMode("file")}
            >
              <Upload className="icon-xs" />
              <span>Nahrát soubor (.txt, .md)</span>
            </button>
            <button
              className={`seg-btn ${importMode === "paste" ? "active" : ""}`}
              onClick={() => setImportMode("paste")}
            >
              <FileText className="icon-xs" />
              <span>Vložit text ze schránky</span>
            </button>
          </div>

          {importMode === "file" ? (
            <div className="file-drop-zone">
              <input
                type="file"
                id="manuscript-file-input"
                accept=".txt,.md,.markdown,.html,.rtf"
                onChange={handleFileUpload}
              />
              <label htmlFor="manuscript-file-input" className="file-drop-label">
                <Upload className="icon-lg text-amber" />
                <span className="drop-title">Klikněte nebo přetáhněte rukopis sem</span>
                <span className="drop-sub">Podporované formáty: .txt, .md, .html</span>
                {fileName && <span className="selected-filename">Vybraný soubor: <strong>{fileName}</strong></span>}
              </label>
            </div>
          ) : (
            <div className="paste-area">
              <textarea
                placeholder="Vložte celý text románu sem..."
                value={rawText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={8}
              />
            </div>
          )}

          {/* Chapter Delimiter options */}
          <div className="delimiter-options-box">
            <label className="label">Nastavení rozdělení kapitol:</label>
            <input
              type="text"
              placeholder="Vlastní oddělovač (volitelné regex, např. Kapitola \d+ nebo ---)"
              value={customDelimiter}
              onChange={(e) => {
                setCustomDelimiter(e.target.value);
                generatePreview(rawText, e.target.value);
              }}
            />
            <span className="help-text">
              Automaticky detekuje označení jako <strong># Kapitola 1</strong>, <strong>Kapitola II</strong>, <strong>Část 1</strong> nebo dělicí čáry (<strong>---</strong>).
            </span>
          </div>

          {/* Live Preview */}
          {preview && (
            <div className="import-preview-card">
              <div className="preview-header">
                <Sparkles className="icon-xs text-amber" />
                <span>Nalezeno <strong>{preview.chapters.length}</strong> kapitol</span>
              </div>

              <div className="preview-chapter-list">
                {preview.chapters.map((chap, idx) => {
                  const chapWords = chap.scenes.reduce((acc, sc) => acc + (sc.content ? sc.content.split(/\s+/).length : 0), 0);
                  return (
                    <div key={idx} className="preview-chap-item">
                      <span className="chap-title">{chap.title}</span>
                      <span className="chap-meta">{chap.scenes.length} scén / {chapWords} slov</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Import Actions */}
          <div className="modal-actions-right">
            <button className="btn-cancel" onClick={onClose}>Zrušit</button>
            <button
              className="btn-primary"
              disabled={!preview || preview.chapters.length === 0}
              onClick={handleConfirmImport}
            >
              <Check className="icon-xs" /> Importovat do studia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
