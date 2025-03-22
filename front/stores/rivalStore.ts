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

export const useRivalStore = defineStore("rivals", {
  state: () => ({
    shop: {} as RivalShop,
    evaluations: [] as RivalEvaluation[],
    articles: [] as RivalArticle[],
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
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRivalStore, import.meta.hot));
}
