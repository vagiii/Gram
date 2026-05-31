package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ProofreadIssue
import com.example.data.ProofreadResponse
import com.example.data.ProofreaderRepository
import com.example.data.TranslationResponse
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface ProofreadUiState {
    object Idle : ProofreadUiState
    object CheckingProgress : ProofreadUiState // Subtle typing background checker state
    object Loading : ProofreadUiState // Active loading indicator
    data class Success(val response: ProofreadResponse) : ProofreadUiState
    data class Error(val message: String, val isApiKeyMissing: Boolean = false) : ProofreadUiState
}

sealed interface TranslateUiState {
    object Idle : TranslateUiState
    object TranslatingProgress : TranslateUiState // Subtle typing indicator
    object Loading : TranslateUiState
    data class Success(val response: TranslationResponse) : TranslateUiState
    data class Error(val message: String, val isApiKeyMissing: Boolean = false) : TranslateUiState
}

enum class ActiveTab {
    PROOFREAD,
    TRANSLATE
}

class ProofreaderViewModel(
    private val repository: ProofreaderRepository = ProofreaderRepository()
) : ViewModel() {

    // Theme and active mode
    private val _activeTab = MutableStateFlow(ActiveTab.PROOFREAD)
    val activeTab: StateFlow<ActiveTab> = _activeTab.asStateFlow()

    // Czech Proofreading States
    private val _czechInput = MutableStateFlow("")
    val czechInput: StateFlow<String> = _czechInput.asStateFlow()

    private val _proofreadState = MutableStateFlow<ProofreadUiState>(ProofreadUiState.Idle)
    val proofreadState: StateFlow<ProofreadUiState> = _proofreadState.asStateFlow()

    // English-to-Czech Translation States
    private val _englishInput = MutableStateFlow("")
    val englishInput: StateFlow<String> = _englishInput.asStateFlow()

    private val _translateState = MutableStateFlow<TranslateUiState>(TranslateUiState.Idle)
    val translateState: StateFlow<TranslateUiState> = _translateState.asStateFlow()

    private var proofreadJob: Job? = null
    private var translateJob: Job? = null

    fun selectTab(tab: ActiveTab) {
        _activeTab.value = tab
    }

    // --- CZECH PROOFREADER FLOW ---

    fun onCzechInputChanged(newText: String) {
        _czechInput.value = newText
        proofreadJob?.cancel()

        if (newText.trim().isEmpty()) {
            _proofreadState.value = ProofreadUiState.Idle
            return
        }

        // Set a subtle progress state to show we've registered typing and will check shortly
        if (_proofreadState.value !is ProofreadUiState.Success) {
            _proofreadState.value = ProofreadUiState.CheckingProgress
        }

        proofreadJob = viewModelScope.launch {
            delay(1200) // 1.2s typing debounce for real-time feel without rate limits
            runProofread(newText)
        }
    }

    fun triggerManualProofread() {
        proofreadJob?.cancel()
        val text = _czechInput.value
        if (text.trim().isNotEmpty()) {
            viewModelScope.launch {
                _proofreadState.value = ProofreadUiState.Loading
                runProofread(text)
            }
        }
    }

    private suspend fun runProofread(text: String) {
        try {
            val response = repository.proofreadCzech(text)
            _proofreadState.value = ProofreadUiState.Success(response)
        } catch (e: Exception) {
            val isKeyMissing = e.message == "API_KEY_MISSING" || e is IllegalStateException && e.message?.contains("API_KEY") == true
            _proofreadState.value = ProofreadUiState.Error(
                message = e.localizedMessage ?: "Unknown network error. Check connection.",
                isApiKeyMissing = isKeyMissing
            )
        }
    }

    fun applyCorrection(issue: ProofreadIssue) {
        val currentText = _czechInput.value
        // Safely replace the first occurrence of the incorrect segment
        val updatedText = currentText.replaceFirst(issue.original, issue.replacement)
        _czechInput.value = updatedText

        // Instantly run proofread for updated text rather than waiting for debounce
        proofreadJob?.cancel()
        _proofreadState.value = ProofreadUiState.Loading
        viewModelScope.launch {
            runProofread(updatedText)
        }
    }

    fun applyAllCorrections(correctedText: String) {
        _czechInput.value = correctedText
        _proofreadState.value = ProofreadUiState.Success(
            ProofreadResponse(
                originalText = correctedText,
                correctedText = correctedText,
                issues = emptyList()
            )
        )
    }

    fun clearProofreader() {
        proofreadJob?.cancel()
        _czechInput.value = ""
        _proofreadState.value = ProofreadUiState.Idle
    }

    // --- TRANSLATION FLOW ---

    fun onEnglishInputChanged(newText: String) {
        _englishInput.value = newText
        translateJob?.cancel()

        if (newText.trim().isEmpty()) {
            _translateState.value = TranslateUiState.Idle
            return
        }

        if (_translateState.value !is TranslateUiState.Success) {
            _translateState.value = TranslateUiState.TranslatingProgress
        }

        translateJob = viewModelScope.launch {
            delay(1500) // Slightly longer debounce for translation
            runTranslation(newText)
        }
    }

    fun triggerManualTranslation() {
        translateJob?.cancel()
        val text = _englishInput.value
        if (text.trim().isNotEmpty()) {
            viewModelScope.launch {
                _translateState.value = TranslateUiState.Loading
                runTranslation(text)
            }
        }
    }

    private suspend fun runTranslation(text: String) {
        try {
            val response = repository.translateEnglishToCzech(text)
            _translateState.value = TranslateUiState.Success(response)
        } catch (e: Exception) {
            val isKeyMissing = e.message == "API_KEY_MISSING" || e is IllegalStateException && e.message?.contains("API_KEY") == true
            _translateState.value = TranslateUiState.Error(
                message = e.localizedMessage ?: "Unknown network error. Check connection.",
                isApiKeyMissing = isKeyMissing
            )
        }
    }

    fun sendTranslationToProofreader(translatedText: String) {
        // Send translated Czech text into the Czech Checker input and trigger check
        clearProofreader()
        _czechInput.value = translatedText
        _activeTab.value = ActiveTab.PROOFREAD
        _proofreadState.value = ProofreadUiState.Loading
        viewModelScope.launch {
            runProofread(translatedText)
        }
    }

    fun clearTranslator() {
        translateJob?.cancel()
        _englishInput.value = ""
        _translateState.value = TranslateUiState.Idle
    }
}
