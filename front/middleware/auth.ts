import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useUserStore } from "@/stores/UserStore";

export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUserStore();

  // S'assurer que fetchUser est appelé avant la vérification
  if (!userStore.user) {
    return navigateTo("/app/se-connecter");
  }
});
