# Bohemica Studio – webová aplikace

Webová verze se sestaví příkazem `npm run build`. Výsledné statické soubory budou ve složce `dist`; nahrají se na webový hosting jako obsah webu.

Pro vývoj spusťte `npm run dev`. Aplikace funguje offline po prvním načtení díky service workeru. Pro instalaci na Android musí být web dostupný přes HTTPS. V Chromu otevřete web a zvolte **Nainstalovat aplikaci** nebo **Přidat na plochu**.

Rukopisy a nastavení se ukládají lokálně v úložišti konkrétního prohlížeče. Webová a Android verze mezi sebou data automaticky nesynchronizují.
