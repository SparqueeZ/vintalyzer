export const fetchOrders = async () => {
  const { $pinia } = useNuxtApp();
  const orderStore = useOrderStore($pinia);
  const userStore = useUserStore($pinia);

  try {
    const response = await orderStore.fetchOrders();
    console.log("Réponse de fetchOrders:", response);
    return response;
  } catch (error: any) {
    console.log("Erreur lors du chargement des commandes:", error);
    if (error.status === 403) {
      const router = useRouter();
      userStore.sessionError = "Erreur lors de la vérification du token.";
      router.push("/app/connexion");
    }
  }
};
