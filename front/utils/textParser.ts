interface ExtractedData {
  username?: string;
  nom?: string;
  localisation?: { ville?: string; pays?: string };
  email?: string;
  telephone?: string;
  numeroEntreprise?: string;
  rcs?: { numero?: string; ville?: string };
  note?: number;
  commentaires?: string[];
  abonnes?: number;
  articlesActifs?: number;
  ventes?: Array<{
    description: string;
    montant: number;
    date: string;
  }>;
  ventesStats?: Array<{
    description: string;
    prix: number;
    marque: string;
    vues: number;
    favoris: number;
  }>;
  boosts?: Array<{
    date: string;
    montant: number;
  }>;
  vitrines?: Array<{
    date: string;
    montant: number;
  }>;
  transferts?: Array<{
    date: string;
    montant: number;
  }>;
  soldeFinal?: number;
}

// Patterns d'extraction pour l'analyse de texte Vinted
const patterns = {
  username: /([A-Za-z0-9_]+)\nÀ propos/,
  nom: /Rechercher des membres\s*\n\s*([^\n]+?)(?=\s*Pro|\s*@|$)/m,
  localisation: /À propos :[\s\n]*([^,\n]+),\s*([^\n]+)/,
  email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/,
  telephone: /(\+\d{11})/,
  numeroEntreprise: /Numéro d'entreprise[^\d]*(\d+)/,
  rcs: /(\d+)\s*R\.C\.S\s*([^\n]+)/,
  note: /\n([0-9]\.[0-9])\n\n\([0-9]+\)/,
  commentaire: /(?:il y a [^\n]+)\n([^\n]+?)(?:\nTraduire|\n|$)/g,
  abonnes: /(\d+)\s*Abonnés/,
  articlesActifs: /(\d+)\s*articles(?![^{]*vendus)/,
  venteAvecDate:
    /(?:Vente|Paiements de Vinted)\n([^€\n]+)\n(\d+[,.]\d{2}) ?€\n(\d{1,2} \w+ 2024)/g,
  venteStat:
    /([^,]+), prix : (\d+[,.]\d{2}) €, marque : ([^\n]+?)(?:, taille[^\n]+)?\nVendu\n(\d+) vues\n\n(\d+) favoris/g,
  boost: /(\d{1,2} \w+ 2024)\nCommande d'un Boost[^€]*-(\d+[,.]\d{2}) ?€/g,
  vitrine:
    /(\d{1,2} \w+ 2024)\nCommande Dressing en vitrine[^€]*-(\d+[,.]\d{2}) ?€/g,
  transfert:
    /(\d{1,2} \w+ 2024)\nTransfert vers le compte[^€]*-(\d+[,.]\d{2}) ?€/g,
  solde: /Solde final\s+(\d+[,.]\d{2})\s*€/,
};

// Extracteurs de données
const extractors = {
  extract: (pattern: RegExp, str: string, group = 1): string | null => {
    const match = str.match(pattern);
    return match ? match[group] : null;
  },

  extractAll: (pattern: RegExp, str: string): RegExpExecArray[] => {
    const matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(str)) !== null) {
      matches.push(match);
    }
    return matches;
  },
};

export function parseText(text: string): ExtractedData {
  console.log("Début de l'analyse du texte");
  console.log("Longueur du texte:", text.length);

  const data: ExtractedData = {};

  try {
    // Extraction des informations basiques
    data.username = extractors.extract(patterns.username, text);
    console.log("Username extrait:", data.username);

    data.nom = extractors.extract(patterns.nom, text);
    console.log("Nom extrait:", data.nom);

    const locMatch = text.match(patterns.localisation);
    if (locMatch) {
      data.localisation = {
        ville: locMatch[1],
        pays: locMatch[2],
      };
    }
    console.log("Localisation extraite:", data.localisation);

    data.email = extractors.extract(patterns.email, text);
    data.telephone = extractors.extract(patterns.telephone, text);

    // Informations entreprise
    data.numeroEntreprise = extractors.extract(patterns.numeroEntreprise, text);
    const rcsMatch = text.match(patterns.rcs);
    if (rcsMatch) {
      data.rcs = {
        numero: rcsMatch[1],
        ville: rcsMatch[2],
      };
    }

    // Stats et évaluations
    const noteStr = extractors.extract(patterns.note, text);
    data.note = noteStr ? parseFloat(noteStr) : undefined;
    console.log("Note extraite:", data.note);

    data.commentaires = extractors
      .extractAll(patterns.commentaire, text)
      .map((match) => match[1]);
    console.log("Nombre de commentaires extraits:", data.commentaires.length);

    const abonnesStr = extractors.extract(patterns.abonnes, text);
    data.abonnes = abonnesStr ? parseInt(abonnesStr) : undefined;

    const articlesStr = extractors.extract(patterns.articlesActifs, text);
    data.articlesActifs = articlesStr ? parseInt(articlesStr) : undefined;

    // Ventes
    data.ventes = extractors
      .extractAll(patterns.venteAvecDate, text)
      .map((match) => ({
        description: match[1],
        montant: parseFloat(match[2].replace(",", ".")),
        date: match[3],
      }));
    console.log("Nombre de ventes extraites:", data.ventes.length);

    data.ventesStats = extractors
      .extractAll(patterns.venteStat, text)
      .map((match) => ({
        description: match[1],
        prix: parseFloat(match[2].replace(",", ".")),
        marque: match[3],
        vues: parseInt(match[4]),
        favoris: parseInt(match[5]),
      }));

    // Marketing et finances
    data.boosts = extractors.extractAll(patterns.boost, text).map((match) => ({
      date: match[1],
      montant: parseFloat(match[2].replace(",", ".")),
    }));

    data.vitrines = extractors
      .extractAll(patterns.vitrine, text)
      .map((match) => ({
        date: match[1],
        montant: parseFloat(match[2].replace(",", ".")),
      }));

    data.transferts = extractors
      .extractAll(patterns.transfert, text)
      .map((match) => ({
        date: match[1],
        montant: parseFloat(match[2].replace(",", ".")),
      }));

    const soldeStr = extractors.extract(patterns.solde, text);
    data.soldeFinal = soldeStr
      ? parseFloat(soldeStr.replace(",", "."))
      : undefined;

    console.log("Analyse terminée avec succès");
    return data;
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
    throw error;
  }
}
