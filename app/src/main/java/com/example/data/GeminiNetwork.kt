package com.example.data

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

// --- Gemini REST API Request & Response Schema ---

@JsonClass(generateAdapter = true)
data class Part(
    @Json(name = "text") val text: String? = null
)

@JsonClass(generateAdapter = true)
data class Content(
    @Json(name = "parts") val parts: List<Part>
)

@JsonClass(generateAdapter = true)
data class GenerationConfig(
    @Json(name = "responseMimeType") val responseMimeType: String? = "application/json",
    @Json(name = "temperature") val temperature: Double? = 0.2
)

@JsonClass(generateAdapter = true)
data class GenerateContentRequest(
    @Json(name = "contents") val contents: List<Content>,
    @Json(name = "systemInstruction") val systemInstruction: Content? = null,
    @Json(name = "generationConfig") val generationConfig: GenerationConfig? = null
)

@JsonClass(generateAdapter = true)
data class Candidate(
    @Json(name = "content") val content: Content? = null
)

@JsonClass(generateAdapter = true)
data class GenerateContentResponse(
    @Json(name = "candidates") val candidates: List<Candidate>? = null
)

// --- Czech Proofreading Domain Schema ---

@JsonClass(generateAdapter = true)
data class ProofreadIssue(
    @Json(name = "original") val original: String,
    @Json(name = "replacement") val replacement: String,
    @Json(name = "type") val type: String, // "spelling" | "grammar" | "syntax" | "style"
    @Json(name = "explanation") val explanation: String
)

@JsonClass(generateAdapter = true)
data class ProofreadResponse(
    @Json(name = "original_text") val originalText: String,
    @Json(name = "corrected_text") val correctedText: String,
    @Json(name = "issues") val issues: List<ProofreadIssue> = emptyList()
)

// --- English-to-Czech Translation Domain Schema ---

@JsonClass(generateAdapter = true)
data class TranslationGrammarNote(
    @Json(name = "phrase") val phrase: String,
    @Json(name = "explanation") val explanation: String
)

@JsonClass(generateAdapter = true)
data class TranslationResponse(
    @Json(name = "translated_text") val translatedText: String,
    @Json(name = "notes") val notes: List<TranslationGrammarNote> = emptyList(),
    @Json(name = "alternatives") val alternatives: List<String> = emptyList()
)

// --- Retrofit Setup ---

interface GeminiApiService {
    @POST("v1beta/models/gemini-3.5-flash:generateContent")
    suspend fun generateContent(
        @Query("key") apiKey: String,
        @Body request: GenerateContentRequest
    ): GenerateContentResponse
}

object RetrofitClient {
    private const val BASE_URL = "https://generativelanguage.googleapis.com/"

    // Robust 60-second timeouts as mandated by Gemini guidelines
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    val moshi: Moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    val service: GeminiApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
        retrofit.create(GeminiApiService::class.java)
    }
}
