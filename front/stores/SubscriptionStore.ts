import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";
import type { User, Role, Subscription } from "../assets/types/usersTypes";

export const useSubscriptionStore = defineStore("subscriptions", {
  state: () => ({
    subscriptions: [] as Subscription[],
    subscription: {} as Subscription,
    history: [] as Subscription[],
    loading: false,
  }),
  actions: {
    async fetchAllSubscriptions() {
      this.loading = true;
      try {
        const response = await axios.get("/api/subscriptions/all");
        this.subscriptions = response.data;
        return response;
      } catch (error) {
        throw error;
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }
    },
    async fetchUserSubscription() {
      this.loading = true;
      try {
        const response = await axios.get("/api/subscriptions");
        this.subscription = response.data;
        return response;
      } catch (error) {
        throw error;
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }
    },
    async fetchUserSubscriptionHistory() {
      this.loading = true;
      try {
        const response = await axios.get("/api/subscriptions/history");
        this.history = response.data;
        return response;
      } catch (error) {
        throw error;
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useSubscriptionStore, import.meta.hot)
  );
}
