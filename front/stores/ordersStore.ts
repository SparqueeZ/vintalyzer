import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";

export const useOrderStore = defineStore("orders", {
  state: () => ({
    orders: [],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchOrders() {
      this.loading = true;
      this.error = null;
      setTimeout(async () => {
        try {
          const response = await axios.get("/api/orders");
          this.orders = response.data;
          return this.orders;
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
  import.meta.hot.accept(acceptHMRUpdate(useOrderStore, import.meta.hot));
}
