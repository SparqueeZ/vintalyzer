import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";

export const useSaleStore = defineStore("sales", {
  state: () => ({
    sales: [],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchSales() {
      this.loading = true;
      this.error = null;
      setTimeout(async () => {
        try {
          const response = await axios.get("/api/sales");
          this.sales = response.data;
          return this.sales;
        } catch (error: any) {
          this.error = error.message || "Une erreur s'est produite.";
          throw error;
        } finally {
          this.loading = false;
        }
      }, 2000);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSaleStore, import.meta.hot));
}
