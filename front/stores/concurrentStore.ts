import { defineStore } from 'pinia'

interface Boutique {
  nom: string;
  note: number;
  evaluations: number;
  abonnes: number;
  articles: number;
  localisation?: {
    ville?: string;
    pays?: string;
  };
}

interface AnalyseVentes {
  totalVentes: number;
  ventesParMois: number;
  prixMoyen: number;
  paysActifs: string[];
}

interface ConcurrentState {
  boutique: Boutique | null;
  analyseVentes: AnalyseVentes | null;
  scoringData: any | null;
  articles: any[] | null;
}

export const useConcurrentStore = defineStore('concurrent', {
  state: (): ConcurrentState => ({
    boutique: null,
    analyseVentes: null,
    scoringData: null,
    articles: null
  }),

  actions: {
    setBoutique(data: Boutique) {
      this.boutique = data;
    },

    setAnalyseVentes(data: AnalyseVentes) {
      this.analyseVentes = data;
    },

    setScoringData(data: any) {
      this.scoringData = data;
    },

    // Action pour mettre à jour toutes les données d'un coup
    updateConcurrentData(data: any) {
      if (data.boutique) {
        this.boutique = data.boutique;
      }
      if (data.analyseVentes) {
        this.analyseVentes = data.analyseVentes;
      }
      if (data.articles) {
        this.articles = data.articles;
      }
      
      // Préparer les données de scoring
      this.scoringData = {
        subscribers: this.boutique?.abonnes,
        rating: this.boutique?.note,
        totalSales: this.analyseVentes?.totalVentes,
        monthlySales: this.analyseVentes?.ventesParMois,
        internationalSales: this.analyseVentes?.paysActifs?.length,
        brandsCount: this.articles?.length || 0
      };
    }
  },

  getters: {
    hasData: (state): boolean => !!state.boutique && !!state.analyseVentes,
    
    getBoutique: (state): Boutique | null => state.boutique,
    
    getAnalyseVentes: (state): AnalyseVentes | null => state.analyseVentes,
    
    getScoringData: (state): any | null => state.scoringData,
    
    getArticles: (state): any[] | null => state.articles
  }
})
