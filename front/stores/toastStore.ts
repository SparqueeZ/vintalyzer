import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";

export const useToastStore = defineStore("toasts", {
  state: () => ({
    toast: null as string | null,
  }),
  actions: {},
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot));
}
