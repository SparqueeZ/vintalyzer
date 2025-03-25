import {
  getCommentsData,
  getAveragePrice,
  getCA,
  getBrandStats,
  getShopScore,
  calculateScore,
} from "./rivalAnalyzer";
import type { FullData } from "~/assets/types/rivalShopTypes";

export const launchAnalysis = async (rivalShop: FullData) => {
  console.log("Lancement de l'analyse concurrente");

  const commentsData = await getCommentsData(rivalShop);
  console.log("International data:", commentsData);

  const averagePrice = getAveragePrice(rivalShop);
  console.log("Average price:", averagePrice);

  const CA = getCA(averagePrice, rivalShop.evaluations.length);
  console.log("CA:", CA);

  const brandsStats = getBrandStats(rivalShop);
  console.log("brandsStats:", brandsStats);

  const CompetitorData = {
    subscribers: rivalShop.shop.followers,
    rating: Number(rivalShop.shop.globalRatings.rating),
    totalSales: Number(rivalShop.evaluations.length),
    monthlySales: CA.monthlySales,
    internationalSales: commentsData.internationalSales,
  };

  console.log("Competitor data:", CompetitorData);
  const shopScore = calculateScore(CompetitorData);
  console.log("shopScore:", shopScore);

  return {
    commentsData,
    averagePrice,
    CA,
    brandsStats,
    competitor: CompetitorData,
    score: shopScore,
  };
};
