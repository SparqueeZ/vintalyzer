import { defineNuxtPlugin } from "#app";
import { useUserStore } from "@/stores/UserStore";

export default defineNuxtPlugin(async (nuxtApp) => {
  const userStore = useUserStore();
  const router = nuxtApp.$router;

  // Appeler fetchUser pour récupérer les infos utilisateur
  await userStore.fetchUser();

  // Redirection selon l'état de l'utilisateur
  if (userStore.user.id) {
    console.log("Utilisateur connecté:", userStore.user);
    router.push("/app");
  } else {
    console.log("Utilisateur non connecté");
    router.push("/app/se-connecter");
  }
});
