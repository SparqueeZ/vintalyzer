import { defineStore } from "pinia";

export const useDataStore = defineStore("dataStore", {
  state: () => ({
    analyzedData: null as any,
  }),

  actions: {
    setAnalyzedData(data: any) {
      this.analyzedData = data;
    },
  },

  getters: {
    hasVentes: (state) => state.analyzedData?.ventes?.length > 0,
    getVentes: (state) => state.analyzedData?.ventes || [],
    getVentesParJour: (state) => {
      if (!state.analyzedData?.ventes) return [];

      const ventesMap = new Map();
      state.analyzedData.ventes.forEach((vente: any) => {
        const date = new Date(vente.date).toISOString().split("T")[0];
        ventesMap.set(date, (ventesMap.get(date) || 0) + 1);
      });

      return Array.from(ventesMap.entries())
        .map(([date, count]) => ({
          date: new Date(date),
          count,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    },
  },
});
