import { getShopData, getSellData } from "./analyzers";

export const launchAnalysis = async (text: string) => {
  console.log("Lancement de l'analyse");

  // Extraire les informations de la boutique
  const shop = await getShopData(text);

  // Extraire les informations de vente
  const sells = await getSellData(text);
  console.log("Informations de la boutique:", shop);
  console.log("Informations de vente:", sells);
};
