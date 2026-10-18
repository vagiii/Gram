/**
 * Czech Lore & Entity Extraction Engine (Bohemica Studio)
 * Scans novel manuscript text to discover characters, locations, and key items for the Codex.
 */

// Common Czech words that start with capital letters at sentence beginnings but are NOT proper names
const COMMON_SENTENCE_STARTERS = new Set([
  "Všichni", "Jednou", "Tehdy", "Potom", "Když", "Pokud", "Protože", "Jestliže", "Zatímco",
  "Ale", "Avšak", "Nebo", "Tady", "Tamtéž", "Každý", "Několik", "Mnoho", "Dnes", "Zítra",
  "Včera", "Najednou", "Možná", "Zřejmě", "Byl", "Byla", "Bylo", "Byly", "Měl", "Měla",
  "Měli", "Řekl", "Řekla", "Podíval", "Podívala", "Šel", "Šla", "Šli", "Vzal", "Vzala",
  "Tento", "Tato", "Toto", "Tyto", "Jak", "Co", "Kdo", "Kde", "Kam", "Kdy", "Proč"
]);

export function extractLoreFromManuscript(novelData) {
  let fullText = "";
  novelData.chapters.forEach((chap) => {
    chap.scenes.forEach((sc) => {
      fullText += sc.content + "\n\n";
    });
  });

  if (!fullText.trim()) return [];

  const candidates = [];
  const candidateMap = new Map();

  // 1. CHARACTER PATTERNS (Postavy)
  // Titles: Inspektor, pan, paní, doktor, profesorka, slečna, otče, král, kapitán + Name
  const characterTitleRegex = /\b(inspektor|inspektorka|doktor|doktorka|profesor|profesorka|pan|paní|slečna|otec|otče|kapitán|král|královna|hrabě|hraběnka)\s+([A-ZĚŠČŘŽÝÁÍÉÓÚŮĎŤŇ][a-žěščřžýáíéóúůďťň]+(?:\s+[A-ZĚŠČŘŽÝÁÍÉÓÚŮĎŤŇ][a-žěščřžýáíéóúůďťň]+)?)/g;
  let m;
  while ((m = characterTitleRegex.exec(fullText)) !== null) {
    const title = m[1];
    const name = m[2];
    const fullName = `${title.charAt(0).toUpperCase() + title.slice(1)} ${name}`;
    addOrUpdateCandidate(candidateMap, fullName, "Postavy", m.input, m.index);
  }

  // Two-word Proper Names (e.g. Klára Marešová, Václav Havlíček)
  const doubleNameRegex = /\b([A-ZĚŠČŘŽÝÁÍÉÓÚŮĎŤŇ][a-žěščřžýáíéóúůďťň]+)\s+([A-ZĚŠČŘŽÝÁÍÉÓÚŮĎŤŇ][a-žěščřžýáíéóúůďťň]+)\b/g;
  while ((m = doubleNameRegex.exec(fullText)) !== null) {
    const name1 = m[1];
    const name2 = m[2];
    if (!COMMON_SENTENCE_STARTERS.has(name1) && !COMMON_SENTENCE_STARTERS.has(name2)) {
      const fullName = `${name1} ${name2}`;
      addOrUpdateCandidate(candidateMap, fullName, "Postavy", m.input, m.index);
    }
  }

  // 2. LOCATION PATTERNS (Místa)
  // Locations with prepositions (v Klementinu, na Malé Straně, do Starého Města, u Vltavy)
  const locationPrepRegex = /\b(v|ve|na|do|u|ze|z|k|ke)\s+([A-ZĚŠČŘŽÝÁÍÉÓÚŮĎŤŇ][a-žěščřžýáíéóúůďťň]+(?:\s+[A-ZĚŠČŘŽÝÁÍÉÓÚŮĎŤŇa-žěščřžýáíéóúůďťň]+)?)/g;
  while ((m = locationPrepRegex.exec(fullText)) !== null) {
    const prep = m[1];
    const locName = m[2];

    // Filter out common proper names or sentence starters
    if (
      !COMMON_SENTENCE_STARTERS.has(locName) &&
      !locName.includes("Pan") &&
      !locName.includes("Inspektor") &&
      locName.length > 3
    ) {
      addOrUpdateCandidate(candidateMap, locName, "Místa", m.input, m.index);
    }
  }

  // 3. KEY ITEMS PATTERNS (Předměty)
  // Adjective + Noun item mentions (stříbrná dýka, šifrovací astroláb, tajemný dopis, starý rukopis)
  const itemRegex = /\b(stříbrn[ýáé]|tajemn[ýáé]|zlat[ýáé]|šifrovací|starobyl[ýáé]|kouzeln[ýáé]|alchymistick[ýáé])\s+([a-žěščřžýáíéóúůďťň]{4,})\b/gi;
  while ((m = itemRegex.exec(fullText)) !== null) {
    const itemFull = `${m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase()} ${m[2].toLowerCase()}`;
    addOrUpdateCandidate(candidateMap, itemFull, "Předměty", m.input, m.index);
  }

  // Convert map to sorted candidates array
  const result = Array.from(candidateMap.values()).sort((a, b) => b.count - a.count);
  return result;
}

function addOrUpdateCandidate(map, name, category, fullText, matchIndex) {
  const cleanName = name.trim();
  if (cleanName.length < 3) return;

  const key = `${category}:${cleanName.toLowerCase()}`;

  if (map.has(key)) {
    const existing = map.get(key);
    existing.count += 1;
  } else {
    // Extract context sentence surrounding the match
    const sentenceStart = Math.max(0, fullText.lastIndexOf(".", matchIndex) + 1);
    let sentenceEnd = fullText.indexOf(".", matchIndex + cleanName.length);
    if (sentenceEnd === -1) sentenceEnd = fullText.length;

    const snippet = fullText.substring(sentenceStart, sentenceEnd).trim();

    map.set(key, {
      id: `lore-candidate-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      category: category,
      count: 1,
      snippet: snippet || `Nalezeno v rukopisu.`
    });
  }
}
