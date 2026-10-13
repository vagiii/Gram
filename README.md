# Gram — česká korektura pro Android

Gram je Android aplikace pro českou korekturu a překlad do češtiny.

## Česká korektura

Pravopisná a gramatická pravidla se vyhodnocují lokálně v aplikaci. Text při kontrole neopouští zařízení a korektura nepotřebuje API klíč. Kontrola shody podmětu s přísudkem pokrývá běžné tvary a známá podstatná jména v množném čísle (například „Děti běželi“ → „Děti běžely“). U neznámých podmětů a složitějších souvětí aplikace raději chybu neoznačí; nejde o úplnou morfologickou analýzu češtiny.

## Vyzkoušení aplikace

1. Stáhni repozitář a otevři jeho složku v Android Studiu.
2. Nech Android Studio doinstalovat požadované Android SDK (API 36.1) a synchronizovat Gradle.
3. Vyber připojený telefon nebo emulátor a spusť konfiguraci app tlačítkem Run.

Pro vytvoření instalačního APK zvol v Android Studiu **Build > Build APK(s)**. Soubor najdeš v app/build/outputs/apk/debug/app-debug.apk. Pro samotnou korekturu není potřeba API klíč ani internet; Gemini klíč v lokálním souboru .env je potřeba jen pro překlad.

Gemini se používá pouze pro překlad z angličtiny; česká korektura běží offline.

## Technologie

- Kotlin a Jetpack Compose
- vlastní lokální pravidla pro český pravopis a shodu podmětu s přísudkem
- Gemini API pouze pro samostatnou funkci překladu
