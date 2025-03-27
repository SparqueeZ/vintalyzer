import type { FullData, RivalArticle } from "~/assets/types/rivalShopTypes";

export const patterns = {
  // Mots-clés pour la détection des langues
  langues: {
    francais: [
      "merci beaucoup",
      "très satisfait",
      "colis bien reçu",
      "conforme à",
      "envoi soigné",
      "recommande vivement",
      "nickel",
      "impeccable",
      "ravie",
      "super vendeur",
      "très belle",
      "parfaitement",
      "génial",
      "rapidement reçu",
      "très contente",
      "excellent état",
      "trop bien",
      "je recommande",
      "emballage soigné",
      "livraison rapide",
      "parfait",
      "super",
      "rien à dire",
      "bien emballé",
      "rapide",
      "conforme",
      "reçu",
      "colis",
      "vendeur",
      "vendeuse",
      "envoi",
      "merci",
      "top",
      "satisfait",
      "contente",
      "belle",
      "bien",
      "très",
      "excellent",
      "service",
      "bon",
      "tout",
    ],
    anglais: [
      "thank you",
      "perfect",
      "well packed",
      "great seller",
      "fast shipping",
      "excellent condition",
      "very satisfied",
      "everything perfect",
      "good communication",
      "highly recommend",
      "arrived safely",
      "very happy",
      "awesome",
      "great service",
      "thanks",
      "received",
      "good",
      "nice",
      "great",
      "excellent",
      "perfect condition",
      "quick delivery",
      "well",
      "very good",
      "satisfied",
      "happy",
      "amazing",
      "wonderful",
      "best",
      "love",
      "super",
      "exactly as described",
      "fast",
      "safe",
      "recommended",
      "everything",
      "arrived",
      "item",
      "seller",
      "shipping",
      "packed",
      "quick",
      "fast",
      "good",
      "nice",
      "ty",
      "thx",
    ],
    espagnol: [
      "gracias",
      "perfecto",
      "muy bien",
      "excelente vendedor",
      "envío rápido",
      "todo perfecto",
      "muy satisfecho",
      "bien embalado",
      "recomiendo",
      "encanto",
      "genial",
      "muchas gracias",
      "muy contento",
      "vendedor excelente",
      "todo bien",
      "bien",
      "muy",
      "bueno",
      "excelente",
      "perfecto estado",
      "rápido",
      "buen",
      "súper",
      "estupendo",
      "gracias por",
      "todo",
      "llegó",
      "recibido",
      "vendedor",
      "envío",
      "embalaje",
      "satisfecho",
      "contento",
      "mil gracias",
    ],
    italien: [
      "grazie mille",
      "tutto perfetto",
      "ottimo venditore",
      "spedizione veloce",
      "bellissimo oggetto",
      "consigliato vivamente",
      "arrivato velocemente",
      "ottima comunicazione",
      "molto soddisfatta",
      "perfettamente imballato",
      "venditore serio",
      "grazie davvero",
      "tutto ok",
      "perfetto",
      "ottimo",
      "bellissimo",
      "veloce",
      "grazie",
      "bene",
      "molto",
      "buono",
      "eccellente",
      "consigliato",
      "spedizione",
      "venditore",
      "pacco",
      "ricevuto",
      "arrivato",
    ],
    allemand: [
      "vielen dank",
      "alles bestens",
      "schnelle lieferung",
      "gerne wieder",
      "sehr zufrieden",
      "super verpackt",
      "empfehlenswert",
      "danke schön",
      "toll verpackt",
      "sehr schnell",
      "perfekt wie beschrieben",
      "wirklich toll",
      "danke",
      "super",
      "gut",
      "sehr gut",
      "perfekt",
      "schnell",
      "bestens",
      "toll",
      "prima",
      "ausgezeichnet",
      "wunderbar",
      "alles gut",
      "gerne",
      "wieder",
      "empfehlen",
      "zufrieden",
      "paket",
      "verkäufer",
      "artikel",
      "erhalten",
      "angekommen",
    ],
    neerlandais: [
      "bedankt",
      "perfect",
      "goed verpakt",
      "snelle levering",
      "helemaal goed",
      "zeer tevreden",
      "prima",
      "uitstekend",
      "top",
      "geweldig",
      "super",
      "netjes",
      "mooi",
      "goed",
      "snel",
      "verzending",
      "verkoper",
      "ontvangen",
      "precies",
      "zoals beschreven",
      "dank",
      "fijn",
      "leuk",
    ],
    auto: ["Évaluation automatique : vente réalisée avec succès"],
  },
};

export const getCommentsData = async (rivalShop: FullData) => {
  const comments = rivalShop.evaluations;
  console.log("IL Y A ", rivalShop.evaluations.length, "COMMENTAIRES");
  // Stats by country
  const salesByCountry: { [key: string]: number } = {
    France: 0,
    Italie: 0,
    Allemagne: 0,
    Espagne: 0,
    Anglophones: 0,
    "Pays-Bas": 0,
  };

  // Get languages from comments
  comments.forEach((comment) => {
    const detectedLanguage = detectLanguage(comment.content);
    comment.language =
      detectedLanguage === "inconnu" ? "francais" : detectedLanguage;

    switch (comment.language) {
      case "italien":
        salesByCountry["Italie"]++;
        break;
      case "allemand":
        salesByCountry["Allemagne"]++;
        break;
      case "espagnol":
        salesByCountry["Espagne"]++;
        break;
      case "anglais":
        salesByCountry["Anglophones"]++;
        break;
      case "neerlandais":
        salesByCountry["Pays-Bas"]++;
        break;
      default:
        salesByCountry["France"]++;
    }
  });

  // Get out of France stats
  const internationalSales = Object.entries(salesByCountry)
    .filter(([pays]) => pays !== "France")
    .reduce((acc, [_, count]) => acc + count, 0);

  // Get a list of all comments in each language
  const commentsByLanguage = Object.keys(patterns.langues).reduce(
    (acc, langue) => {
      acc[langue] = comments.filter((comment) => comment.language === langue);
      return acc;
    },
    {} as { [key: string]: { id?: string; content: string }[] }
  );

  // Get percentages of international sales
  const internationalPercentage: { [key: string]: number } = {};
  for (const [pays, nombre] of Object.entries(salesByCountry)) {
    if (pays !== "France") {
      internationalPercentage[pays] =
        internationalSales > 0 ? (nombre / internationalSales) * 100 : 0;
      internationalPercentage[pays] = Number(
        internationalPercentage[pays].toFixed(2)
      );
    }
  }

  return {
    totalSales: comments.length,
    totalInternationalPercentage: Number(
      ((internationalSales / comments.length) * 100).toFixed(2)
    ),
    totalLocaleSales: comments.length - internationalSales,
    salesByCountry,
    internationalSales,
    internationalPercentage,
    commentsByLanguage,
    commentList: comments,

    //   ventesCommentees: commentaires.length,
    //   ventesNonCommentees: totalEvaluations - commentaires.length,
  };
};

export const getAveragePrice = (rivalShop: FullData) => {
  const articles = rivalShop.articles as RivalArticle[];

  // Trier les prix par ordre croissant
  const prices = articles.map((a) => a.price).sort((a, b) => a - b);

  // Calculer Q1 (25%) et Q3 (75%) pour détecter les outliers
  const q1Index = Math.floor(prices.length * 0.25);
  const q3Index = Math.floor(prices.length * 0.75);
  const q1 = prices[q1Index];
  const q3 = prices[q3Index];
  const iqr = q3 - q1;

  // Définir les limites pour les outliers (1.5 * IQR)
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Filtrer les prix en excluant les outliers
  const prixFiltres = prices.filter((p) => p >= lowerBound && p <= upperBound);

  // Calculer la médiane des prix filtrés
  const medianIndex = Math.floor(prixFiltres.length / 2);
  let prixMedian;
  if (prixFiltres.length % 2 === 0) {
    prixMedian = (prixFiltres[medianIndex - 1] + prixFiltres[medianIndex]) / 2;
  } else {
    prixMedian = prixFiltres[medianIndex];
  }

  // Calculer la moyenne des prix filtrés
  const moyenne =
    prixFiltres.reduce((sum, p) => sum + p, 0) / prixFiltres.length;

  // Utiliser une moyenne pondérée entre la médiane (60%) et la moyenne (40%)
  let prixFinal = prixMedian * 0.6 + moyenne * 0.4;

  // Appliquer une réduction progressive selon le nombre d'articles
  // Plus il y a d'articles, plus on réduit le prix moyen
  const reductionFactors = [
    { seuil: 50, reduction: 0.95 }, // -5% si plus de 50 articles
    { seuil: 100, reduction: 0.93 }, // -7% si plus de 100 articles
    { seuil: 200, reduction: 0.9 }, // -10% si plus de 200 articles
    { seuil: 500, reduction: 0.85 }, // -15% si plus de 500 articles
  ];

  // Trouver le facteur de réduction approprié
  const factor =
    reductionFactors.reverse().find((f) => articles.length >= f.seuil)
      ?.reduction || 1;

  prixFinal *= factor;

  return Math.round(prixFinal * 100) / 100; // Arrondir à 2 décimales
};

export const getCA = (averagePrice: number, evaluationsCount: number) => {
  const globalCA = Math.round(averagePrice * evaluationsCount * 100) / 100;
  const nombreMois = 12;
  const nombreJours = 365;

  // Calculer les statistiques
  const commandesParMois = evaluationsCount / nombreMois;
  const caParMois = globalCA / nombreMois;
  const commandesParJour = evaluationsCount / nombreJours;
  const caParJour = globalCA / nombreJours;

  return {
    globalCA,
    monthlySales: commandesParMois,
    monthlyCA: caParMois,
    dailySales: commandesParJour,
    dailyCA: caParJour,
  };
};

export const getBrandStats = (rivalShop: FullData) => {
  const articles = rivalShop.articles as RivalArticle[];
  // Get brand count
  const brandCount = articles.reduce((acc, a) => {
    const existingBrand = acc.find((b) => b.name === a.brand);
    if (existingBrand) {
      existingBrand.count++;
    } else {
      acc.push({ name: a.brand, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number; percentage?: number }[]);

  // Get brand with most articles
  const mostRepresentedBrand = brandCount.reduce(
    (acc, { name, count }) => {
      if (count > acc.count) {
        acc.name = name;
        acc.count = count;
      }
      return acc;
    },
    { name: "", count: 0 }
  );

  // Get top 5 brands
  const top5 = brandCount.sort((a, b) => b.count - a.count).slice(0, 5);

  // Get percentage of all brands
  const totalBrands = brandCount.reduce((acc, b) => acc + b.count, 0);
  for (const brand of brandCount) {
    brand.percentage = (brand.count / totalBrands) * 100;
    brand.percentage = Number(brand.percentage.toFixed(2));
  }

  return {
    brandCount,
    mostRepresentedBrand,
    top5,
  };
};

interface CompetitorData {
  subscribers?: number;
  rating?: number;
  totalSales?: number;
  monthlySales?: number;
  internationalSales?: number;
}
interface ScoreDetails {
  engagement: {
    subscribers: number;
    rating: number;
  };
  sales: {
    totalSales: number;
    monthlySales: number;
  };
  diversification: {
    international: number;
    brands: number;
  };
}
interface ScoringResult {
  totalScore: number;
  scoreOn100: number;
  details: ScoreDetails;
  level: RankingLevel;
}
interface RankingLevel {
  min: number;
  max: number;
  name: string;
  color: string;
  description: string;
  nicheAnalysis: string;
  tips: string[];
}
interface ScoreRange {
  min?: number;
  max?: number;
  points: number;
}
interface ScoringResult {
  totalScore: number;
  scoreOn100: number;
  details: ScoreDetails;
  level: RankingLevel;
}
interface ScoringCategory {
  maxPoints: number;
  ranges: ScoreRange[];
}
interface ScoringRules {
  engagement: {
    maxPoints: number;
    subscribers: ScoringCategory;
    rating: ScoringCategory;
  };
  sales: {
    maxPoints: number;
    totalSales: ScoringCategory;
    monthlySales: ScoringCategory;
  };
  diversification: {
    maxPoints: number;
    international: ScoringCategory;
  };
  rankingLevels: RankingLevel[];
}

export const scoringRules: ScoringRules = {
  engagement: {
    maxPoints: 25,
    subscribers: {
      maxPoints: 15,
      ranges: [
        { max: 50, points: 3 },
        { min: 51, max: 200, points: 7 },
        { min: 201, max: 500, points: 10 },
        { min: 501, points: 15 },
      ],
    },
    rating: {
      maxPoints: 10,
      ranges: [
        { max: 4.0, points: 2 },
        { min: 4.0, max: 4.5, points: 5 },
        { min: 4.5, max: 5.0, points: 10 },
      ],
    },
  },
  sales: {
    maxPoints: 30,
    totalSales: {
      maxPoints: 15,
      ranges: [
        { max: 50, points: 3 },
        { min: 51, max: 200, points: 7 },
        { min: 201, max: 500, points: 10 },
        { min: 501, points: 15 },
      ],
    },
    monthlySales: {
      maxPoints: 15,
      ranges: [
        { max: 5, points: 3 },
        { min: 6, max: 15, points: 7 },
        { min: 16, max: 30, points: 10 },
        { min: 31, points: 15 },
      ],
    },
  },
  diversification: {
    maxPoints: 20,
    international: {
      maxPoints: 20,
      ranges: [
        { max: 0, points: 4 }, // Ventes locales uniquement
        { min: 1, max: 2, points: 10 }, // 1-2 pays
        { min: 3, points: 20 }, // 3+ pays = score maximum
      ],
    },
  },
  rankingLevels: [
    {
      min: 90,
      max: 100,
      name: "Boutique Elite",
      color: "#FFD700",
      description:
        "Niche très rentable avec plus de 30 ventes/mois et une présence internationale établie.",
      nicheAnalysis:
        "Marché validé et rentable : forte demande internationale, excellente marge avec un prix moyen élevé. Potentiel de scaling important.",
      tips: [
        "💰 +30 ventes mensuelles = forte rentabilité",
        "🌍 Marché validé dans 3+ pays",
        "⭐ Note 4.8/5 = produits validés",
        "📈 Marge optimisée par volume",
      ],
    },
    {
      min: 75,
      max: 89,
      name: "Boutique Professionnelle",
      color: "#C0C0C0",
      description:
        "Niche profitable avec 15-30 ventes/mois et un début d'expansion internationale.",
      nicheAnalysis:
        "Marché porteur : demande régulière, bonne rentabilité. Potentiel d'optimisation des marges par le volume.",
      tips: [
        "💰 15-30 ventes/mois = bonne rentabilité",
        "🌍 2-3 pays = marché extensible",
        "⭐ Note 4.5+/5 = qualité validée",
        "📊 Volume suffisant pour négocier les prix",
      ],
    },
    {
      min: 60,
      max: 74,
      name: "Boutique Active",
      color: "#CD7F32",
      description:
        "Niche émergente avec 5-15 ventes/mois. Premiers signaux de rentabilité.",
      nicheAnalysis:
        "Marché en validation : demande existante, rentabilité à optimiser. Potentiel de croissance identifié.",
      tips: [
        "💰 5-15 ventes/mois = rentabilité croissante",
        "📈 Marge à optimiser par le volume",
        "🎯 Niche spécifique identifiée",
        "💡 Potentiel d'expansion visible",
      ],
    },
    {
      min: 40,
      max: 59,
      name: "Boutique en Développement",
      color: "#4CAF50",
      description:
        "Test de marché avec 2-5 ventes/mois. Phase de validation de la demande.",
      nicheAnalysis:
        "Marché en test : premières ventes encourageantes mais rentabilité à prouver. Ajustements nécessaires.",
      tips: [
        "📊 2-5 ventes/mois = validation en cours",
        "💰 Marge à calculer sur volume",
        "🎯 Niche à affiner",
        "📈 Potentiel à confirmer",
      ],
    },
    {
      min: 0,
      max: 39,
      name: "Boutique Débutante",
      color: "#2196F3",
      description:
        "Démarrage avec <2 ventes/mois. Phase d'exploration du marché.",
      nicheAnalysis:
        "Marché à tester : premières transactions mais rentabilité non prouvée. Pivot possible nécessaire.",
      tips: [
        "📊 <2 ventes/mois = phase test",
        "🎯 Niche à valider",
        "💰 Rentabilité à prouver",
        "⚠️ Pivot possible si non rentable",
      ],
    },
  ],
};

export const getShopScore = (data: CompetitorData) => {
  let totalScore = 0;
  const details: ScoreDetails = {
    engagement: {
      subscribers: calculateRangeScore(
        data.subscribers,
        scoringRules.engagement.subscribers.ranges
      ),
      rating: calculateRangeScore(
        data.rating,
        scoringRules.engagement.rating.ranges
      ),
    },
    sales: {
      totalSales: calculateRangeScore(
        data.totalSales,
        scoringRules.sales.totalSales.ranges
      ),
      monthlySales: calculateRangeScore(
        data.monthlySales,
        scoringRules.sales.monthlySales.ranges
      ),
    },
    diversification: {
      international: calculateRangeScore(
        data.internationalSales,
        scoringRules.diversification.international.ranges
      ),
      brands: 0,
    },
  };

  totalScore += details.engagement.subscribers + details.engagement.rating;
  totalScore += details.sales.totalSales + details.sales.monthlySales;
  totalScore += details.diversification.international;

  // Convertir le score en pourcentage sur 100
  const maxScore = 75; // Score maximum possible
  const scoreOn100 = Math.round((totalScore / maxScore) * 100);

  // Déterminer le niveau basé sur le score sur 100
  const level = scoringRules.rankingLevels.find(
    (level) => scoreOn100 >= level.min && scoreOn100 <= level.max
  );

  if (!level) {
    throw new Error("Niveau de score non trouvé");
  }

  return {
    totalScore,
    scoreOn100,
    details,
    level,
  };
};

const calculateRangeScore = (
  value: number | undefined,
  ranges: ScoreRange[]
): number => {
  if (value === undefined || value === null) {
    return 0;
  }

  for (const range of ranges) {
    if (range.max && !range.min && value <= range.max) {
      return range.points;
    }
    if (!range.max && range.min && value >= range.min) {
      return range.points;
    }
    if (range.min && range.max && value >= range.min && value <= range.max) {
      return range.points;
    }
  }

  return 0;
};
export const calculateScore = (data: CompetitorData): ScoringResult => {
  let totalScore = 0;
  const details: ScoreDetails = {
    engagement: {
      subscribers: calculateRangeScore(
        data.subscribers,
        scoringRules.engagement.subscribers.ranges
      ),
      rating: calculateRangeScore(
        data.rating,
        scoringRules.engagement.rating.ranges
      ),
    },
    sales: {
      totalSales: calculateRangeScore(
        data.totalSales,
        scoringRules.sales.totalSales.ranges
      ),
      monthlySales: calculateRangeScore(
        data.monthlySales,
        scoringRules.sales.monthlySales.ranges
      ),
    },
    diversification: {
      international: calculateRangeScore(
        data.internationalSales,
        scoringRules.diversification.international.ranges
      ),
      brands: 0,
    },
  };

  totalScore += details.engagement.subscribers + details.engagement.rating;
  totalScore += details.sales.totalSales + details.sales.monthlySales;
  totalScore += details.diversification.international;

  // Convertir le score en pourcentage sur 100
  const maxScore = 75; // Score maximum possible
  const scoreOn100 = Math.round((totalScore / maxScore) * 100);

  // Déterminer le niveau basé sur le score sur 100
  const level = scoringRules.rankingLevels.find(
    (level) => scoreOn100 >= level.min && scoreOn100 <= level.max
  );

  if (!level) {
    throw new Error("Niveau de score non trouvé");
  }

  return {
    totalScore,
    scoreOn100,
    details,
    level,
  };
};

const detectLanguage = (comment: string) => {
  const langues = patterns.langues;

  // Vérifier d'abord si c'est un commentaire automatique
  if (comment === patterns.langues.auto[0]) {
    return "auto";
  }

  const languesKeys = Object.keys(langues) as Array<keyof typeof langues>;
  const scores: { [key: string]: number } = {};
  const commentLower = comment.toLowerCase();

  // Initialiser les scores à 0
  languesKeys.forEach((langue) => {
    scores[langue] = 0;
  });

  // Calculer le score pour chaque langue avec pondération
  for (const langue of languesKeys) {
    if (langue === "auto") continue; // Ignorer la catégorie auto dans le calcul des scores
    for (const pattern of langues[langue]) {
      if (commentLower.includes(pattern.toLowerCase())) {
        const weight = Math.pow(pattern.length, 1.5) / 10;
        scores[langue] += weight;
      }
    }
  }

  const detectedLanguage = Object.entries(scores)
    .filter(([langue]) => langue !== "auto")
    .sort((a, b) => b[1] - a[1])[0];

  return detectedLanguage[1] > 0 ? detectedLanguage[0] : "inconnu";
};
