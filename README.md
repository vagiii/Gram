# Bohemica Studio pro Android

Gram je nahrazený offline verzí Bohemica Studio — mobilním editorem románu s lokální kontrolou české gramatiky a stylu.

## Co aplikace umí

- psát a organizovat rukopis do kapitol a scén
- uchovávat projekty a poznámky v zařízení
- kontrolovat text lokálními českými pravidly převzatými z Novel Studia
- navrhovat opravy a použít je v textu
- spravovat postavy a prostředí příběhu
- importovat a exportovat rukopis

Kontrola i ukládání probíhají v telefonu. APK nemá oprávnění k internetu a nepotřebuje API klíč. Pravidla jsou heuristická, takže aplikace nezachytí každou chybu a návrhy je vhodné zkontrolovat.

## Vyzkoušení aplikace

1. Otevři záložku **Actions** v repozitáři.
2. Vyber poslední běh **Build Android APK** na větvi `main`.
3. V sekci **Artifacts** stáhni `gram-debug-apk`.
4. Rozbal ZIP a nainstaluj `app-debug.apk` do telefonu.

APK se vytváří automaticky při změně větve `main`. Artifakty jsou dostupné 14 dní. Android může požadovat povolení instalace z prohlížeče nebo správce souborů.

## Technologie

- Android Kotlin WebView pro zabalení offline aplikace
- produkční React/Vite soubory v `app/src/main/assets/www`
- lokální ukládání projektů přes úložiště WebView
- import a export souborů přes systémové dialogy Androidu
