// Czech Paradigms Reference Data (České Vzory)
export const NOUN_PARADIGMS = {
  masculine_animate: [
    {
      name: "Pán",
      type: "Rod mužský životný - tvrdý",
      ending: "Tvrdé souhlásky (b, f, l, m, p, s, v, z + ch, k, r, d, t, n)",
      cases: {
        sg: ["pán", "pána", "pánovi/pánu", "pána", "páne!", "pánovi/pánu", "pánem"],
        pl: ["páni/pánové", "pánů", "pánům", "pány", "páni/pánové!", "pánech", "pány"]
      },
      example: "bratr, soused, voják, pes, student"
    },
    {
      name: "Muž",
      type: "Rod mužský životný - měkký",
      ending: "Měkké souhlásky (ž, š, č, ř, c, j, ň, ť, ď)",
      cases: {
        sg: ["muž", "muže", "mužovi/muži", "muže", "muži!", "mužovi/muži", "mužem"],
        pl: ["muži/mužové", "mužů", "mužům", "muže", "muži/mužové!", "mužích", "muži"]
      },
      example: "učitel, král, otec, lékař, spisovatel"
    },
    {
      name: "Předseda",
      type: "Rod mužský životný - zakončení na -a",
      ending: "Samohláska -a v 1. pádě",
      cases: {
        sg: ["předseda", "předsedy", "předsedovi", "předsedu", "předsedo!", "předsedovi", "předsedou"],
        pl: ["předsedové", "předsedů", "předsedům", "předsedy", "předsedové!", "předsedech", "předsedy"]
      },
      example: "hokejista, kolega, hrdina, starosta"
    },
    {
      name: "Soudce",
      type: "Rod mužský životný - zakončení na -e",
      ending: "Samohláska -e v 1. pádě",
      cases: {
        sg: ["soudce", "soudce", "soudci", "soudce", "soudce!", "soudci", "soudcem"],
        pl: ["soudci/soudcové", "soudců", "soudcům", "soudce", "soudci/soudcové!", "soudcích", "soudci"]
      },
      example: "poradce, důdce, dárce, průvodce"
    }
  ],
  masculine_inanimate: [
    {
      name: "Hrad",
      type: "Rod mužský neživotný - tvrdý",
      ending: "Tvrdé souhlásky",
      cases: {
        sg: ["hrad", "hradu", "hradu", "hrad", "hrade!", "hradě/hradu", "hradem"],
        pl: ["hrady", "hradů", "hradům", "hrady", "hrady!", "hradech", "hrady"]
      },
      example: "stůl, domov, les, román, příběh"
    },
    {
      name: "Stroj",
      type: "Rod mužský neživotný - měkký",
      ending: "Měkké a obojetné souhlásky",
      cases: {
        sg: ["stroj", "stroje", "stroji", "stroj", "stroji!", "stroji", "strojem"],
        pl: ["stroje", "strojů", "strojům", "stroje", "stroje!", "strojích", "stroji"]
      },
      example: "cíl, pokoj, míč, klič, počítač"
    }
  ],
  feminine: [
    {
      name: "Žena",
      type: "Rod ženský - zakončení na -a",
      ending: "Samohláska -a",
      cases: {
        sg: ["žena", "ženy", "ženě", "ženu", "ženo!", "ženě", "ženou"],
        pl: ["ženy", "žen", "ženám", "ženy", "ženy!", "ženách", "ženami"]
      },
      example: "kniha, kapitola, ruka, věta, postava"
    },
    {
      name: "Růže",
      type: "Rod ženský - zakončení na -e/-ě",
      ending: "Samohláska -e/-ě",
      cases: {
        sg: ["růže", "růže", "růži", "růži", "růže!", "růži", "růží"],
        pl: ["růže", "růží", "růžím", "růže", "růže!", "růžích", "růžemi"]
      },
      example: "ulice, chvíle, práce, vesnice, vášeň"
    },
    {
      name: "Píseň",
      type: "Rod ženský - zakončení na souhlásku (měkkou)",
      ending: "Měkká souhláska",
      cases: {
        sg: ["píseň", "písně", "písni", "píseň", "písni!", "písni", "písní"],
        pl: ["písně", "písní", "písním", "písně", "písně!", "písních", "písněmi"]
      },
      example: "dlaň, tvář, zář, báseň, mysl"
    },
    {
      name: "Kost",
      type: "Rod ženský - zakončení na souhlásku (tvrdou/obojetnou)",
      ending: "Tvrdá nebo obojetná souhláska",
      cases: {
        sg: ["kost", "kosti", "kosti", "kost", "kosti!", "kosti", "kostí"],
        pl: ["kosti", "kostí", "kostem", "kosti", "kosti!", "kostech", "kostmi"]
      },
      example: "noc, věc, radost, starost, část"
    }
  ],
  neuter: [
    {
      name: "Město",
      type: "Rod střední - zakončení na -o",
      ending: "Samohláska -o",
      cases: {
        sg: ["město", "města", "městu", "město", "město!", "městě/městu", "městem"],
        pl: ["města", "měst", "městům", "města", "města!", "městech", "městy"]
      },
      example: "slovo, dílo, okno, ticho, ráno"
    },
    {
      name: "Moře",
      type: "Rod střední - zakončení na -e",
      ending: "Samohláska -e",
      cases: {
        sg: ["moře", "moře", "moři", "moře", "moře!", "moři", "mořem"],
        pl: ["moře", "moří", "mořím", "moře", "moře!", "mořích", "moři"]
      },
      example: "pole, srdce, nebe, bojiště"
    },
    {
      name: "Kuře",
      type: "Rod střední - zakončení na -ě/-e (mláďata)",
      ending: "Označení mláďat a nedospělých osob",
      cases: {
        sg: ["kuře", "kuřete", "kuřeti", "kuře", "kuře!", "kuřeti", "kuřetem"],
        pl: ["kuřata", "kuřat", "kuřatům", "kuřata", "kuřata!", "kuřatech", "kuřaty"]
      },
      example: "dítě (v pl. děti), stěně, poupě, zvíře"
    },
    {
      name: "Stavení",
      type: "Rod střední - zakončení na -í",
      ending: "Samohláska -í (neskloňuje se příliš)",
      cases: {
        sg: ["stavení", "stavení", "stavení", "stavení", "stavení!", "stavení", "stavením"],
        pl: ["stavení", "stavení", "stavením", "stavení", "stavení!", "staveních", "staveními"]
      },
      example: "údolí, vyprávění, napětí, svědomí, psaní"
    }
  ]
};

export const CASE_NAMES = [
  "1. pád (Nominativ - Kdo? Co?)",
  "2. pád (Genitiv - Koho? Čeho?)",
  "3. pád (Dativ - Komu? Čemu?)",
  "4. pád (Akuzativ - Koho? Co?)",
  "5. pád (Vokativ - Oslovujeme, voláme)",
  "6. pád (Lokál - O kom? O čem?)",
  "7. pád (Instrumentál - S kým? S čím?)"
];
