import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";

import type {
  Shop,
  Sale,
  Expense,
  Comment,
  Statistics,
} from "../assets/types/shopTypes";

export const useSaleStore = defineStore("sales", {
  state: () => ({
    shop: {} as Shop,
    sales: [] as Sale[],
    coments: [] as Comment[],
    expenses: [] as Expense[],
    statistics: {} as Statistics,
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
        console.log("USERDATA", response);
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
        const coments = response.data.shops[0].Coments;
        const expenses = response.data.shops[0].Expenses;
        const statistics = response.data.shops[0].Statistics[0];
        this.shop = shop;
        this.sales = sales;
        this.coments = coments;
        this.expenses = expenses;
        this.statistics = statistics;
        // console.log("COMEMNTS INFO: ", response.data.shops[0]);
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
          statistics: this.statistics,
        });
        const response = await axios.post("/api/sales/load", {
          boutique: this.shop,
          ventes: this.sales,
          commentaires: this.coments,
          depenses: this.expenses,
          statistics: this.statistics,
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
    clearStore() {
      console.warn("Clearing store...");
      try {
        this.shop = {} as Shop;
        this.sales = [] as Sale[];
        this.coments = [] as Comment[];
        this.expenses = [] as Expense[];
        console.log("Store cleared.");
        return true;
      } catch (error: any) {
        this.error = error.message || "Une erreur s'est produite.";
        throw error;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSaleStore, import.meta.hot));
}
