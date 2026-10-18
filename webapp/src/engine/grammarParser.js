/**
 * Main Grammar & Style Analyzer Engine for Czech Prose (Bohemica Studio)
 * Tokenizes manuscript text into paragraphs & sentences, computes exact offsets,
 * and runs rules in real time.
 */

import { CZECH_GRAMMAR_RULES } from "./czechGrammarRules";
import { CZECH_STYLE_RULES, checkWordRepetitions } from "./czechStyleRules";

/**
 * Splits text into sentences while tracking exact character offsets.
 */
export function tokenizeSentences(text) {
  const sentences = [];
  // Split by sentence terminators (. ! ?) followed by space/quote/newline or end of text
  const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
  let match;
  while ((match = sentenceRegex.exec(text)) !== null) {
    const raw = match[0];
    if (raw.trim().length > 0) {
      sentences.push({
        text: raw,
        startIndex: match.index,
        endIndex: match.index + raw.length
      });
    }
  }
  return sentences;
}

// Severity priority for deduplication
const SEVERITY_PRIORITY = { error: 3, warning: 2, style: 1 };

/**
 * Analyzes full manuscript text and returns sorted, deduplicated list of detected issues.
 */
export function analyzeCzechText(text, options = { checkGrammar: true, checkStyle: true, checkRepetitions: true }) {
  if (!text || typeof text !== "string" || text.length < 10) return [];

  const sentences = tokenizeSentences(text);
  const issues = [];

  // 1. Run Grammar Rules (using for-of for performance)
  if (options.checkGrammar) {
    for (const rule of CZECH_GRAMMAR_RULES) {
      for (const sentence of sentences) {
        const found = rule.check(sentence);
        for (const issue of found) {
          issues.push({
            id: `${rule.id}-${issue.startIndex}`,
            ruleId: rule.id,
            category: rule.category,
            severity: rule.severity,
            name: rule.name,
            explanation: rule.explanation,
            ...issue
          });
        }
      }
    }
  }

  // 2. Run Style Rules
  if (options.checkStyle) {
    for (const rule of CZECH_STYLE_RULES) {
      for (const sentence of sentences) {
        const found = rule.check(sentence);
        for (const issue of found) {
          issues.push({
            id: `${rule.id}-${issue.startIndex}`,
            ruleId: rule.id,
            category: rule.category,
            severity: rule.severity,
            name: rule.name,
            explanation: rule.explanation,
            ...issue
          });
        }
      }
    }
  }

  // 3. Run Word Repetition Check
  if (options.checkRepetitions) {
    const repIssues = checkWordRepetitions(text);
    issues.push(...repIssues);
  }

  // Sort issues by start index to maintain linear editor highlighting order
  issues.sort((a, b) => a.startIndex - b.startIndex);

  // Deduplicate overlapping issues at same position (keep highest severity)
  const deduped = [];
  const seen = new Map();
  for (const issue of issues) {
    const key = `${issue.startIndex}-${issue.endIndex}`;
    if (seen.has(key)) {
      const existing = seen.get(key);
      if ((SEVERITY_PRIORITY[issue.severity] || 0) > (SEVERITY_PRIORITY[existing.severity] || 0)) {
        const idx = deduped.indexOf(existing);
        if (idx !== -1) deduped[idx] = issue;
        seen.set(key, issue);
      }
    } else {
      deduped.push(issue);
      seen.set(key, issue);
    }
  }

  return deduped;
}
