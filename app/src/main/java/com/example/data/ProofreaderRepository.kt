package com.example.data

import android.util.Log
import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ProofreaderRepository {

    private val apiService = RetrofitClient.service
    private val proofreadAdapter = RetrofitClient.moshi.adapter(ProofreadResponse::class.java)
    private val translationAdapter = RetrofitClient.moshi.adapter(TranslationResponse::class.java)

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

        val apiResponse = apiService.generateContent(apiKey, request)
        val responseText = apiResponse.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            ?: throw IllegalStateException("Empty response from Gemini")

        val cleanJson = cleanJsonResponse(responseText)
        Log.d("ProofreaderRepository", "Proofread Clean JSON: $cleanJson")
        return@withContext proofreadAdapter.fromJson(cleanJson) ?: throw IllegalStateException("Failed to parse proofread JSON")
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

        val apiResponse = apiService.generateContent(apiKey, request)
        val responseText = apiResponse.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            ?: throw IllegalStateException("Empty response from Gemini")

        val cleanJson = cleanJsonResponse(responseText)
        Log.d("ProofreaderRepository", "Translation Clean JSON: $cleanJson")
        return@withContext translationAdapter.fromJson(cleanJson) ?: throw IllegalStateException("Failed to parse translation JSON")
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
