# Gram — česká korektura pro Android

Gram je Android aplikace pro českou korekturu a překlad do češtiny.

## Česká korektura

Pravopisná a gramatická pravidla se vyhodnocují lokálně v aplikaci. Text při kontrole neopouští zařízení a korektura nepotřebuje API klíč. Kontrola shody podmětu s přísudkem pokrývá běžné tvary a známá podstatná jména v množném čísle (například „Děti běželi“ → „Děti běžely“). U neznámých podmětů a složitějších souvětí aplikace raději chybu neoznačí; nejde o úplnou morfologickou analýzu češtiny.

## Spuštění

1. Otevři projekt v Android Studiu.
2. Pro volitelný překlad nastav GEMINI_API_KEY v lokálním souboru .env.
3. Spusť konfiguraci app na zařízení nebo emulátoru.

Gemini se používá pouze pro překlad z angličtiny; česká korektura běží offline.

## Technologie

- Kotlin a Jetpack Compose
- vlastní lokální pravidla pro český pravopis a shodu podmětu s přísudkem
- Gemini API pouze pro samostatnou funkci překladu
