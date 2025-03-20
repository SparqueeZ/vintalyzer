import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";

export const useOrderStore = defineStore("orders", {
  state: () => ({
    orders: [] as any[], // Order[]
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchOrders() {
      this.loading = true;
      this.error = null;
      this.orders = [] as any[];
      try {
        const response = await axios.get("/api/orders");
        this.orders = response.data;
        return this.orders;
      } catch (error: any) {
        this.error = error.message || "Une erreur s'est produite.";
        throw error;
      } finally {
        setTimeout(async () => {
          this.loading = false;
        }, 2000);
      }
    },

    async updateOrderStatus(orderId: string, newStatus: string) {
      try {
        const order = this.orders.find((order) => order.id === orderId);
        if (!order) {
          throw new Error("Commande introuvable.");
        }
        order.status = newStatus;
        const response = await axios.put(`/api/orders/${orderId}/status`, {
          status: newStatus,
        });
        console.log("Statut mis à jour:", response.data);
      } catch (error: any) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        throw error;
      } finally {
        return true;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrderStore, import.meta.hot));
}
