import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";

export const useSaleStore = defineStore("sales", {
  state: () => ({
    shop: {},
    sales: [],
    coments: [],
    expenses: [],
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
    async fetchUserData() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get("/api/sales/data");
        console.log(response);
        const fetchedShop = response.data.shops[0];
        const shop = {
          name: fetchedShop.name,
          location: {
            country: fetchedShop.country,
            city: fetchedShop.city,
          },
          subscribers: fetchedShop.subscribers,
          email: fetchedShop.email,
        };
        const sales = response.data.shops[0].Sales;
        const coments = response.data.shops[0].Comments;
        const expenses = response.data.shops[0].Expenses;
        this.shop = shop;
        this.sales = sales;
        this.coments = coments;
        this.expenses = expenses;
        console.log("SHOP INFO: ", sales);
      } catch (error: any) {
        this.error = error.message || "Une erreur s'est produite.";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async loadSalesToBackend() {
      this.loading = true;
      this.error = null;
      try {
        console.log("Données envoyées au backend: ", {
          boutique: this.shop,
          ventes: this.sales,
          commentaires: this.coments,
          depenses: this.expenses,
        });
        const response = await axios.post("/api/sales/load", {
          boutique: this.shop,
          ventes: this.sales,
          commentaires: this.coments,
          depenses: this.expenses,
        });
        this.sales = response.data;
        return this.sales;
      } catch (error: any) {
        this.error = error.message || "Une erreur s'est produite.";
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSaleStore, import.meta.hot));
}
