import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useUserStore } from "@/stores/UserStore";

export default defineNuxtRouteMiddleware(async () => {
  // const userStore = useUserStore();
  // if (!userStore.user.firstname) {
  //   return navigateTo("/app/connexion");
  // }
});
