import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  X,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCheck
} from "lucide-react";
import { GRAMMAR_CATEGORIES } from "../engine/czechGrammarRules";
import { STYLE_CATEGORIES } from "../engine/czechStyleRules";

export default function GrammarPanel({
  issues,
  onApplyFix,
  onSelectIssue,
  selectedIssueId,
  onClose
}) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  // A new analysis should be visible in full; don't leave the user looking at
  // only the repetition category after switching scenes or changing the text.
  useEffect(() => {
    setActiveCategoryFilter("all");
  }, [issues]);

  // Auto-scroll the selected issue card inside the panel scroll area
  useEffect(() => {
    if (!selectedIssueId) return;
    const card = document.getElementById(`issue-card-${selectedIssueId}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedIssueId]);

  const filteredIssues = issues.filter((issue) => {
    if (activeCategoryFilter === "all") return true;
    if (activeCategoryFilter === "grammar") {
      return (
        issue.category === GRAMMAR_CATEGORIES.AGREEMENT.id ||
        issue.category === GRAMMAR_CATEGORIES.PRONOUNS.id ||
        issue.category === GRAMMAR_CATEGORIES.PREPOSITIONS.id ||
        issue.category === GRAMMAR_CATEGORIES.ORTHOGRAPHY.id
      );
    }
    if (activeCategoryFilter === "punctuation") {
      return issue.category === GRAMMAR_CATEGORIES.PUNCTUATION.id;
    }
    if (activeCategoryFilter === "style") {
      return (
        issue.category === STYLE_CATEGORIES.FILLER.id ||
        issue.category === STYLE_CATEGORIES.PLEONASM.id ||
        issue.category === STYLE_CATEGORIES.REGISTER.id
      );
    }
    if (activeCategoryFilter === "repetition") {
      return issue.category === STYLE_CATEGORIES.REPETITION.id;
    }
    return true;
  });

  return (
    <div className="grammar-panel">
      {/* Panel Header */}
      <div className="grammar-panel-header">
        <div className="title-row">
          <Sparkles className="icon-sm text-amber" />
          <h3>Kontrola české gramatiky a stylu</h3>
          <span className="issue-count-badge">{issues.length}</span>
        </div>

        {issues.filter((i) => i.suggestions && i.suggestions.length > 0).length > 0 && (
          <button
            className="fix-all-btn"
            onClick={() => {
              const fixable = issues.filter((i) => i.suggestions && i.suggestions.length > 0);
              const sorted = [...fixable].sort((a, b) => b.startIndex - a.startIndex);
              sorted.forEach((issue) => {
                onApplyFix(issue, issue.suggestions[0]);
              });
            }}
            title="Automaticky opravit všechny problémy s dostupným návrhem"
          >
            <CheckCheck className="icon-xs" />
            <span>Opravit vše ({issues.filter((i) => i.suggestions && i.suggestions.length > 0).length})</span>
          </button>
        )}

        {onClose && (
          <button className="icon-btn-close" onClick={onClose} title="Zavřít panel">
            <X className="icon-sm" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="grammar-filter-bar">
        <button
          className={`filter-chip ${activeCategoryFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveCategoryFilter("all")}
        >
          Vše ({issues.length})
        </button>
        <button
          className={`filter-chip ${activeCategoryFilter === "grammar" ? "active" : ""}`}
          onClick={() => setActiveCategoryFilter("grammar")}
        >
          Gramatika
        </button>
        <button
          className={`filter-chip ${activeCategoryFilter === "punctuation" ? "active" : ""}`}
          onClick={() => setActiveCategoryFilter("punctuation")}
        >
          Interpunkce
        </button>
        <button
          className={`filter-chip ${activeCategoryFilter === "style" ? "active" : ""}`}
          onClick={() => setActiveCategoryFilter("style")}
        >
          Stylistika
        </button>
        <button
          className={`filter-chip ${activeCategoryFilter === "repetition" ? "active" : ""}`}
          onClick={() => setActiveCategoryFilter("repetition")}
        >
          Opakování
        </button>
      </div>

      {/* Issues List */}
      <div className="grammar-issues-scroll">
        {filteredIssues.length === 0 ? (
          <div className="no-issues-state">
            <CheckCheck className="icon-lg text-green" />
            <p className="no-issues-title">Všechno vypadá skvěle!</p>
            <p className="no-issues-subtitle">
              V této části rukopisu nebyly v vybrané kategorii nalezeny žádné mluvnické ani stylistické chyby.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isSelected = selectedIssueId === issue.id;

            return (
              <div
                key={issue.id}
                id={`issue-card-${issue.id}`}
                className={`issue-card severity-${issue.severity} ${isSelected ? "selected-card" : ""}`}
                onClick={() => onSelectIssue(issue)}
              >
                <div className="card-top">
                  <span className={`category-tag category-${issue.category}`}>
                    {issue.name}
                  </span>

                  {issue.severity === "error" && <AlertCircle className="icon-xs text-red" />}
                  {issue.severity === "warning" && <AlertTriangle className="icon-xs text-amber" />}
                  {issue.severity === "style" && <Info className="icon-xs text-blue" />}
                </div>

                <div className="issue-text-comparison">
                  <div className="original-box">
                    <span className="label">Původní text:</span>
                    <span className="bad-word">„{issue.originalText}“</span>
                  </div>

                  {issue.suggestions && issue.suggestions.length > 0 && (
                    <div className="suggestion-box">
                      <span className="label">Doporučená oprava:</span>
                      {issue.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          className="fix-btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyFix(issue, sug);
                          }}
                        >
                          <Check className="icon-xs" />
                          <span>Nahradit za: <strong>„{sug}“</strong></span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rule-explanation">
                  <HelpCircle className="icon-xs text-muted" />
                  <span>{issue.message || issue.explanation}</span>
                </div>

                {issue.explanation && issue.message !== issue.explanation && (
                  <div className="rule-deep-tip">
                    <strong>Pravidlo:</strong> {issue.explanation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
