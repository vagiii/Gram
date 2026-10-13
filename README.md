# Gram — česká korektura pro Android

Gram je Android aplikace pro českou korekturu a překlad do češtiny.

## Česká korektura

Pravopisná a gramatická pravidla se vyhodnocují lokálně v aplikaci. Text při kontrole neopouští zařízení a korektura nepotřebuje API klíč. Kontrola shody podmětu s přísudkem pokrývá běžné tvary a známá podstatná jména v množném čísle (například „Děti běželi“ → „Děti běžely“). U neznámých podmětů a složitějších souvětí aplikace raději chybu neoznačí; nejde o úplnou morfologickou analýzu češtiny.

## Vyzkoušení aplikace

### Stažení APK z GitHubu

1. Otevři záložku **Actions** v repozitáři.
2. Vyber poslední běh **Build Android APK** na větvi `main`.
3. V sekci **Artifacts** stáhni `gram-debug-apk`.
4. Rozbal ZIP a nainstaluj `app-debug.apk` do telefonu.

APK se vytvoří automaticky při každé změně větve `main`. Artifakty jsou dostupné 14 dní. Debug APK může vyžadovat povolení instalace z prohlížeče/správce souborů.

### Sestavení v Android Studiu

1. Stáhni repozitář a otevři jeho složku v Android Studiu.
2. Nech Android Studio doinstalovat požadované Android SDK (API 36.1) a synchronizovat Gradle.
3. Vyber připojený telefon nebo emulátor a spusť konfiguraci app tlačítkem Run.

Pro samotnou korekturu není potřeba API klíč ani internet. Gemini klíč v lokálním souboru `.env` je potřeba pouze pro překlad.

## Technologie

- Kotlin a Jetpack Compose
- vlastní lokální pravidla pro český pravopis a shodu podmětu s přísudkem
- Gemini API pouze pro samostatnou funkci překladu
