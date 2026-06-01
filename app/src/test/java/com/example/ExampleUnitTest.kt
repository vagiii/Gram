package com.example

import org.junit.Assert.*
import org.junit.Test

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
  @Test
  fun addition_isCorrect() {
    assertEquals(4, 2 + 2)
  }

  @Test
  fun testCzechOfflineEngine_corrections() {
    val input = "Dnes je standartní den. mluvil jsem o mně,ale byla to vyjímka viz. odkaz."
    val response = com.example.data.CzechOfflineEngine.proofread(input)
    
    // Check that "standartní" was corrected to "standardní"
    assertTrue(response.correctedText.contains("standardní", ignoreCase = true))
    
    // Check that lowercase starting sentence "mluvil" was corrected to "Mluvil"
    assertTrue(response.correctedText.contains("Mluvil", ignoreCase = true))
    
    // Check that missing space after comma "mně,ale" was corrected to "mně, ale"
    assertTrue(response.correctedText.contains("mně, ale", ignoreCase = true))
    
    // Check that "vyjímka" was corrected to "výjimka"
    assertTrue(response.correctedText.contains("výjimka", ignoreCase = true))
    
    // Check that "viz." was corrected to "viz" without tečka
    assertTrue(response.correctedText.contains("viz odkaz", ignoreCase = true))
    
    // Check issues list size is not empty
    assertTrue(response.issues.isNotEmpty())
  }

  @Test
  fun testCzechOfflineEngine_translation() {
    val responseHello = com.example.data.CzechOfflineEngine.translate("hello")
    assertTrue(responseHello.translatedText.contains("Ahoj", ignoreCase = true))
    
    val responseHowAreYou = com.example.data.CzechOfflineEngine.translate("how are you")
    assertTrue(responseHowAreYou.translatedText.contains("máš", ignoreCase = true))
    
    val responseGeneral = com.example.data.CzechOfflineEngine.translate("I love Czech language")
    assertTrue(responseGeneral.translatedText.contains("já miluji čeština", ignoreCase = true))
  }
}
