// Initial Sample Novel Data for Bohemica Studio
export const INITIAL_NOVEL = {
  title: "Stíny nad Malou Stranou",
  author: "Věra Nováková",
  genre: "Historický detektivní román",
  targetWordCount: 80000,
  dailyGoal: 1000,
  chapters: [
    {
      id: "chap-1",
      title: "Kapitola I. Mlha nad Vltavou",
      scenes: [
        {
          id: "scene-1-1",
          title: "Scéna 1: Setkání u Klementina",
          content: `Listopadová mlha se valila dlážděnými ulicemi Starého Města jako husté mléko. Pod starobylou lucernou u Klementina stály tři dívky a tiše se bavili o tajemném dopisu. Dívky šli dál k řece, kde na ně čekal inspektor Havlíček.

Havlíček se na ně podíval a chladně řekl: „Děkuji vám, že jste přijely. Víte pro mně něco nového?“

Klára vykročila vpřed, vyndala z pláště dopis a podala ho inspektorovi. „Tento dopis nám přímo předal tajemný muž v klobouku. Řekl mě, že pokud ho neotevřeme do půlnoci, stane se neštěstí.“

Havlíček se podíval na dopis a vzal ho z mojí ruky. Ve světle svíce viděl, že razítko pochází z lavičky u Vltavy. Byl to vlastně velmi krátký okamžik, kdy se všichni lekli. Jako by se celý svět na vteřinu zastavil.

Chlapci šly mezitím druhým břehem směrem k Malé Straně. Věděli, že musí nabýt novou baterii do svítilny a jít si mít ruce do kašny.`
        },
        {
          id: "scene-1-2",
          title: "Scéna 2: Zpověď v chrámu sv. Mikuláše",
          content: `Vzduch v chrámu voněl kadidlem a starým dřevem. Klára poklekla v šeru zpovědnice a naslouchala tichému šepotu z druhé strany mřížky.

„Otče, viděla jsem muže, který měl u pasu stříbrnou dýku. Rozuměl mě, i když jsem mluvila šeptem. Byl to pro mně šok.“

Kněz se odmlčel. Pak tiše řekl: „Bůh s tebou, dcero. Musíš bít opatrná.“`
        }
      ]
    },
    {
      id: "chap-2",
      title: "Kapitola II. Šifra ve věži",
      scenes: [
        {
          id: "scene-2-1",
          title: "Scéna 1: Vstup do astronomické věže",
          content: `Schodiště astronomické věže bylo úzké a strmé. Kamenné stupně chladily i přes silné podrážky bot.

Inspektor Havlíček stoupal vzhůru. Každý krok se rozléhal jako úder kostelního zvonu.`
        }
      ]
    }
  ],
  codex: [
    {
      id: "char-1",
      category: "Postavy",
      name: "Inspektor Václav Havlíček",
      role: "Hlavní vyšetřovatel",
      description: "Bývalý důstojník pražské policie, známý svou nekompromisní logikou a zálibou v dýmkovém tabáku. Věk 42 let."
    },
    {
      id: "char-2",
      category: "Postavy",
      name: "Klára Marešová",
      role: "Archivní asistentka v Klementinu",
      description: "Mladá historička s mimořádným talentem na luštění šifer a starých rukopisů."
    },
    {
      id: "loc-1",
      category: "Místa",
      name: "Klementinum",
      role: "Historická knihovna a kolej",
      description: "Rozsáhlý barokní komplex na Starém Městě. Sídlo tajného archivu astronomických map."
    },
    {
      id: "item-1",
      category: "Předměty",
      name: "Stříbrná šifrovací astroláb",
      role: "Klíčový artefakt",
      description: "Kovové zařízení s vyrytými alchymistickými symboly. Slouží k rozluštění souřadnic."
    }
  ]
};
