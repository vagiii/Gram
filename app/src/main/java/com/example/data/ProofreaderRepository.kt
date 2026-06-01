package com.example.data

import android.util.Log
import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

class ProofreaderRepository {

    private val apiService = RetrofitClient.service
    private val proofreadAdapter = RetrofitClient.moshi.adapter(ProofreadResponse::class.java)
    private val translationAdapter = RetrofitClient.moshi.adapter(TranslationResponse::class.java)

    private suspend fun <T> retryIO(
        times: Int = 3,
        initialDelay: Long = 1000,
        maxDelay: Long = 4000,
        factor: Double = 2.0,
        block: suspend () -> T
    ): T {
        var currentDelay = initialDelay
        repeat(times - 1) { attempt ->
            try {
                return block()
            } catch (e: Exception) {
                if (e is kotlinx.coroutines.CancellationException) throw e
                Log.w("ProofreaderRepository", "Linguist CZ API network attempt ${attempt + 1} failed: ${e.message}. Retrying in ${currentDelay}ms...")
            }
            delay(currentDelay)
            currentDelay = (currentDelay * factor).toLong().coerceAtMost(maxDelay)
        }
        return block()
    }

    /**
     * Checks Czech text for grammar, spelling, syntax, and stylistic issues.
     */
    suspend fun proofreadCzech(text: String): ProofreadResponse = withContext(Dispatchers.IO) {
        if (text.isEmpty() || text.trim().isEmpty()) {
            return@withContext ProofreadResponse(text, text, emptyList())
        }

        val systemInstruction = """
            You are a highly professional, expert Czech linguist and editor. 
            Analyze the input Czech text for spelling (pravopis), grammar (gramatika), syntax (skladba), and stylistic (stylistické) issues.
            Produce a JSON response with the following keys:
            - original_text: the original text checked
            - corrected_text: the fully corrected, grammatically and stylistically perfect version of the text
            - issues: an array of issues found, where each issue has:
              * original: the precise incorrect word, phrase, or character sequence from the original text (must be exact)
              * replacement: the suggested correction
              * type: must be one of "spelling", "grammar", "syntax", or "style"
              * explanation: a clear explanation in Czech explaining the error and why this correction is necessary (e.g. explain modern Czech grammar rules, "i/y" rules, capitalization, punctuation, dynamic word order rules, etc.)
            
            Strictly return ONLY a valid JSON object. No explanation text outside JSON. Do not wrap JSON in markdown tags like ```json.
            If the text has no errors, returned issues should be empty and corrected_text should be identical to original_text.
        """.trimIndent()

        val prompt = text

        val request = GenerateContentRequest(
            contents = listOf(Content(parts = listOf(Part(text = prompt)))),
            systemInstruction = Content(parts = listOf(Part(text = systemInstruction))),
            generationConfig = GenerationConfig(responseMimeType = "application/json", temperature = 0.2)
        )

        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isBlank() || apiKey == "MY_GEMINI_API_KEY") {
            throw IllegalStateException("API_KEY_MISSING")
        }

        try {
            val apiResponse = retryIO {
                apiService.generateContent(apiKey, request)
            }
            val responseText = apiResponse.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                ?: throw IllegalStateException("Empty response from Gemini")

            val cleanJson = cleanJsonResponse(responseText)
            Log.d("ProofreaderRepository", "Proofread Clean JSON: $cleanJson")
            return@withContext proofreadAdapter.fromJson(cleanJson) ?: throw IllegalStateException("Failed to parse proofread JSON")
        } catch (e: Exception) {
            if (e is kotlinx.coroutines.CancellationException) throw e
            Log.w("ProofreaderRepository", "Gemini API call failed, falling back to CzechOfflineEngine: ${e.message}")
            val fallbackResponse = CzechOfflineEngine.proofread(text)
            // Add a cute indicator issue as a style note
            val indicatorIssue = ProofreadIssue(
                original = text.split(" ").firstOrNull() ?: "",
                replacement = text.split(" ").firstOrNull() ?: "",
                type = "style",
                explanation = "Aktivován lokální offline režim opravy pravidel (AI server neodpověděl včas/Timeout)."
            )
            val cleanIssues = if (text.isNotBlank()) listOf(indicatorIssue) + fallbackResponse.issues else fallbackResponse.issues
            return@withContext fallbackResponse.copy(
                issues = cleanIssues.distinctBy { it.original }
            )
        }
    }

    /**
     * Translates English text to Czech and returns the translation, linguistic notes, and alternatives.
     */
    suspend fun translateEnglishToCzech(text: String): TranslationResponse = withContext(Dispatchers.IO) {
        if (text.isEmpty() || text.trim().isEmpty()) {
            return@withContext TranslationResponse("", emptyList(), emptyList())
        }

        val systemInstruction = """
            You are a highly professional, expert English-to-Czech translator and linguist.
            Translate the input English text into Czech.
            Produce a JSON response with the following keys:
            - translated_text: the primary, high-quality Czech translation of the English text
            - notes: an array of grammatical, spelling, syntactic, or stylistic annotations/lessons, explaining why certain terms were chosen, how grammar rules apply (such as cases, verb aspects, formal vs informal choices, word order, etc.)
              * phrase: the Czech or English phrase referenced
              * explanation: a helpful explanation of the language rule or choice in Czech
            - alternatives: an array of alternative translations in Czech (e.g., formal/informal variations, alternative styles)

            Strictly return ONLY a valid JSON object. No explanation text outside JSON. Do not wrap JSON in markdown tags like ```json.
        """.trimIndent()

        val prompt = text

        val request = GenerateContentRequest(
            contents = listOf(Content(parts = listOf(Part(text = prompt)))),
            systemInstruction = Content(parts = listOf(Part(text = systemInstruction))),
            generationConfig = GenerationConfig(responseMimeType = "application/json", temperature = 0.2)
        )

        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isBlank() || apiKey == "MY_GEMINI_API_KEY") {
            throw IllegalStateException("API_KEY_MISSING")
        }

        try {
            val apiResponse = retryIO {
                apiService.generateContent(apiKey, request)
            }
            val responseText = apiResponse.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                ?: throw IllegalStateException("Empty response from Gemini")

            val cleanJson = cleanJsonResponse(responseText)
            Log.d("ProofreaderRepository", "Translation Clean JSON: $cleanJson")
            return@withContext translationAdapter.fromJson(cleanJson) ?: throw IllegalStateException("Failed to parse translation JSON")
        } catch (e: Exception) {
            if (e is kotlinx.coroutines.CancellationException) throw e
            Log.w("ProofreaderRepository", "Gemini translation failed, falling back to CzechOfflineEngine: ${e.message}")
            val fallbackResponse = CzechOfflineEngine.translate(text)
            return@withContext fallbackResponse.copy(
                notes = listOf(
                    TranslationGrammarNote(
                        phrase = "Offline režim",
                        explanation = "Byl aktivován lokální offline režim, protože server Gemini neodpověděl v časovém limitu."
                    )
                ) + fallbackResponse.notes
            )
        }
    }

    private fun cleanJsonResponse(raw: String): String {
        var str = raw.trim()
        if (str.startsWith("```json")) {
            str = str.substring(7)
        } else if (str.startsWith("```")) {
            str = str.substring(3)
        }
        if (str.endsWith("```")) {
            str = str.substring(0, str.length - 3)
        }
        return str.trim()
    }
}
