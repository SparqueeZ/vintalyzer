import {
  getShopData,
  getSalesData,
  getCommentsData,
  getExpensesData,
} from "./analyzers";

export const launchAnalysis = async (text: string) => {
  console.log("Lancement de l'analyse");

  // Extraire les informations de la boutique
  const shop = await getShopData(text);

  // Extraire les informations de vente
  const sells = await getSalesData(text);

  // Extraire les informations des commentaires
  const comments = await getCommentsData(text);

  // Extraire les informations des dépenses
  const expenses = await getExpensesData(text);
  console.log("Informations de la boutique:", shop);
  console.log("Informations des ventes:", sells);
  console.log("Informations des commentaires:", comments);
  console.log("Informations des dépenses :", expenses);
};
