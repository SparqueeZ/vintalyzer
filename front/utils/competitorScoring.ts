interface ScoreRange {
  min?: number;
  max?: number;
  points: number;
}

interface RankingLevel {
  min: number;
  max: number;
  name: string;
  color: string;
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

export const scoringRules: ScoringRules = {
  engagement: {
    maxPoints: 25,
    subscribers: {
      maxPoints: 15,
      ranges: [
        { max: 50, points: 3 },
        { min: 51, max: 200, points: 7 },
        { min: 201, max: 500, points: 10 },
        { min: 501, points: 15 }
      ]
    },
    rating: {
      maxPoints: 10,
      ranges: [
        { max: 4.0, points: 2 },
        { min: 4.0, max: 4.5, points: 5 },
        { min: 4.5, max: 5.0, points: 10 }
      ]
    }
  },
  sales: {
    maxPoints: 30,
    totalSales: {
      maxPoints: 15,
      ranges: [
        { max: 50, points: 3 },
        { min: 51, max: 200, points: 7 },
        { min: 201, max: 500, points: 10 },
        { min: 501, points: 15 }
      ]
    },
    monthlySales: {
      maxPoints: 15,
      ranges: [
        { max: 5, points: 3 },
        { min: 6, max: 15, points: 7 },
        { min: 16, max: 30, points: 10 },
        { min: 31, points: 15 }
      ]
    }
  },
  diversification: {
    maxPoints: 20,
    international: {
      maxPoints: 20,
      ranges: [
        { max: 0, points: 4 },      // Ventes locales uniquement
        { min: 1, max: 2, points: 10 },    // 1-2 pays
        { min: 3, points: 20 }      // 3+ pays = score maximum
      ]
    }
  },
  rankingLevels: [
    { min: 90, max: 100, name: 'Boutique Elite', color: '#FFD700' },       
    { min: 75, max: 89, name: 'Boutique Professionnelle', color: '#C0C0C0' }, 
    { min: 60, max: 74, name: 'Boutique Active', color: '#CD7F32' },       
    { min: 40, max: 59, name: 'Boutique en Développement', color: '#4CAF50' }, 
    { min: 0, max: 39, name: 'Boutique Débutante', color: '#2196F3' }      
  ]
};

const calculateRangeScore = (value: number | undefined, ranges: ScoreRange[]): number => {
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
      subscribers: calculateRangeScore(data.subscribers, scoringRules.engagement.subscribers.ranges),
      rating: calculateRangeScore(data.rating, scoringRules.engagement.rating.ranges)
    },
    sales: {
      totalSales: calculateRangeScore(data.totalSales, scoringRules.sales.totalSales.ranges),
      monthlySales: calculateRangeScore(data.monthlySales, scoringRules.sales.monthlySales.ranges)
    },
    diversification: {
      international: calculateRangeScore(data.internationalSales, scoringRules.diversification.international.ranges),
      brands: 0
    }
  };

  totalScore += details.engagement.subscribers + details.engagement.rating;
  totalScore += details.sales.totalSales + details.sales.monthlySales;
  totalScore += details.diversification.international;

  // Convertir le score en pourcentage sur 100
  const maxScore = 75; // Score maximum possible
  const scoreOn100 = Math.round((totalScore / maxScore) * 100);

  // Déterminer le niveau basé sur le score sur 100
  const level = scoringRules.rankingLevels.find(
    level => scoreOn100 >= level.min && scoreOn100 <= level.max
  );

  if (!level) {
    throw new Error('Niveau de score non trouvé');
  }

  return {
    totalScore,
    scoreOn100,
    details,
    level
  };
};
