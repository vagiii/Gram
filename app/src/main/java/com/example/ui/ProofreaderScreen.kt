package com.example.ui

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.ProofreadIssue
import com.example.data.TranslationGrammarNote

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProofreaderScreen(
    viewModel: ProofreaderViewModel,
    modifier: Modifier = Modifier
) {
    val activeTab by viewModel.activeTab.collectAsState()
    val czechInput by viewModel.czechInput.collectAsState()
    val proofreadState by viewModel.proofreadState.collectAsState()

    val englishInput by viewModel.englishInput.collectAsState()
    val translateState by viewModel.translateState.collectAsState()

    val clipboardManager = LocalClipboardManager.current
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF0061A4)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Gram",
                                fontWeight = FontWeight.SemiBold,
                                style = MaterialTheme.typography.titleMedium,
                                color = Color(0xFF1A1C1E)
                            )
                            Text(
                                text = "Offline česká gramatika",
                                fontSize = 11.sp,
                                color = Color(0xFF44474E),
                                fontWeight = FontWeight.Normal
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFFF7F9FC),
                    titleContentColor = Color(0xFF1A1C1E)
                ),
                actions = {
                    IconButton(
                        onClick = {
                            if (activeTab == ActiveTab.PROOFREAD) {
                                viewModel.clearProofreader()
                            } else {
                                viewModel.clearTranslator()
                            }
                            Toast.makeText(context, "Vyčištěno", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier
                            .size(40.dp)
                            .testTag("action_clear_all")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Vymazat vše",
                            tint = Color(0xFF44474E)
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .background(Color(0xFFF7F9FC))
        ) {
            // Elegant Clean Minimalism Custom Capsule switcher
            Row(
                modifier = Modifier
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFFE1E2E5))
                    .padding(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Tab 1: Proofread
                val isProofSelected = activeTab == ActiveTab.PROOFREAD
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isProofSelected) Color.White else Color.Transparent)
                        .clickable { viewModel.selectTab(ActiveTab.PROOFREAD) }
                        .padding(vertical = 10.dp)
                        .testTag("tab_proofread"),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = if (isProofSelected) Color(0xFF0061A4) else Color(0xFF44474E),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Oprava češtiny",
                            color = if (isProofSelected) Color(0xFF1A1C1E) else Color(0xFF44474E),
                            fontWeight = if (isProofSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 14.sp
                        )
                    }
                }

                // Tab 2: Translate
                val isTransSelected = activeTab == ActiveTab.TRANSLATE
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isTransSelected) Color.White else Color.Transparent)
                        .clickable { viewModel.selectTab(ActiveTab.TRANSLATE) }
                        .padding(vertical = 10.dp)
                        .testTag("tab_translate"),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = null,
                            tint = if (isTransSelected) Color(0xFF0061A4) else Color(0xFF44474E),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Překladač",
                            color = if (isTransSelected) Color(0xFF1A1C1E) else Color(0xFF44474E),
                            fontWeight = if (isTransSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 14.sp
                        )
                    }
                }
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                when (activeTab) {
                    ActiveTab.PROOFREAD -> {
                        ProofreadTabContent(
                            czechInput = czechInput,
                            proofreadState = proofreadState,
                            onInputChange = { viewModel.onCzechInputChanged(it) },
                            onTriggerManual = { viewModel.triggerManualProofread() },
                            onApplyCorrection = { viewModel.applyCorrection(it) },
                            onApplyAll = { viewModel.applyAllCorrections(it) },
                            clipboardManager = clipboardManager,
                            focusManager = focusManager,
                            context = context
                        )
                    }
                    ActiveTab.TRANSLATE -> {
                        TranslateTabContent(
                            englishInput = englishInput,
                            translateState = translateState,
                            onInputChange = { viewModel.onEnglishInputChanged(it) },
                            onTriggerManual = { viewModel.triggerManualTranslation() },
                            onSendToProofreader = { viewModel.sendTranslationToProofreader(it) },
                            clipboardManager = clipboardManager,
                            focusManager = focusManager,
                            context = context
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProofreadTabContent(
    czechInput: String,
    proofreadState: ProofreadUiState,
    onInputChange: (String) -> Unit,
    onTriggerManual: () -> Unit,
    onApplyCorrection: (ProofreadIssue) -> Unit,
    onApplyAll: (String) -> Unit,
    clipboardManager: androidx.compose.ui.platform.ClipboardManager,
    focusManager: androidx.compose.ui.focus.FocusManager,
    context: android.content.Context
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // TextField Editor Card
        item {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = Color.White
                ),
                shape = RoundedCornerShape(24.dp),
                border = BorderStroke(1.dp, Color(0xFFC4C6CF)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "Zadejte český text",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0061A4)
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFFE1E2E5)
                        ) {
                            Text(
                                text = "${czechInput.length} zn.",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF44474E),
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = czechInput,
                        onValueChange = onInputChange,
                        placeholder = {
                            Text("Zde napište nebo vložte text v češtině, který chcete zkontrolovat...")
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 120.dp, max = 240.dp)
                            .testTag("czech_input_field"),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
                        maxLines = 10,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF0061A4),
                            unfocusedBorderColor = Color(0xFFC4C6CF),
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Button(
                            onClick = {
                                val clipData = clipboardManager.getText()?.text
                                if (!clipData.isNullOrBlank()) {
                                    onInputChange(clipData)
                                    Toast.makeText(context, "Text vložen", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(context, "Schránka je prázdná", Toast.LENGTH_SHORT).show()
                                }
                            },
                            variant = ButtonVariant.OUTLINED,
                            color = Color(0xFF0061A4),
                            modifier = Modifier.weight(1f).testTag("action_paste")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Vložit")
                        }

                        Button(
                            onClick = onTriggerManual,
                            enabled = czechInput.trim().isNotEmpty() && proofreadState !is ProofreadUiState.Loading,
                            variant = ButtonVariant.FILLED,
                            color = Color(0xFF0061A4),
                            modifier = Modifier.weight(1.5f).testTag("action_check")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Zkontrolovat")
                        }
                    }
                }
            }
        }

        // Real-Time Context / Status Header
        item {
            RealTimeStatusHeader(state = proofreadState, textLength = czechInput.length)
        }

        // Main State Contents
        when (proofreadState) {
            is ProofreadUiState.Idle -> {
                item {
                    FeedbackInstructionsCard(isTranslation = false)
                }
            }
            is ProofreadUiState.CheckingProgress -> {
                item {
                    SubtleLoadingCard(message = "Příprava analýzy češtiny (čekejte na ukončení psaní)...")
                }
            }
            is ProofreadUiState.Loading -> {
                item {
                    FullLoadingCard(message = "Kontroluji text lokálně v zařízení...")
                }
            }
            is ProofreadUiState.Error -> {
                item {
                    ErrorAlertCard(
                        message = proofreadState.message,
                        isApiKeyMissing = false,
                        onRetry = onTriggerManual
                    )
                }
            }
            is ProofreadUiState.Success -> {
                val results = proofreadState.response

                if (results.issues.isEmpty()) {
                    // Perfect text screen!
                    item {
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = Color(0xFFE8F5E9) // Light green background
                            ),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, Color(0xFF2E7D32).copy(alpha = 0.3f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Done,
                                    contentDescription = "Done",
                                    tint = Color(0xFF2E7D32),
                                    modifier = Modifier.size(28.dp)
                                )
                                Column {
                                    Text(
                                        text = "Text je zcela v pořádku!",
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF1B5E20)
                                    )
                                    Text(
                                        text = "Nebyly nalezeny žádné gramatické, pravopisné ani syntaktické chyby.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = Color(0xFF2E7D32)
                                    )
                                }
                            }
                        }
                    }
                } else {
                    // Highlight mapping helper
                    item {
                        Card(
                            shape = RoundedCornerShape(24.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = Color.White
                            ),
                            border = BorderStroke(1.dp, Color(0xFFC4C6CF)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color(0xFFF3F3FA))
                                        .padding(horizontal = 16.dp, vertical = 12.dp)
                                ) {
                                    Text(
                                        text = "Vizuální oprava (nalezeno ${results.issues.size} chyb)",
                                        fontWeight = FontWeight.Bold,
                                        style = MaterialTheme.typography.labelMedium,
                                        color = Color(0xFF44474E)
                                    )
                                }
                                TextWithHighlights(originalText = czechInput, issues = results.issues)
                            }
                        }
                    }

                    // Card of overall corrected text - Replicating HTML's Suggestion styling!
                    item {
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = Color(0xFFE9EEF6) // Replicating bg-[#E9EEF6]
                            ),
                            border = BorderStroke(1.dp, Color(0xFFD3E4FF)), // Replicating border-[#D3E4FF]
                            shape = RoundedCornerShape(24.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(20.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Info,
                                        contentDescription = null,
                                        tint = Color(0xFF0061A4),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        text = "NÁVRH OPRAVY",
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color(0xFF0061A4),
                                        fontSize = 11.sp,
                                        letterSpacing = 1.sp
                                    )
                                }
                                
                                Spacer(modifier = Modifier.height(10.dp))
                                
                                Text(
                                    text = results.correctedText,
                                    style = MaterialTheme.typography.bodyLarge,
                                    lineHeight = 24.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF1A1C1E)
                                )
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Button(
                                        onClick = {
                                            clipboardManager.setText(AnnotatedString(results.correctedText))
                                            Toast.makeText(context, "Zkopírováno do schránky", Toast.LENGTH_SHORT).show()
                                        },
                                        variant = ButtonVariant.OUTLINED,
                                        color = Color(0xFF0061A4),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Text("Kopírovat")
                                    }
                                    Button(
                                        onClick = {
                                            onApplyAll(results.correctedText)
                                            Toast.makeText(context, "Text v editoru nahrazen opraveným", Toast.LENGTH_SHORT).show()
                                        },
                                        variant = ButtonVariant.FILLED,
                                        color = Color(0xFF0061A4),
                                        modifier = Modifier.weight(1.2f)
                                    ) {
                                        Text("Použít vše")
                                    }
                                }
                            }
                        }
                    }

                    // Detail list of specific cards/issues
                    items(results.issues) { issue ->
                        IssueItemCard(issue = issue, onApply = { onApplyCorrection(issue) })
                    }
                }
            }
        }
    }
}

@Composable
fun TranslateTabContent(
    englishInput: String,
    translateState: TranslateUiState,
    onInputChange: (String) -> Unit,
    onTriggerManual: () -> Unit,
    onSendToProofreader: (String) -> Unit,
    clipboardManager: androidx.compose.ui.platform.ClipboardManager,
    focusManager: androidx.compose.ui.focus.FocusManager,
    context: android.content.Context
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // English Input Card
        item {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = Color.White
                ),
                shape = RoundedCornerShape(24.dp),
                border = BorderStroke(1.dp, Color(0xFFC4C6CF)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Vložte anglický text",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0061A4)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = englishInput,
                        onValueChange = onInputChange,
                        placeholder = {
                            Text("Type English sentences here to get robust Czech translations with real-time feedback...")
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 120.dp, max = 240.dp)
                            .testTag("english_input_field"),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
                        maxLines = 10,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF0061A4),
                            unfocusedBorderColor = Color(0xFFC4C6CF),
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Button(
                            onClick = {
                                val clipData = clipboardManager.getText()?.text
                                if (!clipData.isNullOrBlank()) {
                                    onInputChange(clipData)
                                    Toast.makeText(context, "English text pasted", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(context, "Clipboard empty", Toast.LENGTH_SHORT).show()
                                }
                            },
                            variant = ButtonVariant.OUTLINED,
                            color = Color(0xFF0061A4),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Vložit")
                        }

                        Button(
                            onClick = onTriggerManual,
                            enabled = englishInput.trim().isNotEmpty() && translateState !is TranslateUiState.Loading,
                            variant = ButtonVariant.FILLED,
                            color = Color(0xFF0061A4),
                            modifier = Modifier.weight(1.5f).testTag("action_translate")
                        ) {
                            Icon(
                                imageVector = Icons.Default.ArrowForward,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Přeložit")
                        }
                    }
                }
            }
        }

        // Translators status
        item {
            RealTimeStatusHeaderTranslation(state = translateState, textLength = englishInput.length)
        }

        // Translator Results
        when (translateState) {
            is TranslateUiState.Idle -> {
                item {
                    FeedbackInstructionsCard(isTranslation = true)
                }
            }
            is TranslateUiState.TranslatingProgress -> {
                item {
                    SubtleLoadingCard(message = "Generování překladu z angličtiny (čekejte na ukončení psaní)...")
                }
            }
            is TranslateUiState.Loading -> {
                item {
                    FullLoadingCard(message = "Běží překlad s lingvistickým a gramatickým rozborem...")
                }
            }
            is TranslateUiState.Error -> {
                item {
                    ErrorAlertCard(
                        message = translateState.message,
                        isApiKeyMissing = translateState.isApiKeyMissing,
                        onRetry = onTriggerManual
                    )
                }
            }
            is TranslateUiState.Success -> {
                val response = translateState.response

                // Big translation output card
                item {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFFE9EEF6)
                        ),
                        border = BorderStroke(1.dp, Color(0xFFD3E4FF)),
                        shape = RoundedCornerShape(24.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text(
                                text = "Český překlad",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0061A4)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = response.translatedText,
                                style = MaterialTheme.typography.bodyLarge,
                                lineHeight = 24.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF1A1C1E)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Button(
                                    onClick = {
                                        clipboardManager.setText(AnnotatedString(response.translatedText))
                                        Toast.makeText(context, "Překlad zkopírován", Toast.LENGTH_SHORT).show()
                                    },
                                    variant = ButtonVariant.OUTLINED,
                                    color = Color(0xFF0061A4),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Zkopírovat")
                                }
                                Button(
                                    onClick = {
                                        onSendToProofreader(response.translatedText)
                                        Toast.makeText(context, "Překlad přenesen do korektoru!", Toast.LENGTH_SHORT).show()
                                    },
                                    variant = ButtonVariant.FILLED,
                                    color = Color(0xFF0061A4),
                                    modifier = Modifier.weight(1.3f).testTag("action_transfer_proof")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Přenést do korektoru")
                                }
                            }
                        }
                    }
                }

                // If alternatives exist, show them
                if (response.alternatives.isNotEmpty()) {
                    item {
                        Text(
                            text = "Alternativní vyjádření",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.padding(top = 4.dp, start = 4.dp)
                        )
                    }

                    items(response.alternatives) { alternate ->
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surface
                            ),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.12f)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = alternate,
                                    style = MaterialTheme.typography.bodyMedium,
                                    modifier = Modifier.weight(1f)
                                )
                                IconButton(
                                    onClick = {
                                        clipboardManager.setText(AnnotatedString(alternate))
                                        Toast.makeText(context, "Zkopírována alternativa", Toast.LENGTH_SHORT).show()
                                    },
                                    modifier = Modifier.size(36.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Share,
                                        contentDescription = "Copy alternative",
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                // Linguistic analysis notes
                if (response.notes.isNotEmpty()) {
                    item {
                        Text(
                            text = "Lingvistické a gramatické poznámky",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.padding(top = 8.dp, start = 4.dp)
                        )
                    }

                    items(response.notes) { note ->
                        TranslationNoteItem(note = note)
                    }
                }
            }
        }
    }
}

// Custom Micro Component Button Variants to satisfy beautiful Material styling
enum class ButtonVariant {
    FILLED,
    OUTLINED
}

@Composable
fun Button(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    variant: ButtonVariant = ButtonVariant.FILLED,
    color: Color? = null,
    content: @Composable RowScope.() -> Unit
) {
    if (variant == ButtonVariant.FILLED) {
        Button(
            onClick = onClick,
            modifier = modifier.heightIn(min = 44.dp), // Ergonomic touch targets
            enabled = enabled,
            colors = ButtonDefaults.buttonColors(
                containerColor = color ?: MaterialTheme.colorScheme.primary
            ),
            shape = RoundedCornerShape(12.dp),
            content = content
        )
    } else {
        OutlinedButton(
            onClick = onClick,
            modifier = modifier.heightIn(min = 44.dp), // touch target
            enabled = enabled,
            border = BorderStroke(
                1.3.dp,
                color ?: MaterialTheme.colorScheme.outline
            ),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = color ?: MaterialTheme.colorScheme.primary
            ),
            shape = RoundedCornerShape(12.dp),
            content = content
        )
    }
}

@Composable
fun SubtleLoadingCard(message: String) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
        ),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            CircularProgressIndicator(
                strokeWidth = 2.dp,
                modifier = Modifier.size(16.dp),
                color = MaterialTheme.colorScheme.secondary
            )
            Text(
                text = message,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun FullLoadingCard(message: String) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
        ),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .padding(24.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            CircularProgressIndicator(
                strokeWidth = 3.dp,
                modifier = Modifier.size(36.dp),
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun RealTimeStatusHeader(state: ProofreadUiState, textLength: Int) {
    _RealTimeStatusContainer(textLength) {
        when (state) {
            is ProofreadUiState.Idle -> {
                Text(
                    text = "Připraven k opravě",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.secondary,
                    fontSize = 13.sp
                )
            }
            is ProofreadUiState.CheckingProgress -> {
                Text(
                    text = "Detekce psaní...",
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFD97706),
                    fontSize = 13.sp
                )
            }
            is ProofreadUiState.Loading -> {
                Text(
                    text = "Běží analýza...",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 13.sp
                )
            }
            is ProofreadUiState.Error -> {
                Text(
                    text = "Chyba místní kontroly",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 13.sp
                )
            }
            is ProofreadUiState.Success -> {
                val issuesCount = state.response.issues.size
                if (issuesCount == 0) {
                    Text(
                        text = "Vše naprosto bez chyb!",
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF16A34A),
                        fontSize = 13.sp
                    )
                } else {
                    Text(
                        text = "Nalezeno $issuesCount pravopisných/gramatických chyb",
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFDC2626),
                        fontSize = 13.sp
                    )
                }
            }
        }
    }
}

@Composable
fun RealTimeStatusHeaderTranslation(state: TranslateUiState, textLength: Int) {
    _RealTimeStatusContainer(textLength) {
        when (state) {
            is TranslateUiState.Idle -> {
                Text(
                    text = "Připraven k překladu",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.secondary,
                    fontSize = 13.sp
                )
            }
            is TranslateUiState.TranslatingProgress -> {
                Text(
                    text = "Detekce psaní...",
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFD97706),
                    fontSize = 13.sp
                )
            }
            is TranslateUiState.Loading -> {
                Text(
                    text = "Běží překlad...",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 13.sp
                )
            }
            is TranslateUiState.Error -> {
                Text(
                    text = "Chyba překladu",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 13.sp
                )
            }
            is TranslateUiState.Success -> {
                Text(
                    text = "Překlad úspěšně dokončen",
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF16A34A),
                    fontSize = 13.sp
                )
            }
        }
    }
}

@Composable
private fun _RealTimeStatusContainer(
    textLength: Int,
    content: @Composable BoxScope.() -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(
                        if (textLength > 0) Color(0xFF10B981) else Color(0xFF9CA3AF)
                    )
            )
            Box(content = content)
        }

        if (textLength > 0) {
            Surface(
                shape = RoundedCornerShape(6.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.1f))
            ) {
                Text(
                    text = "Manuální režim",
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }
    }
}

@Composable
fun FeedbackInstructionsCard(isTranslation: Boolean) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(1.dp, Color(0xFFC4C6CF)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = if (isTranslation) "Lekce a poznámky k překladu" else "Co opravujeme v češtině?",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0061A4)
            )
            Spacer(modifier = Modifier.height(12.dp))

            val points = if (isTranslation) {
                listOf(
                    Pair("Linguistic context", "Rozpoznání formálního/neformálního tónu podle kontextu."),
                    Pair("Grammatical cases", "Skloňování podstatných jmen do všech 7 pádů."),
                    Pair("Verb aspects", "Dokonavá a nedokonavá slovesa v češtině."),
                    Pair("Phonetic notes", "Vysvětlení výjimek a idiomů v daném překladu.")
                )
            } else {
                listOf(
                    Pair("Pravopis a diakritika", "Opravy chybějícího dvojení, háčků, čárek a velkých písmen."),
                    Pair("Skloňování a časování", "Shoda přísudku s podmětem (i/y), koncovky pádů."),
                    Pair("Vazby a syntax", "Opravy slovosledu a divných obratů přenesených z jiných jazyků."),
                    Pair("Stylistika", "Návrhy lepších výrazů a odstranění pleonasmu.")
                )
            }

            points.forEach { (title, description) ->
                Row(
                    modifier = Modifier.padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = "•",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0061A4)
                    )
                    Column {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1A1C1E)
                        )
                        Text(
                            text = description,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF44474E)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun IssueItemCard(issue: ProofreadIssue, onApply: () -> Unit) {
    val pillBg = when (issue.type.lowercase()) {
        "spelling" -> Color(0xFFFEE2E2)  // Soft red
        "grammar" -> Color(0xFFFEF3C7)   // Soft amber
        "syntax" -> Color(0xFFDBEAFE)    // Soft blue
        else -> Color(0xFFF3E8FF)        // Soft purple
    }
    val pillTextColor = when (issue.type.lowercase()) {
        "spelling" -> Color(0xFF991B1B)
        "grammar" -> Color(0xFF92400E)
        "syntax" -> Color(0xFF1E40AF)
        else -> Color(0xFF6B21A8)
    }

    val issueLabel = when (issue.type.lowercase()) {
        "spelling" -> "Pravopis"
        "grammar" -> "Gramatika"
        "syntax" -> "Skladba"
        "style" -> "Stylistika"
        else -> issue.type
    }

    Card(
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        shape = RoundedCornerShape(20.dp),
        border = BorderStroke(1.dp, Color(0xFFC4C6CF)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = pillBg
                ) {
                    Text(
                        text = issueLabel,
                        color = pillTextColor,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }

                IconButton(
                    onClick = onApply,
                    modifier = Modifier
                        .size(36.dp)
                        .background(
                            Color(0xFFE9EEF6),
                            CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Apply suggestion",
                        tint = Color(0xFF0061A4),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = issue.original,
                    color = Color.Red,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold,
                    textDecoration = TextDecoration.LineThrough
                )
                Icon(
                    imageVector = Icons.Default.ArrowForward,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = issue.replacement,
                    color = Color(0xFF16A34A), // vibrant green
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = issue.explanation,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 16.sp,
                fontWeight = FontWeight.Normal
            )
        }
    }
}

@Composable
fun TranslationNoteItem(note: TranslationGrammarNote) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(10.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.12f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = note.phrase,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = note.explanation,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 16.sp
            )
        }
    }
}

@Composable
fun ErrorAlertCard(
    message: String,
    isApiKeyMissing: Boolean,
    onRetry: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer
        ),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.3f)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    tint = MaterialTheme.colorScheme.error,
                    contentDescription = "Warning"
                )
                Text(
                    text = if (isApiKeyMissing) "Chybí konfigurace API klíče" else "Došlo k chybě",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onErrorContainer
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (isApiKeyMissing) {
                Text(
                    text = "Lokalizovaný API klíč pro Gemini nebyl nakonfigurován. Vložte prosím svůj Gemini API Key do panelu Secrets v prostředí Google AI Studio.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    lineHeight = 16.sp
                )
                Spacer(modifier = Modifier.height(12.dp))
                _CredentialGuideNotes()
            } else {
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    lineHeight = 16.sp
                )
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = onRetry,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Zkusit znovu", color = Color.White)
                }
            }
        }
    }
}

@Composable
private fun _CredentialGuideNotes() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.Black.copy(alpha = 0.05f), RoundedCornerShape(8.dp))
            .padding(10.dp)
    ) {
        Text(
            text = "Postup nastavení:",
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.labelSmall
        )
        Text(
            text = "1. Vpravo nahoře v AI Studio klikněte na 'Secrets'.\n2. Přidejte klíč 'GEMINI_API_KEY'.\n3. Restartujte nebo sestavte aplikaci.",
            style = MaterialTheme.typography.bodySmall,
            lineHeight = 16.sp,
            color = Color.DarkGray
        )
    }
}

@Composable
fun TextWithHighlights(originalText: String, issues: List<ProofreadIssue>) {
    val annotatedString = remember(originalText, issues) {
        buildAnnotatedString {
            var currentIndex = 0
            // Find non-overlapping occurrences of the issue original texts
            val occurrences = mutableListOf<Triple<Int, Int, ProofreadIssue>>()
            
            for (issue in issues) {
                var searchStart = 0
                while (searchStart < originalText.length) {
                    val idx = originalText.indexOf(issue.original, searchStart)
                    if (idx == -1) break
                    
                    // Verify if it overlaps with already added ones
                    val overlaps = occurrences.any { (start, end, _) ->
                        idx < end && start < idx + issue.original.length
                    }
                    if (!overlaps) {
                        occurrences.add(Triple(idx, idx + issue.original.length, issue))
                    }
                    searchStart = idx + 1
                }
            }
            
            // Sort by starting position
            occurrences.sortBy { it.first }

            for ((start, end, issue) in occurrences) {
                if (start > currentIndex) {
                    append(originalText.substring(currentIndex, start))
                }
                pushStyle(
                    SpanStyle(
                        background = when (issue.type.lowercase()) {
                            "spelling" -> Color(0x33DC2626) // translucent highlight red
                            "grammar" -> Color(0x33D97706)  // translucent highlight amber
                            "syntax" -> Color(0x221D4ED8)   // translucent highlight blue
                            "style" -> Color(0x227C3AED)    // translucent highlight purple
                            else -> Color(0x226B7280)
                        },
                        textDecoration = TextDecoration.Underline,
                        fontWeight = FontWeight.Bold
                    )
                )
                append(originalText.substring(start, end))
                pop()
                currentIndex = end
            }
            if (currentIndex < originalText.length) {
                append(originalText.substring(currentIndex))
            }
        }
    }

    Text(
        text = annotatedString,
        style = MaterialTheme.typography.bodyLarge,
        lineHeight = 24.sp,
        modifier = Modifier.padding(14.dp)
    )
}
