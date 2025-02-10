import { acceptHMRUpdate, defineStore } from "pinia";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [] as Product[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;

      try {
        const response: { products: Product[] } = await $fetch(
          "http://192.168.1.11:3000/api/products"
        );
        this.products = response.products;
      } catch (err: any) {
        this.error = err.message || "Une erreur s'est produite.";
      } finally {
        this.loading = false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductsStore, import.meta.hot));
}
