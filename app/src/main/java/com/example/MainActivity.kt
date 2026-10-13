package com.example

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import java.io.IOException

class MainActivity : ComponentActivity() {
  private lateinit var webView: WebView
  private var fileChooserCallback: android.webkit.ValueCallback<Array<Uri>>? = null
  private var pendingExportText: String? = null

  private val openTextFile = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
    fileChooserCallback?.onReceiveValue(uri?.let { arrayOf(it) })
    fileChooserCallback = null
  }

  private val saveTextFile = registerForActivityResult(ActivityResultContracts.CreateDocument("text/plain")) { uri ->
    val text = pendingExportText
    pendingExportText = null
    if (uri == null || text == null) return@registerForActivityResult
    try {
      contentResolver.openOutputStream(uri)?.use { it.write(text.toByteArray(Charsets.UTF_8)) }
      Toast.makeText(this, "Soubor byl uložen.", Toast.LENGTH_SHORT).show()
    } catch (_: IOException) {
      Toast.makeText(this, "Soubor se nepodařilo uložit.", Toast.LENGTH_LONG).show()
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    window.statusBarColor = Color.rgb(11, 15, 25)
    window.navigationBarColor = Color.rgb(11, 15, 25)
    window.decorView.systemUiVisibility = 0

    webView = WebView(this).apply {
      setBackgroundColor(Color.rgb(11, 15, 25))
      settings.javaScriptEnabled = true
      settings.domStorageEnabled = true
      settings.allowFileAccess = false
      settings.allowContentAccess = true
      settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
      addJavascriptInterface(AndroidBridge(), "AndroidBridge")
      webChromeClient = object : WebChromeClient() {
        override fun onShowFileChooser(
          view: WebView?,
          filePathCallback: android.webkit.ValueCallback<Array<Uri>>?,
          fileChooserParams: FileChooserParams?
        ): Boolean {
          fileChooserCallback?.onReceiveValue(null)
          fileChooserCallback = filePathCallback
          openTextFile.launch("text/*")
          return true
        }
      }
      webViewClient = object : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean =
          request?.url?.host != ASSET_HOST

        override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
          val uri = request?.url ?: return null
          if (uri.host != ASSET_HOST || !uri.path.orEmpty().startsWith(ASSET_PREFIX)) return null
          val relativePath = uri.path!!.removePrefix(ASSET_PREFIX)
          return try {
            val contentType = when (relativePath.substringAfterLast('.', "")) {
              "js" -> "text/javascript"
              "css" -> "text/css"
              "svg" -> "image/svg+xml"
              "png" -> "image/png"
              "woff", "woff2" -> "font/woff2"
              else -> "application/octet-stream"
            }
            WebResourceResponse(contentType, "UTF-8", assets.open("www/$relativePath"))
          } catch (_: IOException) {
            WebResourceResponse("text/plain", "UTF-8", "Not found".byteInputStream())
          }
        }
      }
      val html = assets.open("www/index.html").bufferedReader(Charsets.UTF_8).use { it.readText() }
      loadDataWithBaseURL(ASSET_BASE_URL, html, "text/html", "UTF-8", null)
    }
    setContentView(webView)
  }

  override fun onDestroy() {
    if (::webView.isInitialized) webView.destroy()
    super.onDestroy()
  }

  private inner class AndroidBridge {
    @JavascriptInterface
    fun copyText(content: String) {
      runOnUiThread {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("Rukopis", content))
        Toast.makeText(this@MainActivity, "Text byl zkopírován.", Toast.LENGTH_SHORT).show()
      }
    }

    @JavascriptInterface
    fun saveTextFile(filename: String, content: String) {
      runOnUiThread {
        pendingExportText = content
        this@MainActivity.saveTextFile.launch(filename.substringAfterLast('/').ifBlank { "rukopis.txt" })
      }
    }
  }

  private companion object {
    const val ASSET_HOST = "appassets.androidplatform.net"
    const val ASSET_PREFIX = "/assets/www/"
    const val ASSET_BASE_URL = "https://appassets.androidplatform.net/assets/www/"
  }
}
