import React, { useState, useRef, useEffect } from "react";
import {
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Type,
  Eye,
  Edit3
} from "lucide-react";

/**
 * Calculates the caret's vertical scroll position inside a textarea.
 * Creates an off-screen mirrored element styled exactly like the textarea,
 * copies content up to the selection start, places a marker span, and measures its offset.
 */
const getSelectionScrollTop = (textarea, text, startIndex) => {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");

  const stylesToCopy = [
    "direction", "boxSizing", "paddingTop", "paddingRight",
    "paddingBottom", "paddingLeft", "fontFamily", "fontSize", "fontWeight",
    "lineHeight", "borderWidth", "borderStyle", "wordBreak", "whiteSpace", "wordWrap"
  ];

  stylesToCopy.forEach((key) => {
    mirror.style[key] = style[key];
  });

  mirror.style.position = "absolute";
  mirror.style.top = "-9999px";
  mirror.style.left = "-9999px";
  mirror.style.visibility = "hidden";
  mirror.style.overflow = "hidden";
  mirror.style.width = `${textarea.clientWidth}px`;

  // Content up to cursor
  const textBefore = text.substring(0, startIndex);
  
  // Replicate text nodes exactly
  mirror.textContent = textBefore;

  const span = document.createElement("span");
  span.textContent = "|"; // Marker
  mirror.appendChild(span);

  document.body.appendChild(mirror);
  const offsetTop = span.offsetTop;
  document.body.removeChild(mirror);

  return offsetTop;
};

export default function Editor({
  scene,
  chapterTitle,
  onContentChange,
  issues,
  onApplyFix,
  selectedIssue,
  onSelectIssue,
  focusMode,
  setFocusMode,
  fontFamily,
  setFontFamily,
  checkGrammarEnabled,
  setCheckGrammarEnabled,
  onOpenGrammarPanel
}) {
  const [viewMode, setViewMode] = useState("editor"); // 'editor' | 'annotated'
  const textareaRef = useRef(null);

  const text = scene?.content || "";
  const wordCount = React.useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);
  const charCount = text.length;
  const readingTime = React.useMemo(() => {
    return Math.ceil(wordCount / 250);
  }, [wordCount]);

  // Auto-scroll to selected issue when selected in Grammar Panel
  useEffect(() => {
    if (!selectedIssue) return;

    if (viewMode === "editor" && textareaRef.current) {
      const ta = textareaRef.current;
      ta.focus();
      setTimeout(() => {
        ta.setSelectionRange(selectedIssue.startIndex, selectedIssue.endIndex);
        try {
          const offsetTop = getSelectionScrollTop(ta, text, selectedIssue.startIndex);
          // Center the caret in the textarea
          const targetScroll = offsetTop - ta.clientHeight / 2;
          ta.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
        } catch (err) {
          console.error("Mirror scroll failed, fallback to line breaks:", err);
          const textBefore = text.substring(0, selectedIssue.startIndex);
          const lineBreaks = (textBefore.match(/\n/g) || []).length;
          const approxLineHeight = 34;
          const targetScroll = lineBreaks * approxLineHeight - ta.clientHeight / 2 + 60;
          ta.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
        }
      }, 0);
    } else if (viewMode === "annotated") {
      const markElem = document.getElementById(`issue-mark-${selectedIssue.id}`);
      if (markElem) {
        markElem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedIssue, viewMode, text]);

  if (!scene) {
    return (
      <div className="editor-empty">
        <p>Vyberte nebo vytvořte scénu v levém panelu a začněte psát svůj román.</p>
      </div>
    );
  }

  // Render annotated text view where errors are underlined and clickable
  const renderAnnotatedText = () => {
    if (!issues || issues.length === 0) {
      return <div className="annotated-content">{text}</div>;
    }

    const segments = [];
    let lastIndex = 0;

    issues.forEach((issue, idx) => {
      // Add text before issue
      if (issue.startIndex > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>{text.substring(lastIndex, issue.startIndex)}</span>
        );
      }

      // Add highlighted issue text
      const issueText = text.substring(issue.startIndex, issue.endIndex);
      const categoryClass = `issue-span issue-${issue.severity} ${selectedIssue?.id === issue.id ? "issue-selected" : ""}`;

      segments.push(
        <mark
          key={`issue-${issue.id}-${idx}`}
          id={`issue-mark-${issue.id}`}
          className={categoryClass}
          title={`${issue.name}: ${issue.message}`}
          onClick={() => {
            onSelectIssue(issue);
            onOpenGrammarPanel();
          }}
        >
          {issueText}
        </mark>
      );

      lastIndex = issue.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }

    return <div className="annotated-content">{segments}</div>;
  };

  return (
    <div className={`editor-wrapper font-${fontFamily} ${focusMode ? "focus-active" : ""}`}>
      {/* Top Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <span className="breadcrumb-chapter">{chapterTitle}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-scene">{scene.title}</span>
        </div>

        <div className="toolbar-right">
          {/* Realtime Grammar Check Toggle */}
          <button
            className={`toolbar-btn ${checkGrammarEnabled ? "active-green" : ""}`}
            onClick={() => setCheckGrammarEnabled(!checkGrammarEnabled)}
            title="Zapnout/Vypnout kontroly české gramatiky a stylu"
          >
            <Sparkles className="icon-xs" />
            <span>Korektura</span>
            {issues.length > 0 && <span className="issue-badge-count">{issues.length}</span>}
          </button>

          {/* View Mode Toggle: Write vs Proofread Highlights */}
          <div className="segmented-control">
            <button
              className={`seg-btn ${viewMode === "editor" ? "active" : ""}`}
              onClick={() => setViewMode("editor")}
              title="Psát text"
            >
              <Edit3 className="icon-xs" />
              <span>Psát</span>
            </button>
            <button
              className={`seg-btn ${viewMode === "annotated" ? "active" : ""}`}
              onClick={() => setViewMode("annotated")}
              title="Zobrazit zvýrazněné gramatické chyby"
            >
              <Eye className="icon-xs" />
              <span>Korektura ({issues.length})</span>
            </button>
          </div>

          {/* Font Selector */}
          <div className="font-selector">
            <Type className="icon-xs text-muted" />
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              <option value="literata">Literata (Knižní serif)</option>
              <option value="merriweather">Merriweather (Klasický serif)</option>
              <option value="inter">Inter (Moderní sans)</option>
            </select>
          </div>

          {/* Focus Mode Toggle */}
          <button
            className="toolbar-btn"
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? "Odejít z Režimu soustředění (Esc)" : "Režim soustředění bez rušení (Zen)"}
          >
            {focusMode ? <Minimize2 className="icon-xs" /> : <Maximize2 className="icon-xs" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="editor-canvas-container">
        {viewMode === "editor" ? (
          <textarea
            ref={textareaRef}
            className="novel-textarea"
            placeholder="Začněte psát kapitolu v češtině..."
            value={text}
            onChange={(e) => onContentChange(scene.id, e.target.value)}
            spellCheck={false}
          ></textarea>
        ) : (
          <div className="annotated-view-box">{renderAnnotatedText()}</div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="editor-statusbar">
        <div className="stat-item">
          <span>{wordCount.toLocaleString()} slov</span>
          <span className="dot">•</span>
          <span>{charCount.toLocaleString()} znaků</span>
          <span className="dot">•</span>
          <span>Cca {readingTime} min. čtení</span>
        </div>

        <div className="stat-item-right">
          {issues.length === 0 ? (
            <span className="status-ok">
              <CheckCircle2 className="icon-xs text-green" /> Bez detekovaných gramatických chyb
            </span>
          ) : (
            <button className="status-warning-btn" onClick={() => onOpenGrammarPanel()}>
              <AlertTriangle className="icon-xs text-amber" />
              <span>Nalezeno {issues.length} připomínek ke gramatice a stylu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
