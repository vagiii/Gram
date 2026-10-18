import React, { useState } from "react";
import { X, Download, FileText, Code, Printer, Copy, Check } from "lucide-react";

export default function ExportModal({ novel, onClose }) {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState("markdown"); // 'markdown' | 'txt' | 'html'

  // Generate full manuscript text in markdown
  const generateFullText = (format) => {
    let full = `# ${novel.title}\nAutor: ${novel.author}\n\n`;
    if (format === "html") {
      full = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>${novel.title}</title>\n<style>body{font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.8;} h1,h2{font-family: sans-serif; text-align: center;} p{text-indent: 1.5em; margin: 0 0 0.8em;}</style>\n</head>\n<body>\n<h1>${novel.title}</h1>\n<p style="text-align:center;"><em>Autor: ${novel.author}</em></p>\n<hr>\n`;
    }

    novel.chapters.forEach((chap) => {
      if (format === "markdown") {
        full += `\n## ${chap.title}\n\n`;
      } else if (format === "html") {
        full += `<h2>${chap.title}</h2>\n`;
      } else {
        full += `\n=== ${chap.title} ===\n\n`;
      }

      chap.scenes.forEach((sc) => {
        if (format === "markdown") {
          full += `### ${sc.title}\n\n${sc.content}\n\n`;
        } else if (format === "html") {
          const paras = sc.content.split("\n\n").map((p) => `<p>${p.trim()}</p>`).join("\n");
          full += `<h3>${sc.title}</h3>\n${paras}\n`;
        } else {
          full += `--- ${sc.title} ---\n${sc.content}\n\n`;
        }
      });
    });

    if (format === "html") {
      full += `</body>\n</html>`;
    }

    return full;
  };

  const handleDownload = () => {
    const content = generateFullText(exportFormat);
    const ext = exportFormat === "markdown" ? "md" : exportFormat === "html" ? "html" : "txt";
    const filename = `${novel.title.toLowerCase().replace(/\s+/g, "-")}.${ext}`;

    if (window.AndroidBridge?.saveTextFile) {
      window.AndroidBridge.saveTextFile(filename, content);
      return;
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const content = generateFullText(exportFormat);
    if (window.AndroidBridge?.copyText) {
      window.AndroidBridge.copyText(content);
    } else {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Download className="icon-sm text-green" />
            <h2>Export a tisk rukopisu</h2>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {/* Format selection */}
          <div className="format-selector-grid">
            <button
              className={`format-card ${exportFormat === "markdown" ? "active" : ""}`}
              onClick={() => setExportFormat("markdown")}
            >
              <Code className="format-icon" />
              <div className="format-name">Markdown (.md)</div>
              <div className="format-desc">Ideální pro další zpracování a převod</div>
            </button>

            <button
              className={`format-card ${exportFormat === "txt" ? "active" : ""}`}
              onClick={() => setExportFormat("txt")}
            >
              <FileText className="format-icon" />
              <div className="format-name">Prostý text (.txt)</div>
              <div className="format-desc">Čistý text bez značkování</div>
            </button>

            <button
              className={`format-card ${exportFormat === "html" ? "active" : ""}`}
              onClick={() => setExportFormat("html")}
            >
              <Printer className="format-icon" />
              <div className="format-name">HTML / Tiskový náhled</div>
              <div className="format-desc">Naformátovaný dokument ke čtení a tisku</div>
            </button>
          </div>

          {/* Action buttons */}
          <div className="export-actions-row">
            <button className="btn-primary" onClick={handleDownload}>
              <Download className="icon-xs" /> Stáhnout soubor
            </button>

            <button className="btn-secondary" onClick={handleCopy}>
              {copied ? <Check className="icon-xs text-green" /> : <Copy className="icon-xs" />}
              <span>{copied ? "Zkopírováno do schránky!" : "Zkopírovat text"}</span>
            </button>

            <button className="btn-secondary" onClick={handlePrint}>
              <Printer className="icon-xs" /> Vytisknout / Uložit jako PDF
            </button>
          </div>

          {/* Preview Box */}
          <div className="export-preview-container">
            <div className="preview-label">Náhled exportu:</div>
            <pre className="export-preview-code">{generateFullText(exportFormat)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}




