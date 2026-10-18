/**
 * Complex Czech Grammar Rules Engine (Bohemica Studio)
 * Rule definitions for orthography, subject-predicate agreement, pronouns, prepositions, and punctuation.
 */

export const GRAMMAR_CATEGORIES = {
  AGREEMENT: { id: "agreement", name: "Shoda přísudku s podmětem", color: "#e11d48" },
  PRONOUNS: { id: "pronouns", name: "Zájmena (Mě/Mně, Ji/Jí, Ni/Ní)", color: "#9333ea" },
  PREPOSITIONS: { id: "prepositions", name: "Předložky a předpony (S/Z)", color: "#d97706" },
  ORTHOGRAPHY: { id: "orthography", name: "Vyjmenovaná slova a pravopis", color: "#0284c7" },
  PUNCTUATION: { id: "punctuation", name: "Česká interpunkce", color: "#059669" }
};

export const CZECH_GRAMMAR_RULES = [
  // --- SHODA PŘÍSUDKU S PODMĚTEM ---
  {
    id: "AGR-001",
    category: GRAMMAR_CATEGORIES.AGREEMENT.id,
    severity: "error",
    name: "Shoda: Ženský rod v mn. č. (-ly vs -li)",
    explanation: "Pokud je podmět v množném čísle rodu ženského (např. dívky, ženy, matky, dětí), v příčestí činném píšeme tvrdé Y (přišly, viděly). Koncovka -li se používá pouze pro rod mužský životný.",
    check: (sentence) => {
      const regex = /(?<![\p{L}\p{N}_])(dívky|ženy|matky|sestry|učitelky|kolegyně|kamarádky|dětí|postavy|vlny|hvězdy|zbraně|otázky)(?![\p{L}\p{N}_])\s+([^.!?]*?)(?<![\p{L}\p{N}_])([\p{L}]+li)(?![\p{L}\p{N}_])/giu;
      const matches = [];
      let match;
      while ((match = regex.exec(sentence.text)) !== null) {
        const verb = match[3];
        // Replace ending -li with -ly
        const suggestion = verb.slice(0, -2) + "ly";
        matches.push({
          startIndex: sentence.startIndex + match.index + match[0].length - verb.length,
          endIndex: sentence.startIndex + match.index + match[0].length,
          originalText: verb,
          fullMatchText: match[0],
          suggestions: [suggestion],
          message: `Podmět '${match[1]}' je rodu ženského (nebo stř. v pl. dětí). Správná koncovka slovesa je '${suggestion}'.`
        });
      }
      return matches;
    }
  },

  {
    id: "AGR-002",
    category: GRAMMAR_CATEGORIES.AGREEMENT.id,
    severity: "error",
    name: "Shoda: Mužský životný rod v mn. č. (-li vs -ly)",
    explanation: "Je-li v podmětu alespoň jedno podstatné jméno rodu mužského životného (např. chlapci, muži, lidé, psi, voáci), píšeme v příčestí minulém měkké I (přišli, viděli, bojovali).",
    check: (sentence) => {
      const regex = /(?<![\p{L}\p{N}_])(chlapci|muži|lidé|kluci|otcové|bratři|učitelé|spisovatelé|hrdinové|páni|vojáci|psi|lékaři)(?![\p{L}\p{N}_])\s+([^.!?]*?)(?<![\p{L}\p{N}_])([\p{L}]+ly)(?![\p{L}\p{N}_])/giu;
      const matches = [];
      let match;
      while ((match = regex.exec(sentence.text)) !== null) {
        const verb = match[3];
        const suggestion = verb.slice(0, -2) + "li";
        matches.push({
          startIndex: sentence.startIndex + match.index + match[0].length - verb.length,
          endIndex: sentence.startIndex + match.index + match[0].length,
          originalText: verb,
          fullMatchText: match[0],
          suggestions: [suggestion],
          message: `Podmět '${match[1]}' je rodu mužského životného. Správná koncovka slovesa je měkké '${suggestion}'.`
        });
      }
      return matches;
    }
  },

  {
    id: "AGR-003",
    category: GRAMMAR_CATEGORIES.AGREEMENT.id,
    severity: "error",
    name: "Shoda: Střední rod v mn. č. (-la vs -li/-ly)",
    explanation: "Podmět rodu středního v množném čísle (např. města, okna, auta, slova, dívčata) vyžaduje koncovku příčestí minulého -la (města stála, slova zazněla).",
    check: (sentence) => {
      const regex = /(?<![\p{L}\p{N}_])(města|okna|auta|slova|díla|zvířata|kuřata|dívčata|srdce|údolí)(?![\p{L}\p{N}_])\s+([^.!?]*?)(?<![\p{L}\p{N}_])([\p{L}]+(?:li|ly))(?![\p{L}\p{N}_])/giu;
      const matches = [];
      let match;
      while ((match = regex.exec(sentence.text)) !== null) {
        const verb = match[3];
        const suggestion = verb.slice(0, -2) + "la";
        matches.push({
          startIndex: sentence.startIndex + match.index + match[0].length - verb.length,
          endIndex: sentence.startIndex + match.index + match[0].length,
          originalText: verb,
          fullMatchText: match[0],
          suggestions: [suggestion],
          message: `Podmět '${match[1]}' je rodu středního v mn. čísle. Sloveso má mít koncovku '${suggestion}'.`
        });
      }
      return matches;
    }
  },

  // --- ZÁJMENA (MĚ / MNĚ, JI / JÍ, NI / NÍ) ---
  {
    id: "PRN-001",
    category: GRAMMAR_CATEGORIES.PRONOUNS.id,
    severity: "error",
    name: "Psaní Mě / Mně po slovesech (2./4. pád = mě, 3./6. pád = mně)",
    explanation: "Pomůcka: Zaskloňujte si zájmeno 'ty/tobě' nebo 'vašeho/vám'. Pokud můžete říct 'tě / tebe' (2. a 4. pád), píše se MĚ (2 písmena). Pokud 'tobě' (3. a 6. pád), píše se MNĚ (3 písmena); ve 3. pádě se běžně používá také krátké MI.",
    check: (sentence) => {
      const matches = [];
      // 4th case verbs expecting MĚ (e.g. vidí mě, miluje mě, překvapil mě, zná mě, slyší mě, viděl mně -> error)
      const verb4thWithMne = /(?<![\p{L}\p{N}_])(vidí|viděl|miluje|miloval|slyší|slyšel|zná|znal|opustil|překvapil|sleduje|sledoval|objal|napadl|zabil|potkal)(?![\p{L}\p{N}_])\s+(mně)(?![\p{L}\p{N}_])/giu;
      let m;
      while ((m = verb4thWithMne.exec(sentence.text)) !== null) {
        const mneText = m[2];
        matches.push({
          startIndex: sentence.startIndex + m.index + m[0].length - mneText.length,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: mneText,
          suggestions: ["mě"],
          message: `Po slovesu '${m[1]}' následuje 4. pád (koho/co -> tě/mě). Správný tvar je 'mě'. Pomůcka: Vidí mě (tě).`
        });
      }

      // 3rd case verbs expecting MNĚ (e.g. řekl mě, pomohl mě, rozumí mě, věří mě, napsal mě -> error)
      const verb3rdWithMe = /(?<![\p{L}\p{N}_])(říká|řekl|řekla|řekli|řekly|řeklo|pomohl|pomohla|pomohli|pomáhá|pomáhal|rozumí|rozuměl|rozuměla|věří|věřil|věřila|napsal|napsala|předal|předala|popřál|popřála|daroval|darovala|odpustil|odpustila|zavolal|zavolala)(?![\p{L}\p{N}_])\s+(mě)(?![\p{L}\p{N}_])/giu;
      while ((m = verb3rdWithMe.exec(sentence.text)) !== null) {
        const meText = m[2];
        matches.push({
          startIndex: sentence.startIndex + m.index + m[0].length - meText.length,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: meText,
          suggestions: ["mi", "mně"],
          message: `Po slovesu '${m[1]}' následuje 3. pád. Běžně se píše 'mi'; důrazné 'mně' je také správně.`
        });
      }

      // Prepositions expecting MĚ (pro mě, přes mě, za mě, ob mě, beze mě) vs MNĚ (o mně, v mně, při mně, ke mně, díky mně)
      const prep4thWithMne = /(?<![\p{L}\p{N}_])(pro|přes|beze|ob|za)(?![\p{L}\p{N}_])\s+(mně)(?![\p{L}\p{N}_])/giu;
      while ((m = prep4thWithMne.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[2],
          suggestions: ["mě"],
          message: `Po předložce '${m[1]}' (4. pád) se píše 'mě'. (např. pro mě / pro tebe).`
        });
      }

      const prep6thWithMe = /(?<![\p{L}\p{N}_])(o|v|ve|při|ke|díky)(?![\p{L}\p{N}_])\s+(mě)(?![\p{L}\p{N}_])/giu;
      while ((m = prep6thWithMe.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[2],
          suggestions: ["mně"],
          message: `Po předložce '${m[1]}' (3. nebo 6. pád) se píše 'mně'. (např. o mně / o tobě).`
        });
      }

      return matches;
    }
  },

  {
    id: "PRN-002",
    category: GRAMMAR_CATEGORIES.PRONOUNS.id,
    severity: "error",
    name: "Psaní Ji / Jí (Krátké vs Dlouhé í)",
    explanation: "Pomůcka: Nahraďte si ukazovacím zájmenem 'tu / té'. Pokud říkáte 'tu' (4. pád), píše se 'ji'. Pokud 'té' (3. a 6. pád), píše se 'jí'.",
    check: (sentence) => {
      const matches = [];
      // 4th case verb with long 'jí' (viděl jí, miluje jí, znal jí -> should be 'ji')
      const verb4thWithJiLong = /(?<![\p{L}\p{N}_])(vidí|viděl|miluje|miloval|slyší|slyšel|zná|znal|opustil|objal|políbil|sleduje|sledoval|potkal)(?![\p{L}\p{N}_])\s+(jí)(?![\p{L}\p{N}_])/giu;
      let m;
      while ((m = verb4thWithJiLong.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[2],
          suggestions: ["ji"],
          message: `Po slovesu '${m[1]}' následuje 4. pád (viděl TU -> ji). Píše se krátké 'ji'.`
        });
      }

      // 3rd case verb with short 'ji' (říká ji, řekl ji, věří ji -> should be 'jí')
      // Limit this to verbs that require a dative object; verbs such as "podat"
      // and "napsat" can take an accusative "ji" and are ambiguous without context.
      const verb3rdWithJiShort = /(?<![\p{L}\p{N}_])(říká|řekl|pomohl|pomáhá|rozumí|rozuměl|věří|věřil|odpustil|odpustila|popřál|popřála)(?![\p{L}\p{N}_])\s+(ji)(?![\p{L}\p{N}_])/giu;
      while ((m = verb3rdWithJiShort.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[2],
          suggestions: ["jí"],
          message: `Po slovesu '${m[1]}' následuje 3. pád (řekl TÉ -> jí). Píše se dlouhé 'jí'.`
        });
      }
      return matches;
    }
  },

  {
    id: "PRN-003",
    category: GRAMMAR_CATEGORIES.PRONOUNS.id,
    severity: "error",
    name: "Psaní Ni / Ní po předložkách",
    explanation: "Po předložkách se zájmeno 'ona' mění na tvary začínající n- (pro ni, bez ní, o ní). Krátké 'ni' je ve 4. pádě (pro ni = pro tu), dlouhé 'ní' v 2., 3. a 6. pádě (bez ní, o ní).",
    check: (sentence) => {
      const matches = [];
      // pro ní, přes ní, za ní (4th case) -> should be 'ni'
      const prep4thWithNiLong = /(?<![\p{L}\p{N}_])(pro|přes)(?![\p{L}\p{N}_])\s+(ní)(?![\p{L}\p{N}_])/giu;
      let m;
      while ((m = prep4thWithNiLong.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[2],
          suggestions: ["ni"],
          message: `Předložka '${m[1]}' se pojí se 4. pádem. Správný tvar je krátké 'ni' (např. pro ni).`
        });
      }

      // bez ni, do ni, u ni, o ni, v ni (6th/2nd case) -> should be 'ní'
      const prep26WithNiShort = /(?<![\p{L}\p{N}_])(bez|do|u|od|k|ke|o|v|ve|při)(?![\p{L}\p{N}_])\s+(ni)(?![\p{L}\p{N}_])/giu;
      while ((m = prep26WithNiShort.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[2],
          suggestions: ["ní"],
          message: `Předložka '${m[1]}' vyžaduje tvar 'ní' s dlouhým í (např. bez ní, o ní).`
        });
      }
      return matches;
    }
  },

  // --- PŘEDLOŽKY A PŘEDPONY S / Z ---
  {
    id: "PREP-001",
    category: GRAMMAR_CATEGORIES.PREPOSITIONS.id,
    severity: "error",
    name: "Předložka S se 7. pádem vs Z s 2. pádem",
    explanation: "Předložka S (SE) se pojí výhradně se 7. pádem (s kým, s čím: s přáteli, s radostí). Předložka Z (ZE) se pojí s 2. pádem (z koho, z čeho: z domu, z oblohy).",
    check: (sentence) => {
      const matches = [];
      // 'z' + 7th case pronoun/adjective (e.g. z mojí sestrou, z přáteli, z radostí, z ním, z nimi -> error)
      const zWith7th = /\b(z|ze)\s+([a-žA-Ž]*?(?:ou|em|ami|mi|ním|němi|přáteli|radostí))\b/gi;
      let m;
      while ((m = zWith7th.exec(sentence.text)) !== null) {
        // Exclude 2nd case false positives like "z jihu", "z dumu", "z celého srdce"
        const word = m[2].toLowerCase();
        if (["sestrou", "matkou", "ženou", "přáteli", "radostí", "ním", "nimi", "čím", "kým", "bratrancem"].includes(word) || word.endsWith("ami") || word.endsWith("mi")) {
          const prep = m[1].toLowerCase() === "ze" ? "se" : "s";
          matches.push({
            startIndex: sentence.startIndex + m.index,
            endIndex: sentence.startIndex + m.index + m[1].length,
            originalText: m[1],
            suggestions: [m[1] === m[1].toUpperCase() ? prep.toUpperCase() : prep],
            message: `Slovo '${m[2]}' je v 7. pádě (s kým/čím). Předložka má být '${prep}'.`
          });
        }
      }

      // 's' + 2nd case nouns (e.g. s domu, s oblohy, s lavičky -> error)
      const sWith2nd = /\b(s|se)\s+(domu|oblohy|lavičky|stolu|nebe|země|postele|okna|školy|práce|České republiky)\b/gi;
      while ((m = sWith2nd.exec(sentence.text)) !== null) {
        const prep = m[1].toLowerCase() === "se" ? "ze" : "z";
        matches.push({
          startIndex: sentence.startIndex + m.index,
          endIndex: sentence.startIndex + m.index + m[1].length,
          originalText: m[1],
          suggestions: [m[1] === m[1].toUpperCase() ? prep.toUpperCase() : prep],
          message: `Výraz '${m[2]}' vyjadřuje směr z povrchu pryč nebo 2. pád (z čeho). Správná předložka je '${prep}'.`
        });
      }
      return matches;
    }
  },

  // --- VYJMENOVANÁ SLOVA A ČASTÉ PRAVOPISNÉ CHYBY ---
  {
    id: "ORT-001",
    category: GRAMMAR_CATEGORIES.ORTHOGRAPHY.id,
    severity: "error",
    name: "Časté pravopisné záměny (bít/být, mít/mýt, nabít/nabýt)",
    explanation: "Zkontrolujte význam homofonních slov: bít (tlouct) vs být (existovat); mýt (umývat) vs mít (vlastnit); nabít (zbraň/baterii) vs nabýt (majetek/zkušenosti).",
    check: (sentence) => {
      const matches = [];
      // "chci tam bít" -> být
      const bitVsByt = /\b(chci|bude|musí|může|chceš)\s+(bít)\b/gi;
      let m;
      while ((m = bitVsByt.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[2],
          suggestions: ["být"],
          message: "Ve významu existovat/nacházet se píšeme tvrdé Y ('být'). Tvar 'bít' znamená tlouct."
        });
      }

      // "jdu si mít ruce" -> mýt
      const mitVsMyt = /\b(jdu\s+si|jít\s+si|šel\s+si|šla\s+si|šli\s+si|chci\s+si|musím\s+si)\s+(mít)\b/gi;
      while ((m = mitVsMyt.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[2],
          suggestions: ["mýt"],
          message: "Ve významu umývat/čistit se píšeme tvrdé Y ('mýt'). Tvar 'mít' znamená vlastnit."
        });
      }

      // "nabýt telefon" -> nabít
      const nabytTelefon = /\b(nabýt)\s+(?:(?:novou|vybitou|slabou)\s+)?(telefon|baterii|mobil|zbraň|akumulátor)\b/gi;
      while ((m = nabytTelefon.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index,
          endIndex: sentence.startIndex + m.index + 5,
          originalText: m[1],
          suggestions: ["nabít"],
          message: "Baterii nebo zbraň 'nabíjíme' (měkké Í - 'nabít'). Tvar 'nabýt' znamená získat (např. majetek)."
        });
      }

      // "zpývat" -> zpívat
      const zpyvat = /\b(zpývat|zpýval|zpývala|zpývali)\b/gi;
      while ((m = zpyvat.exec(sentence.text)) !== null) {
        const correct = m[1].replace(/zpý/gi, "zpí");
        matches.push({
          startIndex: sentence.startIndex + m.index,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[1],
          suggestions: [correct],
          message: "Slovo 'zpívat' nepatří mezi vyjmenovaná slova. Píše se v něm měkké Í."
        });
      }

      return matches;
    }
  },

  // --- INTERPUNKCE (PUNCTUATION) ---
  {
    id: "PNC-001",
    category: GRAMMAR_CATEGORIES.PUNCTUATION.id,
    severity: "warning",
    name: "Chybějící čárka před podřadicí spojkou / zájmenem",
    explanation: "Vedlejší větu obvykle oddělujeme od řídící čárkou. Setkají-li se vedle sebe dva spojovací výrazy patřící různým větám (např. 'že pokud'), čárka se zpravidla píše jen před prvním.",
    check: (sentence) => {
      const matches = [];
      // Match word boundary without a comma before sub-conjunctions
      const regex = /([^,\s\n!?:;—–])\s+(že|aby|abych|abys|abychom|abyšte|protože|jelikož|když|pokud|jakmile|ačkoliv|přestože|zatímco|který|která|které|kteří|kterého|kterému|jenž|jež)(?![\p{L}\p{N}_])/giu;
      let m;
      while ((m = regex.exec(sentence.text)) !== null) {
        const conj = m[2];
        const conjunctionStart = m.index + m[1].length + 1;
        const precedingText = sentence.text.slice(0, conjunctionStart);
        // When two subordinate conjunctions meet, the comma belongs before
        // the first conjunction, not between them: "řekl, že pokud...".
        if (/(?:^|\s)(?:že|aby|abych|abys|abychom|abyšte|protože|jelikož|když|pokud|jakmile|ačkoliv|přestože|zatímco)\s*$/i.test(precedingText)) continue;
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: conj,
          suggestions: [`, ${conj}`],
          message: `Před podřadicí spojkou nebo vztažným zájmenem '${conj}' chybí čárka oddělující věty v souvětí.`
        });
      }
      return matches;
    }
  },

  {
    id: "PNC-002",
    category: GRAMMAR_CATEGORIES.PUNCTUATION.id,
    severity: "warning",
    name: "Chybějící čárka před odporovací spojkou (ale, avšak, však, nýbrž)",
    explanation: "Před odporovacími a stupňovacími spojkami (ale, avšak, však, nýbrž, leč) se v češtině píše čárka.",
    check: (sentence) => {
      const matches = [];
      const regex = /([^,\s\n!?:;—–])\s+\b(ale|avšak|však|nýbrž|leč)\b/gi;
      let m;
      while ((m = regex.exec(sentence.text)) !== null) {
        const conj = m[2];
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: conj,
          suggestions: [`, ${conj}`],
          message: `Před odporovací spojkou '${conj}' má být napsána čárka.`
        });
      }
      return matches;
    }
  },

  // --- ADDITIONAL ORTHOGRAPHY ---
  {
    id: "ORT-002",
    category: GRAMMAR_CATEGORIES.ORTHOGRAPHY.id,
    severity: "error",
    name: "Záměna psaní ú / ů",
    explanation: "Kroužkované ů se píše uvnitř a na konci slov (domů, dům, průvodce). Na začátku slov se píše čárkované ú (úkol, úroveň, území).",
    check: (sentence) => {
      const matches = [];
      const wrongU = /\b(urad|urok|uzemi|ustav|uplne|uprimne|uroven|utulek|uzky)\b/gi;
      let m;
      while ((m = wrongU.exec(sentence.text)) !== null) {
        const word = m[1];
        const corrected = word.charAt(0) === 'U' ? 'Ú' + word.slice(1) : 'ú' + word.slice(1);
        matches.push({
          startIndex: sentence.startIndex + m.index,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: word,
          suggestions: [corrected],
          message: `Na začátku slova se píše čárkované 'ú'. Správně: '${corrected}'.`
        });
      }
      return matches;
    }
  },

  {
    id: "ORT-003",
    category: GRAMMAR_CATEGORIES.ORTHOGRAPHY.id,
    severity: "error",
    name: "Záměna byt / být (obydlí vs existovat)",
    explanation: "Ve významu existovat/stát se se píše 'být' (s háčkem). 'Byt' znamená obydlí.",
    check: (sentence) => {
      const matches = [];
      const bytVsByt = /\b(chtěl|mohl|měl|musel|dokázal)\s+(byt)\b/gi;
      let m;
      while ((m = bytVsByt.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index + m[1].length + 1,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[2],
          suggestions: ["být"],
          message: `Ve významu existovat/stát se se píše 'být' (s háčkem). 'Byt' znamená obydlí.`
        });
      }
      return matches;
    }
  },

  {
    id: "ORT-004",
    category: GRAMMAR_CATEGORIES.ORTHOGRAPHY.id,
    severity: "error",
    name: "Chybějící háček ve slově dospělci",
    explanation: "Podstatné jméno dospělec se píše s háčkem: dospělci.",
    check: (sentence) => {
      const regex = /\bdospelci\b/gi;
      const matches = [];
      let match;
      while ((match = regex.exec(sentence.text)) !== null) {
        const suggestion = match[0][0] === match[0][0].toUpperCase() ? "Dospělci" : "dospělci";
        matches.push({
          startIndex: sentence.startIndex + match.index,
          endIndex: sentence.startIndex + match.index + match[0].length,
          originalText: match[0],
          suggestions: [suggestion],
          message: "Ve slově 'dospělci' se píše ě."
        });
      }
      return matches;
    }
  },

  {
    id: "AGR-004",
    category: GRAMMAR_CATEGORIES.AGREEMENT.id,
    severity: "error",
    name: "Pádová vazba: lidských dětí",
    explanation: "Po přídavném jménu v 2. pádě množného čísla 'lidských' následuje tvar 'dětí'.",
    check: (sentence) => {
      const regex = /\b(lidských)\s+(děti)\b/gi;
      const matches = [];
      let match;
      while ((match = regex.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + match.index,
          endIndex: sentence.startIndex + match.index + match[0].length,
          originalText: match[0],
          suggestions: [`${match[1]} dětí`],
          message: "Ve spojení 'lidských dětí' musí být podstatné jméno ve 2. pádě: dětí."
        });
      }
      return matches;
    }
  },

  // --- ADDITIONAL PUNCTUATION ---
  {
    id: "PNC-003",
    category: GRAMMAR_CATEGORIES.PUNCTUATION.id,
    severity: "warning",
    name: "Dvojitá mezera v textu",
    explanation: "V typograficky správném textu se nepoužívají dvojité mezery.",
    check: (sentence) => {
      const matches = [];
      const regex = /  +/g;
      let m;
      while ((m = regex.exec(sentence.text)) !== null) {
        matches.push({
          startIndex: sentence.startIndex + m.index,
          endIndex: sentence.startIndex + m.index + m[0].length,
          originalText: m[0],
          suggestions: [" "],
          message: "Text obsahuje dvojitou (nebo vícenásobnou) mezeru. Odstraňte ji."
        });
      }
      return matches;
    }
  }
];
