import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";

export const useThemeStore = defineStore("themes", {
  state: () => ({
    theme: "light" as "light" | "dark",
  }),
  actions: {},
});
