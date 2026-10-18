import React from "react";
import { X, BarChart3, Clock, BookOpen, Layers, Award } from "lucide-react";

export default function StatsModal({ novel, onClose }) {
  let totalWords = 0;
  let totalChars = 0;
  let totalScenes = 0;
  const chapterBreakdown = [];

  novel.chapters.forEach((chap) => {
    let chapWords = 0;
    chap.scenes.forEach((sc) => {
      totalScenes++;
      const words = sc.content.trim() ? sc.content.trim().split(/\s+/).length : 0;
      chapWords += words;
      totalChars += sc.content.length;
    });
    totalWords += chapWords;
    chapterBreakdown.push({ title: chap.title, words: chapWords });
  });

  const progressPercent = Math.min(100, Math.round((totalWords / novel.targetWordCount) * 100));
  const readingTimeMin = Math.ceil(totalWords / 200);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <BarChart3 className="icon-sm text-blue" />
            <h2>Analýza a statistiky rukopisu</h2>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {/* Key Metric Cards Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <BookOpen className="stat-icon text-amber" />
              <div className="stat-value">{totalWords.toLocaleString()}</div>
              <div className="stat-label">Celkem slov v románu</div>
            </div>

            <div className="stat-card">
              <Award className="stat-icon text-green" />
              <div className="stat-value">{progressPercent}%</div>
              <div className="stat-label">Splněno z cíle ({novel.targetWordCount.toLocaleString()})</div>
            </div>

            <div className="stat-card">
              <Clock className="stat-icon text-purple" />
              <div className="stat-value">{readingTimeMin} min.</div>
              <div className="stat-label">Odhadovaná doba čtení</div>
            </div>

            <div className="stat-card">
              <Layers className="stat-icon text-blue" />
              <div className="stat-value">{novel.chapters.length} kap. / {totalScenes} scén</div>
              <div className="stat-label">Struktura rukopisu</div>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="goal-banner">
            <div className="goal-labels">
              <span>Postup psaní románu</span>
              <span><strong>{totalWords}</strong> / {novel.targetWordCount} slov</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Chapter Breakdown List */}
          <div className="chapter-stats-list">
            <h3>Rozpad podle kapitol</h3>
            {chapterBreakdown.map((chap, idx) => (
              <div key={idx} className="chap-stat-row">
                <span className="chap-stat-name">{chap.title}</span>
                <span className="chap-stat-words">{chap.words.toLocaleString()} slov</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
