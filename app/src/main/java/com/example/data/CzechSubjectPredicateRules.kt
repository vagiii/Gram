package com.example.data

import java.util.Locale

/**
 * Conservative offline checks for common plural Czech past-tense agreement.
 * Unknown nouns and complex sentence structures are intentionally left alone.
 */
internal object CzechSubjectPredicateRules {
    private enum class AgreementClass { MASCULINE_ANIMATE, NON_MASCULINE_ANIMATE, NEUTER }
    private data class Token(val text: String, val start: Int, val end: Int)

    private val tokenPattern = Regex("[\\p{L}\\p{M}]+")
    private const val MAX_SUBJECT_DISTANCE = 6

    private val subjectClasses: Map<String, AgreementClass> = buildMap {
        add(AgreementClass.MASCULINE_ANIMATE, "muži", "chlapci", "studenti", "učitelé", "kamarádi",
            "bratři", "otcové", "dědečkové", "páni", "lidé", "hosté", "kolegové", "hráči",
            "vojáci", "psi", "voli", "sousedé", "češi", "slováci", "turisté", "řidiči",
            "doktoři", "fotbalisté", "hokejisté", "oni")
        add(AgreementClass.NON_MASCULINE_ANIMATE, "ženy", "dívky", "studentky", "učitelky",
            "kamarádky", "sestry", "matky", "babičky", "kočky", "stromy", "domy", "hrady",
            "sešity", "telefony", "vlaky", "děti", "ony")
        add(AgreementClass.NEUTER, "auta", "města", "okna", "slova", "zvířata", "kuřata", "děvčata")
    }

    private fun MutableMap<String, AgreementClass>.add(
        agreementClass: AgreementClass,
        vararg subjects: String,
    ) {
        subjects.forEach { put(it, agreementClass) }
    }

    fun check(text: String): List<ProofreadIssue> {
        val tokens = tokenPattern.findAll(text)
            .map { Token(it.value, it.range.first, it.range.last + 1) }
            .toList()
        if (tokens.isEmpty()) return emptyList()

        val issues = mutableListOf<ProofreadIssue>()
        for (verbIndex in tokens.indices) {
            val verb = tokens[verbIndex]
            val actualClass = participleClass(verb.text) ?: continue
            val expectedClass = expectedClass(text, tokens, verbIndex) ?: continue
            if (actualClass == expectedClass) continue

            val replacement = replaceEnding(verb.text, expectedClass)
            if (replacement != verb.text) {
                issues += ProofreadIssue(
                    original = verb.text,
                    replacement = replacement,
                    type = "grammar",
                    explanation = explanation(expectedClass),
                )
            }
        }
        return issues
    }

    private fun expectedClass(text: String, tokens: List<Token>, verbIndex: Int): AgreementClass? {
        val verb = tokens[verbIndex]

        // A nearby subject after the verb may be inverted: "Děti doprovázeli učitelé".
        for (index in verbIndex + 1 until minOf(tokens.size, verbIndex + 3)) {
            if (crossesSentenceBoundary(text, verb.end, tokens[index].start)) break
            val type = subjectClasses[tokens[index].text.lowercase(Locale.ROOT)]
            if (type != null) return coordinatedClass(tokens, index, 1, type)
        }

        val firstIndex = maxOf(0, verbIndex - MAX_SUBJECT_DISTANCE)
        for (index in verbIndex - 1 downTo firstIndex) {
            val token = tokens[index]
            if (crossesSentenceBoundary(text, token.end, verb.start)) break
            val type = subjectClasses[token.text.lowercase(Locale.ROOT)] ?: continue
            return coordinatedClass(tokens, index, -1, type)
        }
        return null
    }

    private fun coordinatedClass(
        tokens: List<Token>,
        subjectIndex: Int,
        direction: Int,
        initialClass: AgreementClass,
    ): AgreementClass {
        var result = initialClass
        var currentIndex = subjectIndex
        while (true) {
            val connectedIndex = currentIndex + direction * 2
            val connectorIndex = currentIndex + direction
            if (connectedIndex !in tokens.indices || tokens[connectorIndex].text.lowercase(Locale.ROOT) != "a") {
                break
            }
            val connectedClass = subjectClasses[tokens[connectedIndex].text.lowercase(Locale.ROOT)] ?: break
            if (connectedClass == AgreementClass.MASCULINE_ANIMATE) {
                result = AgreementClass.MASCULINE_ANIMATE
            } else if (result == AgreementClass.NEUTER &&
                connectedClass == AgreementClass.NON_MASCULINE_ANIMATE
            ) {
                result = AgreementClass.NON_MASCULINE_ANIMATE
            }
            currentIndex = connectedIndex
        }
        return result
    }

    private fun crossesSentenceBoundary(text: String, from: Int, to: Int): Boolean {
        if (from >= to) return false
        return text.substring(from, to).any {
            it == '.' || it == '!' || it == '?' || it == '\n' || it == ';'
        }
    }

    private fun participleClass(word: String): AgreementClass? = when {
        word.endsWith("li", ignoreCase = true) -> AgreementClass.MASCULINE_ANIMATE
        word.endsWith("ly", ignoreCase = true) -> AgreementClass.NON_MASCULINE_ANIMATE
        word.endsWith("la", ignoreCase = true) -> AgreementClass.NEUTER
        else -> null
    }

    private fun replaceEnding(word: String, expectedClass: AgreementClass): String {
        if (word.isEmpty()) return word
        val ending = when (expectedClass) {
            AgreementClass.MASCULINE_ANIMATE -> 'i'
            AgreementClass.NON_MASCULINE_ANIMATE -> 'y'
            AgreementClass.NEUTER -> 'a'
        }
        val replacement = word.dropLast(1) + ending
        return when {
            word.all { !it.isLetter() || it.isUpperCase() } -> replacement.uppercase(Locale.ROOT)
            word.firstOrNull()?.isUpperCase() == true ->
                replacement.replaceFirstChar { it.uppercase(Locale.ROOT) }
            else -> replacement
        }
    }

    private fun explanation(expectedClass: AgreementClass): String = when (expectedClass) {
        AgreementClass.MASCULINE_ANIMATE ->
            "Podmět zahrnuje mužský životný rod v množném čísle, proto má příčestí minulé koncovku -i."
        AgreementClass.NON_MASCULINE_ANIMATE ->
            "U tohoto ženského nebo neživotného podmětu v množném čísle píšeme v příčestí minulém -y."
        AgreementClass.NEUTER ->
            "Podmět je v množném čísle rodu středního, proto má příčestí minulé koncovku -a."
    }
}
