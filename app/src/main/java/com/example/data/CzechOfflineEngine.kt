package com.example.data

object CzechOfflineEngine {

    fun proofread(text: String): ProofreadResponse {
        if (text.isEmpty() || text.isBlank()) {
            return ProofreadResponse(text, text, emptyList())
        }

        val issues = mutableListOf<ProofreadIssue>()
        var correctedText = text

        // 1. Double spacing
        val doubleSpaceRegex = "  +".toRegex()
        if (doubleSpaceRegex.containsMatchIn(correctedText)) {
            val matches = doubleSpaceRegex.findAll(text)
            for (match in matches) {
                issues.add(
                    ProofreadIssue(
                        original = match.value,
                        replacement = " ",
                        type = "style",
                        explanation = "Vícenásobné mezery jsou typografickou chybou. Používejte pouze jednu mezeru."
                    )
                )
            }
            correctedText = correctedText.replace(doubleSpaceRegex, " ")
        }

        // 2. Comma spacing (e.g. "slovo,druhé" -> "slovo, druhé")
        val commaSpacingRegex = "(\\p{L}+),(\\p{L}+)".toRegex()
        if (commaSpacingRegex.containsMatchIn(correctedText)) {
            val matches = commaSpacingRegex.findAll(text)
            for (match in matches) {
                val orig = match.value
                val firstWord = match.groupValues[1]
                val secondWord = match.groupValues[2]
                val repl = "$firstWord, $secondWord"
                
                issues.add(
                    ProofreadIssue(
                        original = orig,
                        replacement = repl,
                        type = "syntax",
                        explanation = "Za čárkou v češtině musí vždy následovat mezera."
                    )
                )
            }
            correctedText = commaSpacingRegex.replace(correctedText) { matchResult ->
                "${matchResult.groupValues[1]}, ${matchResult.groupValues[2]}"
            }
        }

        // 3. Period spacing (e.g. "věta.Další" -> "věta. Další")
        val periodSpacingRegex = "(\\p{L}+)\\.(\\p{Lu}\\p{L}*)".toRegex()
        if (periodSpacingRegex.containsMatchIn(correctedText)) {
            val matches = periodSpacingRegex.findAll(text)
            for (match in matches) {
                val orig = match.value
                val firstWord = match.groupValues[1]
                val secondWord = match.groupValues[2]
                val repl = "$firstWord. $secondWord"
                
                issues.add(
                    ProofreadIssue(
                        original = orig,
                        replacement = repl,
                        type = "syntax",
                        explanation = "Za tečkou na konci věty musí následovat mezera."
                    )
                )
            }
            correctedText = periodSpacingRegex.replace(correctedText) { matchResult ->
                "${matchResult.groupValues[1]}. ${matchResult.groupValues[2]}"
            }
        }

        // 4. Common Czech spelling typos and modern corrections
        val typoReplacements = listOf(
            Typos("standartní", "standardní", "spelling", "Pravopis slova 'standardní' se v češtině píše s 'd' na konci, nikoliv 't'."),
            Typos("standart", "standard", "spelling", "Pravopis slova 'standard' vyžaduje koncové písmeno 'd'."),
            Typos("vyjímka", "výjimka", "spelling", "U slova 'výjimka' se píše dlouhé 'ý' v první slabice a krátké 'i' ve druhé."),
            Typos("vyjímky", "výjimky", "spelling", "Správně píšeme 'výjimky' s dlouhým 'ý' na začátku."),
            Typos("vyjímek", "výjimek", "spelling", "Správný tvar 2. pádu množného čísla je 'výjimek'."),
            Typos("vyjímečný", "výjimečný", "spelling", "Pravopis slova 'výjimečný' začíná na 'výji-'."),
            Typos("vyjímečně", "výjimečně", "spelling", "Pravopis slova 'výjimečně' začíná na 'výji-'."),
            Typos("viz.", "viz", "style", "Slovo 'viz' není zkratka, ale rozkazovací způsob slovesa 'vidět'. Píše se proto bez tečky."),
            Typos("abysme", "abychom", "grammar", "Tvar 'abysme' je nespisovný. Ve spisovném projevu používáme výhradně tvar 'abychom'."),
            Typos("by jsme", "bychom", "grammar", "Tvar podmiňovacího způsobu 'by jsme' je nespisovný. Správně je 'bychom'."),
            Typos("bysme", "bychom", "grammar", "Hovorové 'bysme' v psaném spisovném textu nahrazujeme tvarem 'bychom'."),
            Typos("by jste", "byste", "grammar", "Tvar 'by jste' je chybný a nespisovný. Správně v podmiňovacím způsobu píšeme 'byste'."),
            Typos("měl by jsi", "měl bys", "grammar", "Tvar podmiňovacího způsobu s tykáním tvoříme koncovkou '-s' přidanou k 'by', správně je tedy 'bys' (měl bys)."),
            Typos("zůčastnit", "zúčastnit", "spelling", "Po předponách píšeme u kořene slova začínajícího na 'ú' čárku zdola nahoru 'ú' (zúčastnit se od účast)."),
            Typos("zůčastnil", "zúčastnil", "spelling", "Slovo píšeme jako 'zúčastnil' od slova 'účast'."),
            Typos("zůčastním", "zúčastním", "spelling", "Správny tvar je 'zúčastním' s čárkovaným 'ú'."),
            TyopsPattern("\\bshlédnout (film|video|představení|seriál)\\b".toRegex(RegexOption.IGNORE_CASE), "zhlédnout", "grammar", "Pro sledování filmů, divadelních her nebo videí se používá sloveso 'zhlédnout' s 'z-'."),
            Typos("potencionální", "potenciální", "spelling", "Pravopisně správný tvar je pouze 'potenciální' (odvozeno od potenciál), tvar 'potencionální' je chybný."),
            Typos("kvůly", "kvůli", "spelling", "Po L v předložce 'kvůli' píšeme měkké 'i'."),
            Typos("kůli", "kvůli", "spelling", "Slovo kůli znamená dřevěný kůl v množném čísle. Jako předložku píšeme výhradně 'kvůli'."),
            Typos("slišel", "slyšel", "spelling", "Slovo 'slyšet' patří mezi vyjmenovaná slova po L, píšeme tedy tvrdé 'y'."),
            Typos("bistrý", "bystrý", "spelling", "Vyjmenované slovo 'bystrý' píšeme s tvrdým 'y'."),
            Typos("obivatel", "obyvatel", "spelling", "Vyjmenované slovo 'obyvatel' píšeme s tvrdým 'y' po B."),
            Typos("jazik", "jazyk", "spelling", "Vyjmenované slovo 'jazyk' píšeme s tvrdým 'y'."),
            Typos("pro mně", "pro mě", "grammar", "Ve 4. pádě zájmena já používáme tvar 'mě'. Tvar 'mně' je nesprávný."),
            Typos("do mně", "do mě", "grammar", "Ve 2. pádě používáme tvar 'mě', nikoli 'mně'."),
            Typos("bez mně", "beze mě", "grammar", "Po předložce 'bez' píšeme 'beze mě' / 'beze mne'."),
            Typos("o mě", "o mně", "grammar", "V 6. pádě po předložce 'o' se píše zásadně tvar 'mně' (mluvit o mně).")
        )

        for (typo in typoReplacements) {
            if (typo is Typos) {
                val escaped = Regex.escape(typo.original)
                val patternString = if (typo.original.endsWith(".")) {
                    "(?<![\\p{L}\\p{M}])$escaped"
                } else {
                    "(?<![\\p{L}\\p{M}])$escaped(?![\\p{L}\\p{M}])"
                }
                val pattern = patternString.toRegex(RegexOption.IGNORE_CASE)
                if (pattern.containsMatchIn(correctedText)) {
                    val matches = pattern.findAll(text)
                    for (match in matches) {
                        issues.add(
                            ProofreadIssue(
                                original = match.value,
                                replacement = typo.replacement,
                                type = typo.type,
                                explanation = typo.explanation
                            )
                        )
                    }
                    correctedText = pattern.replace(correctedText, typo.replacement)
                }
            } else if (typo is TyopsPattern) {
                if (typo.pattern.containsMatchIn(correctedText)) {
                    val matches = typo.pattern.findAll(text)
                    for (match in matches) {
                        val origText = match.value
                        val replText = origText.replace("shlédnout", "zhlédnout")
                        issues.add(
                            ProofreadIssue(
                                original = origText,
                                replacement = replText,
                                type = typo.type,
                                explanation = typo.explanation
                            )
                        )
                    }
                    correctedText = typo.pattern.replace(correctedText) { matchResult ->
                        matchResult.value.replace("shlédnout", "zhlédnout")
                    }
                }
            }
        }

        // 5. Check first character of sentences is uppercase
        val sentenceStartRegex = "(^|[.!?]\\s+)(\\p{Ll})".toRegex()
        if (sentenceStartRegex.containsMatchIn(correctedText)) {
            val matches = sentenceStartRegex.findAll(text)
            for (match in matches) {
                val leadingWhitespace = match.groupValues[1]
                val lowerChar = match.groupValues[2]
                val upperChar = lowerChar.uppercase()
                
                issues.add(
                    ProofreadIssue(
                        original = lowerChar,
                        replacement = upperChar,
                        type = "grammar",
                        explanation = "Nová věta musí začínat velkým písmenem."
                    )
                )
            }
            correctedText = sentenceStartRegex.replace(correctedText) { matchResult ->
                matchResult.groupValues[1] + matchResult.groupValues[2].uppercase()
            }
        }

        val agreementIssues = CzechSubjectPredicateRules.check(text)
        issues.addAll(agreementIssues)
        for (issue in agreementIssues) {
            correctedText = correctedText.replaceFirst(issue.original, issue.replacement)
        }

        return ProofreadResponse(
            originalText = text,
            correctedText = correctedText,
            issues = issues.distinctBy { it.original }
        )
    }

    fun translate(text: String): TranslationResponse {
        if (text.isEmpty() || text.isBlank()) {
            return TranslationResponse("", emptyList(), emptyList())
        }

        val normalText = text.trim().lowercase().removeSuffix(".")
        
        val dict = mapOf(
            "hello" to Triple("Ahoj / Dobrý den", listOf(
                TranslationGrammarNote("hello", "V češtině volíme buď neformální 'Ahoj' nebo formální 'Dobrý den' podle vztahu k adresátovi.")
            ), listOf("Ahoj", "Dobrý den", "Zdravím")),
            
            "how are you" to Triple("Jak se máš?", listOf(
                TranslationGrammarNote("how are you", "Zájmeno 'se' je zvratné a váže se zde k tykání ('máš'). Pro vykání máme 'Jak se máte?'.")
            ), listOf("Jak se máš?", "Jak se máte?", "Jak to jde?")),
            
            "thank you" to Triple("Děkuji", listOf(
                TranslationGrammarNote("thank you", "Více formální verze je 'Děkuji vám' nebo zkrácené hovorové 'Díky'.")
            ), listOf("Děkuji", "Díky", "Děkuji vám")),
            
            "good morning" to Triple("Dobré ráno", listOf(
                TranslationGrammarNote("good morning", "Používá se obvykle dopoledne. Přihlíží se k rodu střednímu adjektiva 'Dobré'.")
            ), listOf("Dobré ráno", "Hezké ráno")),
            
            "please" to Triple("Prosím", listOf(
                TranslationGrammarNote("please", "Slovo 'prosím' je univerzální zdvořilostní částice používaná ve smyslu 'please' i 'you are welcome'.")
            ), listOf("Prosím", "Prosím tě", "Prosím vás"))
        )

        val found = dict[normalText]
        if (found != null) {
            return TranslationResponse(
                translatedText = found.first,
                notes = found.second,
                alternatives = found.third
            )
        }

        val words = text.split("\\s+".toRegex())
        val translatedWords = mutableListOf<String>()
        val notes = mutableListOf<TranslationGrammarNote>()

        val wordDict = mapOf(
            "i" to "já", "you" to "ty", "he" to "on", "she" to "ona", "it" to "to", "we" to "my", "they" to "oni",
            "love" to "miluji", "like" to "mám rád", "hate" to "nenávidím",
            "czech" to "čeština", "english" to "angličtina", "language" to "jazyk",
            "is" to "je", "are" to "jsou", "am" to "jsem",
            "good" to "dobrý", "bad" to "špatný", "beautiful" to "krásný",
            "welcome" to "vítejte", "friend" to "přítel", "friends" to "přátelé",
            "the" to "", "a" to "", "an" to "", "to" to "k", "and" to "a", "or" to "nebo", "but" to "ale",
            "where" to "kde", "what" to "co", "who" to "kdo", "how" to "jak", "why" to "proč",
            "my" to "můj", "your" to "tvůj", "his" to "jeho", "her" to "její", "our" to "náš",
            "name" to "jméno", "house" to "dům", "car" to "auto", "city" to "město", "world" to "svět"
        )

        for (word in words) {
            val cleanWord = word.lowercase().replace("[^a-z]".toRegex(), "")
            val trans = wordDict[cleanWord]
            if (trans != null && trans.isNotEmpty()) {
                translatedWords.add(trans)
                if (cleanWord == "love" || cleanWord == "like") {
                    notes.add(
                        TranslationGrammarNote(
                            phrase = word,
                            explanation = "V češtině vyjadřujeme kladný cit slovesem 'milovat' nebo vazbou 'mít rád'."
                        )
                    )
                }
            } else {
                translatedWords.add(word)
            }
        }

        val joinedText = translatedWords.filter { it.isNotEmpty() }.joinToString(" ")
        val finalTranslationText = joinedText.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }

        notes.add(
            TranslationGrammarNote(
                phrase = "Offline režim",
                explanation = "Byl aktivován lokální překlad, jelikož server Gemini neodpověděl. Pro plnohodnotný kontextový překlad zkontrolujte internetové připojení."
            )
        )

        return TranslationResponse(
            translatedText = finalTranslationText,
            notes = notes.distinctBy { it.phrase },
            alternatives = listOf("Tento překlad proběhl lokálně offline")
        )
    }

    open class TypoBase
    class Typos(
        val original: String,
        val replacement: String,
        val type: String,
        val explanation: String
    ) : TypoBase()

    class TyopsPattern(
        val pattern: Regex,
        val template: String,
        val type: String,
        val explanation: String
    ) : TypoBase()
}
