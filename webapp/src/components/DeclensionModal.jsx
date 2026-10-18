import React, { useState } from "react";
import { NOUN_PARADIGMS, CASE_NAMES } from "../engine/czechParadigms";
import { X, BookOpen, Sparkles } from "lucide-react";

export default function DeclensionModal({ onClose }) {
  const [activeGender, setActiveGender] = useState("masculine_animate");
  const [selectedParadigm, setSelectedParadigm] = useState(NOUN_PARADIGMS.masculine_animate[0]);

  const genderTabs = [
    { id: "masculine_animate", label: "Mužský životný" },
    { id: "masculine_inanimate", label: "Mužský neživotný" },
    { id: "feminine", label: "Ženský rod" },
    { id: "neuter", label: "Střední rod" }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content declension-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles className="icon-sm text-amber" />
            <h2>Příručka českých vzorů a skloňování</h2>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {/* Gender selection */}
          <div className="gender-tabs">
            {genderTabs.map((g) => (
              <button
                key={g.id}
                className={`gender-btn ${activeGender === g.id ? "active" : ""}`}
                onClick={() => {
                  setActiveGender(g.id);
                  setSelectedParadigm(NOUN_PARADIGMS[g.id][0]);
                }}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Paradigm Selection */}
          <div className="paradigm-chips">
            {NOUN_PARADIGMS[activeGender].map((p) => (
              <button
                key={p.name}
                className={`paradigm-chip ${selectedParadigm.name === p.name ? "active" : ""}`}
                onClick={() => setSelectedParadigm(p)}
              >
                Vzor: <strong>{p.name}</strong>
              </button>
            ))}
          </div>

          {/* Selected Paradigm Info Card */}
          <div className="paradigm-info-banner">
            <div>
              <h3>Vzor {selectedParadigm.name}</h3>
              <p className="paradigm-type">{selectedParadigm.type}</p>
            </div>
            <div className="paradigm-example">
              <span>Příklady slov:</span> <strong>{selectedParadigm.example}</strong>
            </div>
          </div>

          {/* 7 Cases Table (Skloňování v jednotném a množném čísle) */}
          <div className="declension-table-wrapper">
            <table className="declension-table">
              <thead>
                <tr>
                  <th>Pád</th>
                  <th>Jednotné číslo (Sg)</th>
                  <th>Množné číslo (Pl)</th>
                </tr>
              </thead>
              <tbody>
                {CASE_NAMES.map((caseName, idx) => (
                  <tr key={idx}>
                    <td className="case-name">{caseName}</td>
                    <td className="case-form">
                      <strong>{selectedParadigm.cases.sg[idx]}</strong>
                    </td>
                    <td className="case-form">
                      <strong>{selectedParadigm.cases.pl[idx]}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
