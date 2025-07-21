import type { Theme } from "@/app/page"

export interface KeywordData {
  definition: string
  expectedWords: string[]
}

export const gameData: { [theme: string]: { [keyword: string]: KeywordData } } = {
  all: {
    Santé: {
      definition: "État de bien-être physique, mental et social, pas seulement l'absence de maladie.",
      expectedWords: ["bien-être", "physique", "mental", "social", "maladie", "infirmité"],
    },
    Prévention: {
      definition: "Mesures mises en place pour éviter ou réduire les risques professionnels.",
      expectedWords: ["éviter", "réduire", "supprimer", "risque", "santé", "physique", "mentale", "mesures"],
    },
    Hygiène: {
      definition: "Mesures de prévention pour éviter les maladies.",
      expectedWords: ["prévention", "éviter", "maladies", "propreté", "infection", "contamination"],
    },
    Sécurité: {
      definition: "Mesures pour éliminer un danger ou limiter les effets d'un accident.",
      expectedWords: ["danger", "accident", "éliminer", "diminuer", "mesures", "protection", "objectif"],
    },
    "Conditions de travail": {
      definition: "Organisation, cadre, environnement, relations et exigences liées au travail.",
      expectedWords: ["organisation", "cadre", "moyens", "environnement", "relations", "exigences", "entreprise"],
    },
    Protection: {
      definition: "Moyens de défense contre un danger. Aide à assurer la sécurité.",
      expectedWords: ["danger", "protection", "sécurité", "exposition", "EPI", "filet", "aération", "ligne de vie"],
    },
    Danger: {
      definition: "Source potentielle de dommage ou d'effet nocif.",
      expectedWords: ["dommage", "nocif", "préjudice", "source", "milieu", "travail", "santé"],
    },
    Risque: {
      definition: "Conséquence prévisible d'un danger sur la santé.",
      expectedWords: ["danger", "santé", "conséquence", "accident", "prévisible", "altération"],
    },
    "Accident du travail": {
      definition: "Fait accidentel datable ayant causé une lésion dans un contexte professionnel.",
      expectedWords: ["accident", "travail", "lésion", "subordination", "lieu", "moment", "imputabilité"],
    },
    "Accident du trajet": {
      definition: "Accident survenu pendant un trajet domicile-travail ou repas-travail.",
      expectedWords: ["trajet", "domicile", "travail", "aller-retour", "repas", "accident", "sécurité sociale"],
    },
    "Maladie professionnelle": {
      definition: "Maladie causée par une exposition prolongée à un risque professionnel.",
      expectedWords: ["maladie", "exposition", "risque", "professionnelle", "tableaux", "INRS", "Cerfa"],
    },
  },

  // Thèmes spécialisés
  prevention: {
    Prévention: {
      definition: "Mesures mises en place pour éviter ou réduire les risques professionnels.",
      expectedWords: ["éviter", "réduire", "supprimer", "risque", "santé", "physique", "mentale", "mesures"],
    },
    Hygiène: {
      definition: "Mesures de prévention pour éviter les maladies.",
      expectedWords: ["prévention", "éviter", "maladies", "propreté", "infection", "contamination"],
    },
    Protection: {
      definition: "Moyens de défense contre un danger. Aide à assurer la sécurité.",
      expectedWords: ["danger", "protection", "sécurité", "exposition", "EPI", "filet", "aération", "ligne de vie"],
    },
  },

  securite: {
    Sécurité: {
      definition: "Mesures pour éliminer un danger ou limiter les effets d'un accident.",
      expectedWords: ["danger", "accident", "éliminer", "diminuer", "mesures", "protection", "objectif"],
    },
    Protection: {
      definition: "Moyens de défense contre un danger. Aide à assurer la sécurité.",
      expectedWords: ["danger", "protection", "sécurité", "exposition", "EPI", "filet", "aération", "ligne de vie"],
    },
    Danger: {
      definition: "Source potentielle de dommage ou d'effet nocif.",
      expectedWords: ["dommage", "nocif", "préjudice", "source", "milieu", "travail", "santé"],
    },
  },

  sante: {
    Santé: {
      definition: "État de bien-être physique, mental et social, pas seulement l'absence de maladie.",
      expectedWords: ["bien-être", "physique", "mental", "social", "maladie", "infirmité"],
    },
    "Conditions de travail": {
      definition: "Organisation, cadre, environnement, relations et exigences liées au travail.",
      expectedWords: ["organisation", "cadre", "moyens", "environnement", "relations", "exigences", "entreprise"],
    },
  },

  risque: {
    Risque: {
      definition: "Conséquence prévisible d'un danger sur la santé.",
      expectedWords: ["danger", "santé", "conséquence", "accident", "prévisible", "altération"],
    },
    Danger: {
      definition: "Source potentielle de dommage ou d'effet nocif.",
      expectedWords: ["dommage", "nocif", "préjudice", "source", "milieu", "travail", "santé"],
    },
  },

  accidents: {
    "Accident du travail": {
      definition: "Fait accidentel datable ayant causé une lésion dans un contexte professionnel.",
      expectedWords: ["accident", "travail", "lésion", "subordination", "lieu", "moment", "imputabilité"],
    },
    "Accident du trajet": {
      definition: "Accident survenu pendant un trajet domicile-travail ou repas-travail.",
      expectedWords: ["trajet", "domicile", "travail", "aller-retour", "repas", "accident", "sécurité sociale"],
    },
  },

  "maladie-pro": {
    "Maladie professionnelle": {
      definition: "Maladie causée par une exposition prolongée à un risque professionnel.",
      expectedWords: ["maladie", "exposition", "risque", "professionnelle", "tableaux", "INRS", "Cerfa"],
    },
  },
}

// Fonction pour normaliser un mot (enlever accents, pluriels, etc.)
export const normalizeWord = (word: string): string => {
  return (
    word
      .toLowerCase()
      .trim()
      // Enlever les accents
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Enlever les pluriels simples (s, x à la fin)
      .replace(/([^s])s$/, "$1")
      .replace(/([^x])x$/, "$1")
      // Enlever les tirets et espaces
      .replace(/[-\s]/g, "")
  )
}

// Fonction pour vérifier si un mot correspond à un mot attendu
export const isWordMatch = (playerWord: string, expectedWord: string): boolean => {
  const normalizedPlayer = normalizeWord(playerWord)
  const normalizedExpected = normalizeWord(expectedWord)

  // Correspondance exacte après normalisation
  if (normalizedPlayer === normalizedExpected) return true

  // Correspondance partielle (l'un contient l'autre)
  if (normalizedPlayer.includes(normalizedExpected) || normalizedExpected.includes(normalizedPlayer)) {
    // Éviter les correspondances trop courtes (moins de 3 caractères)
    return Math.min(normalizedPlayer.length, normalizedExpected.length) >= 3
  }

  return false
}

// Fonction pour trouver les mots correspondants
export const findMatchingWords = (playerWords: string[], expectedWords: string[]): string[] => {
  return playerWords.filter((playerWord) => expectedWords.some((expectedWord) => isWordMatch(playerWord, expectedWord)))
}

export const getRandomKeyword = (theme: Theme): { keyword: string; words: string[]; definition: string } => {
  const themeData = gameData[theme] || gameData.all
  const keywords = Object.keys(themeData)
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
  const keywordData = themeData[randomKeyword]

  return {
    keyword: randomKeyword,
    words: keywordData.expectedWords,
    definition: keywordData.definition,
  }
}

export const getAllKeywords = (theme: Theme): string[] => {
  const themeData = gameData[theme] || gameData.all
  return Object.keys(themeData)
}

export const getExpectedWords = (theme: Theme, keyword: string): string[] => {
  const themeData = gameData[theme] || gameData.all
  return themeData[keyword]?.expectedWords || []
}

export const getDefinition = (theme: Theme, keyword: string): string => {
  const themeData = gameData[theme] || gameData.all
  return themeData[keyword]?.definition || ""
}
