import { patterns, extractors } from "./regexPatterns";

export const vintedAnalyzer = {
  analyze(text: string) {
    console.log("Début de l'analyse");
    // console.log("Texte reçu:", text); // Debug

    try {
      // Créer une copie des patterns pour éviter les problèmes avec le flag global
      const boutiqueName = new RegExp(patterns.boutiqueName.source, "g");
      const abonnes = new RegExp(patterns.abonnes.source, "g");

      const result = {
        boutique: {
          nom: extractors.extract(boutiqueName, text),
          abonnes: extractors.extract(abonnes, text),
        },
      };

      console.log("Résultats de l'analyse:", result);
      return result;
    } catch (error) {
      console.error("❌ Erreur lors de l'analyse:", error);
      throw error;
    }
  },
};
