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
    assertTrue(response.correctedText.contains("standardní"))
    
    // Check that lowercase starting sentence "mluvil" was corrected to "Mluvil"
    assertTrue(response.correctedText.contains("Mluvil"))
    
    // Check that missing space after comma "mně,ale" was corrected to "mně, ale"
    assertTrue(response.correctedText.contains("mně, ale"))
    
    // Check that "vyjímka" was corrected to "výjimka"
    assertTrue(response.correctedText.contains("výjimka"))
    
    // Check that "viz." was corrected to "viz" without tečka
    assertTrue(response.correctedText.contains("viz odkaz"))
    
    // Check issues list size is not empty
    assertTrue(response.issues.isNotEmpty())
  }

  @Test
  fun testCzechOfflineEngine_translation() {
    val responseHello = com.example.data.CzechOfflineEngine.translate("hello")
    assertTrue(responseHello.translatedText.contains("Ahoj"))
    
    val responseHowAreYou = com.example.data.CzechOfflineEngine.translate("how are you")
    assertTrue(responseHowAreYou.translatedText.contains("máš"))
    
    val responseGeneral = com.example.data.CzechOfflineEngine.translate("I love Czech language")
    assertTrue(responseGeneral.translatedText.contains("já miluji čeština"))
  }
}
