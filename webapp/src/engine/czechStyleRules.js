/**
 * Czech Literary Style & Novel Proofreading Rules (Bohemica Studio)
 * Rules for fiction writing: Tautology/repetition, filler words, pleonasms, and dialogue register.
 */

export const STYLE_CATEGORIES = {
  REPETITION: { id: "repetition", name: "Opakování slov (Tautologie)", color: "#eab308" },
  FILLER: { id: "filler", name: "Vycpávková slova a balast", color: "#f97316" },
  PLEONASM: { id: "pleonasm", name: "Pleonazmy a stylistická klišé", color: "#8b5cf6" },
  REGISTER: { id: "register", name: "Obecná vs Spisovná čeština", color: "#06b6d4" }
};

// Common Czech filler words that weaken literary prose
const FILLER_WORDS = [
  { word: "jakoby", explanation: "Slovo 'jakoby' oslabuje tvůrčí přirovnání a působí alibisticky. Zvažte jeho odstranění nebo nahrazení přesnějším výrazem." },
  { word: "vlastně", explanation: "Vycpávkové slovo 'vlastně' nepřidává větě žádnou informační hodnotu." },
  { word: "prostě", explanation: "Hovorový balast 'prostě' do vypravěčského textu románu většinou nepatří (vyjma přímé řeči)." },
  { word: "jaksi", explanation: "Slovo 'jaksi' vnáší do věty neurčitost." },
  { word: "tak nějak", explanation: "Vágní formulace 'tak nějak' oslabuje dojem z narativu." },
  { word: "více méně", explanation: "Neužívejte nadbytečné 'více méně'." },
  { word: "viceméně", explanation: "Neužívejte nadbytečné 'viceméně'." },
  { word: "v podstatě", explanation: "Vycpávkové slovo 'v podstatě' často nepřidává textu žádnou informační hodnotu." },
  { word: "v zásadě", explanation: "Fráze 'v zásadě' působí v próze nerozhodně a nekonkrétně." },
  { word: "tak trochu", explanation: "Vágní formulace 'tak trochu' oslabuje sílu vyprávění." },
  { word: "docela", explanation: "Slovo 'docela' oslabuje tvrzení. V próze je často nadbytečné." }
];

// Common pleonasms in Czech prose
const PLEONASMS = [
  { pattern: /\b(zcela\s+a\s+úplně)\b/gi, suggestion: "úplně", explanation: "Pleonazmus: 'Zcela' a 'úplně' mají totožný význam." },
  { pattern: /\b(hlavní\s+protagonista|hlavní\s+protagonisté)\b/gi, suggestion: "protagonista", explanation: "Pleonazmus: Slovo 'protagonista' již ze své podstaty znamená hlavní postavu." },
  { pattern: /\b(krátký\s+okamžik)\b/gi, suggestion: "okamžik", explanation: "Okamžik je ze své podstaty krátký." },
  { pattern: /\b(znovu\s+opakoval|znovu\s+zopakoval)\b/gi, suggestion: "zopakoval", explanation: "Opakovat již znamená dělat něco znovu." },
  { pattern: /\b(vynechat\s+pryč)\b/gi, suggestion: "vynechat", explanation: "Slovo 'pryč' je zde nadbytečné." },
  { pattern: /\b(dohromady\s+spolu)\b/gi, suggestion: "spolu", explanation: "Slova 'dohromady' a 'spolu' vyjadřují týž význam." },
  { pattern: /\b(stoupat\s+nahoru|stoupat\s+vzhůru)\b/gi, suggestion: "stoupat", explanation: "Stoupat již implikuje směr nahoru." },
  { pattern: /\b(klesat\s+dolů)\b/gi, suggestion: "klesat", explanation: "Klesat již implikuje směr dolů." },
  { pattern: /\b(velký\s+obr)\b/gi, suggestion: "obr", explanation: "Obr je ze své podstaty velký." },
  { pattern: /\b(tichý\s+šepot)\b/gi, suggestion: "šepot", explanation: "Šepot je ze své podstaty tichý." }
];

// Czech colloquialisms (Obecná čeština markers)
const COLLOQUIAL_PATTERNS = [
  { pattern: /\b(\w+ej|hnedka|tenhle|tamhle|koukat|barák|prachy)\b/gi, explanation: "Hovorový výraz (Obecná čeština). Pokud nestojí v přímé řeči postav, v uměleckém vyprávění se doporučuje spisovný tvar." },
  { pattern: /\b(s\s+\w+ma|se\s+\w+ma)\b/gi, explanation: "Hovorový koncovkový tvar 7. pádu mn. č. (-ma místo -mi/-ami). Vhodné do přímé řeči, v autorském vypravěči se vyhýbejte." }
];

export const CZECH_STYLE_RULES = [
  // 1. FILLER WORDS FINDER
  {
    id: "STY-001",
    category: STYLE_CATEGORIES.FILLER.id,
    severity: "style",
    name: "Vycpávková slova (jakoby, vlastně, prostě)",
    check: (sentence) => {
      const matches = [];
      FILLER_WORDS.forEach(({ word, explanation }) => {
        const regex = new RegExp(`\\b(${word})\\b`, "gi");
        let m;
        while ((m = regex.exec(sentence.text)) !== null) {
          matches.push({
            startIndex: sentence.startIndex + m.index,
            endIndex: sentence.startIndex + m.index + m[0].length,
            originalText: m[1],
            suggestions: [],
            message: explanation
          });
        }
      });
      return matches;
    }
  },

  // 2. PLEONASMS
  {
    id: "STY-002",
    category: STYLE_CATEGORIES.PLEONASM.id,
    severity: "style",
    name: "Pleonazmy a redundantní výrazy",
    check: (sentence) => {
      const matches = [];
      PLEONASMS.forEach(({ pattern, suggestion, explanation }) => {
        let m;
        while ((m = pattern.exec(sentence.text)) !== null) {
          matches.push({
            startIndex: sentence.startIndex + m.index,
            endIndex: sentence.startIndex + m.index + m[0].length,
            originalText: m[1],
            suggestions: [suggestion],
            message: explanation
          });
        }
      });
      return matches;
    }
  },

  // 3. REGISTER & DIALOGUE CHECK
  {
    id: "STY-003",
    category: STYLE_CATEGORIES.REGISTER.id,
    severity: "style",
    name: "Hovorové výrazy mimo přímou řeč",
    check: (sentence) => {
      // If sentence is enclosed in quotation marks „...“, skip (dialogue is allowed to be colloquial)
      const isDialogue = /^[„"'].*[“"']$/.test(sentence.text.trim());
      if (isDialogue) return [];

      const matches = [];
      COLLOQUIAL_PATTERNS.forEach(({ pattern, explanation }) => {
        let m;
        while ((m = pattern.exec(sentence.text)) !== null) {
          matches.push({
            startIndex: sentence.startIndex + m.index,
            endIndex: sentence.startIndex + m.index + m[0].length,
            originalText: m[1],
            suggestions: [],
            message: explanation
          });
        }
      });
      return matches;
    }
  }
];

/**
 * Detects word repetitions in prose within a specified text block.
 * Ignores common short stop-words (a, i, v, z, na, do, že, se, si, to).
 */
export function checkWordRepetitions(fullText) {
  const STOP_WORDS = new Set([
    "a", "i", "o", "u", "v", "z", "s", "k", "se", "si", "na", "do", "za", "po", "od",
    "že", "to", "ta", "ten", "ty", "ti", "je", "jsou", "byl", "byla", "bylo", "byly",
    "jako", "jak", "ale", "nebo", "než", "jen", "až", "ani", "už"
  ]);

  const words = [];
  const wordRegex = /[a-žA-Ž0-9ěščřžýáíéóúůďťňĚŠČŘŽÝÁÍÉÓÚŮĎŤŇ]+/g;
  let match;
  while ((match = wordRegex.exec(fullText)) !== null) {
    const raw = match[0];
    const lower = raw.toLowerCase();
    if (lower.length >= 4 && !STOP_WORDS.has(lower)) {
      words.push({
        text: raw,
        lower: lower,
        startIndex: match.index,
        endIndex: match.index + raw.length
      });
    }
  }

  const issues = [];
  // Sliding window of 40 words
  const WINDOW_SIZE = 40;
  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    for (let j = Math.max(0, i - WINDOW_SIZE); j < i; j++) {
      const prev = words[j];
      if (current.lower === prev.lower) {
        issues.push({
          id: `REP-${current.startIndex}`,
          category: STYLE_CATEGORIES.REPETITION.id,
          severity: "style",
          name: "Opakování slova v blízkém textu",
          startIndex: current.startIndex,
          endIndex: current.endIndex,
          originalText: current.text,
          suggestions: [],
          message: `Slovo '${current.text}' se opakuje v těsné blízkosti (před ${i - j} slovíčky). Zvažte synonymum.`
        });
        break; // Only report once per word instance
      }
    }
  }

  return issues;
}
