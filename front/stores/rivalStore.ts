import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";

interface RivalShop {
  name: string;
  content: string;
  date: string;
  rating: number;
  evaluationsCount: number; // Remplacer par reviews
  followers: number;
  globalRatings: Rating;
  location: string;
  autoRatings: Rating;
  membersRatings: Rating;
  ratingNumber: string;
}

interface Rating {
  count: string;
  rating: string;
}

interface RivalEvaluation {
  content: string;
  date: string;
  rating: string;
}

interface RivalArticle {
  content: string;
  memberName: string;
  date: string;
  rating: string;
}

interface FullData {
  shop: RivalShop;
  evaluations: RivalEvaluation[];
  articles: RivalArticle[];
}

interface Analysis {
  internationalData: {};
  averagePrice: number;
  CA: CA;
  brandStats: {};
  competitor: {};
  score: ScoreData;
}

interface CA {
  dailyCA: number;
  monthlyCA: number;
  dailySales: number;
  monthlySales: number;
  globalCA: number;
}

interface ScoreData {
  details: {
    diversification: {
      international: number;
      brands: number;
    };
    engagement: {
      subscribers: number;
      rating: number;
    };
    sales: {
      totalSales: number;
      monthlySales: number;
    };
  };
  level: {
    color: string;
    description: string;
    max: number;
    min: number;
    name: string;
    nicheAnalysis: string;
    tips: string[];
  };
  scoreOn100: number;
  totalScore: 75;
}

export const useRivalStore = defineStore("rivals", {
  state: () => ({
    shop: {} as RivalShop,
    evaluations: [] as RivalEvaluation[],
    articles: [] as RivalArticle[],
    analysis: {} as Analysis,
  }),
  actions: {
    setShopData(data: FullData) {
      console.log(
        "TODO : Mettre à jour les données de la boutique concurrente"
      );
      this.shop = data.shop;
      this.evaluations = data.evaluations;
      this.articles = data.articles;
    },
    async saveScanToBackend() {
      console.log(
        "TODO : Enregistrer les données de la boutique concurrente dans la base de données"
      );
    },
    setAnalysisData(data: Analysis) {
      this.analysis = data;
      console.log("Données d'analyse mises à jour: ", this.analysis);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRivalStore, import.meta.hot));
}
