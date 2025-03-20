<!-- pages/test-parser.vue -->
<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl mb-4">Test Parser Vinted</h1>

    <textarea
      v-model="inputText"
      class="w-full h-64 p-2 border rounded mb-4"
      placeholder="Collez votre texte Vinted ici..."
    ></textarea>

    <button
      @click="analyze"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Analyser le texte
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDataStore } from "~/stores/dataStore";
import { useConcurrentStore } from "~/stores/concurrentStore";
import { concurrentAnalyzer } from "~/utils/concurrentAnalyzer";
import { launchAnalysis } from "~/utils/v2/analyzerEngine";

const store = useDataStore();
const saleStore = useSaleStore();
const concurrentStore = useConcurrentStore();
const inputText = ref("");
const concurrentText = ref("");
const result = ref<any>(null);
const concurrentResult = ref<any>(null);

const baseInformations = ref<any>(null);

function extract(pattern: RegExp, text: string, index?: number): string | null {
  const match = text.match(pattern);
  return match ? match[index] : null;
}

function extractAll(pattern: RegExp, text: string): RegExpExecArray[] {
  const matches: RegExpExecArray[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
}

// Fonction pour détecter la langue d'un texte
function detectLanguage(text: string): string | null {
  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.words.test(text.toLowerCase())) {
      return pattern.country;
    }
  }
  return null;
}

const analyze = async () => {
  try {
    const data = await launchAnalysis(inputText.value);
    saleStore.shop = data.shop;
    saleStore.coments = data.comments;
    saleStore.sales = data.sales;
    saleStore.expenses = data.expenses;
    saleStore.statistics = data.statistics;
    const response = await saleStore.loadSalesToBackend();
    console.log("Back-end response :", response);
    // console.log("Données analysées :", data);
  } catch (error) {
    console.error("Erreur lors de l'analyse :", error);
  }
  // analyzeText();
};

// Fonction pour sauvegarder le dressing
// async function saveDressing() {
//   const status = document.getElementById("status");
//   status.textContent = "Sauvegarde du dressing en cours...";
//   status.className = "";

//   try {
//     // Récupérer l'URL de l'onglet actif
//     const [tab] = await chrome.tabs.query({
//       active: true,
//       currentWindow: true,
//     });
//     const url = new URL(tab.url);

//     // Vérifier qu'on est sur une page Vinted
//     if (!url.hostname.includes("vinted.fr")) {
//       throw new Error("Veuillez ouvrir un dressing Vinted");
//     }

//     // Récupérer l'ID du vendeur
//     const sellerId = url.pathname.split("/")[2];
//     if (!sellerId) {
//       throw new Error("ID vendeur non trouvé");
//     }

//     console.log("ID vendeur:", sellerId);

//     // Injecter le script dans la page
//     const response = await chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       func: async (sellerId) => {
//         try {
//           console.log("Début requête API...");
//           const response = await fetch(
//             "https://www.vinted.fr/api/v2/users/" + sellerId + "/items",
//             {
//               method: "GET",
//               headers: {
//                 Accept: "application/json",
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           console.log("Réponse reçue:", response.status);
//           const data = await response.json();
//           console.log("Données reçues:", data);
//           return data;
//         } catch (error) {
//           console.error("Erreur dans la requête:", error);
//           throw error;
//         }
//       },
//       args: [sellerId],
//     });
//   } catch (error) {
//     console.error("Erreur:", error);
//     status.textContent = error.message;
//     status.className = "error";
//   }
// }

async function analyzeText() {
  console.log("Début de l'analyse");
  console.log("Texte à analyser:", inputText.value);

  try {
    const venteMatches = extractAll(patterns.venteStats, inputText.value);
    const realSaleMatches = extractAll(patterns.realSales, inputText.value);

    console.log("Ventes trouvées:", realSaleMatches);

    // Organiser les ventes par marque
    const ventesByMarque = new Map();
    let totalVentes = 0;
    let ventesNoMarque = [];

    // Extraire les informations de base
    const locMatch = inputText.value.match(/Nom de la boutique : (.+)/);
    const abonnesMatch = inputText.value.match(/Abonnés : (\d+)/);

    // Créer l'objet result
    result.value = {
      boutique: locMatch ? locMatch[1].trim() : null,
      abonnes: abonnesMatch ? parseInt(abonnesMatch[1]) : null,
      localisation: locMatch
        ? {
            ville: locMatch[1].trim(),
            pays: locMatch[2].trim(),
          }
        : null,
      ventes: [],
    };

    // Mettre à jour le store avec les données
    store.setAnalyzedData(result.value);

    venteMatches.forEach((match) => {
      const vente = {
        article: match[1],
        marque: match[2] || "Sans marque",
        prix: parseFloat(match[3].replace(",", ".")),
        vues: parseInt(match[4]),
      };

      totalVentes++;
      if (vente.marque === "Sans marque") {
        ventesNoMarque.push(vente);
      } else {
        if (!ventesByMarque.has(vente.marque)) {
          ventesByMarque.set(vente.marque, {
            ventes: [],
            totalPrix: 0,
            count: 0,
          });
        }
        const marqueStats = ventesByMarque.get(vente.marque);
        marqueStats.ventes.push(vente);
        marqueStats.totalPrix += vente.prix;
        marqueStats.count++;
      }
    });

    // Initialiser les variables pour les dépenses
    let totalVitrineDepense = 0;
    let totalBoostDepense = 0;
    let totalAchats = 0;
    const depenses = [];

    // Chercher les dépenses de vitrine
    const vitrineMatch = extractAll(patterns.vitrine, inputText.value);
    if (vitrineMatch) {
      vitrineMatch.forEach((match) => {
        const montant = Math.abs(parseFloat(match[1].replace(",", ".")));
        const date = match[2];
        totalVitrineDepense += montant;
        depenses.push({
          type: "vitrine",
          montant,
          date,
        });
      });
    }

    // Chercher les dépenses de boost
    const boostMatch = extractAll(patterns.boost, inputText.value);
    if (boostMatch) {
      boostMatch.forEach((match) => {
        const montant = Math.abs(parseFloat(match[1].replace(",", ".")));
        const date = match[2];
        totalBoostDepense += montant;
        depenses.push({
          type: "boost",
          montant,
          date,
        });
      });
    }

    // Chercher les achats
    const achatsMatch = extractAll(patterns.achats, inputText.value);
    if (achatsMatch) {
      achatsMatch.forEach((match) => {
        const article = match[1];
        const montant = Math.abs(parseFloat(match[2].replace(",", ".")));
        const date = match[3];
        totalAchats += montant;
        depenses.push({
          type: "achat",
          article,
          montant,
          date,
        });
      });
    }

    // Trier les dépenses par date
    depenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const salesByMonth = new Map();
    const pubByMonth = new Map();
    const achatsParMois = new Map();
    let totalRealSales = 0;
    let totalCA = 0;
    const listeAchats = [];

    // Chercher les ventes
    const ventesMatch = extractAll(patterns.realSales, inputText.value);
    if (ventesMatch) {
      // Utiliser un Set pour suivre les ventes uniques
      const uniqueSales = new Set();
      const ventes = [];

      ventesMatch.forEach((match) => {
        const vente = {
          article: match[1],
          prix: parseFloat(match[2].replace(",", ".")),
          date: match[3],
        };

        // Normaliser les données pour la comparaison
        const normalizedArticle = vente.article
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();
        const normalizedPrice = vente.prix.toFixed(2);
        const normalizedDate = vente.date
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        // Créer une clé unique normalisée pour cette vente
        const saleKey = `${normalizedArticle}|${normalizedPrice}|${normalizedDate}`;

        // Ne traiter la vente que si elle n'a pas déjà été vue
        if (!uniqueSales.has(saleKey)) {
          uniqueSales.add(saleKey);
          ventes.push({
            ...vente,
            marque: match[1].split(",")[0].trim(), // Extraire la marque du nom de l'article
          });

          const [, mois, annee] = vente.date.match(/(\w+) (\d{4})/);
          const monthKey = `${mois} ${annee}`;

          if (!salesByMonth.has(monthKey)) {
            salesByMonth.set(monthKey, {
              count: 0,
              ca: 0,
              showDetails: false,
              orders: [],
            });
          }

          const monthStats = salesByMonth.get(monthKey);
          monthStats.count++;
          monthStats.ca += vente.prix;
          monthStats.orders.push({
            item: vente.article,
            price: vente.prix,
            date: vente.date,
          });
          totalRealSales++;
          totalCA += vente.prix;
        }
      });

      // Mettre à jour le store avec les données analysées
      const totalViews = Array.from(ventesByMarque.values()).reduce(
        (sum, stats) => sum + stats.ventes.reduce((acc, v) => acc + v.vues, 0),
        0
      );

      const totalSales = Array.from(uniqueSales).length;
      const conversionRate =
        totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

      const storeData = {
        boutique: {
          nom: result.value.boutique,
          stats: {
            ventesParPays: result.value.statsVentes?.parPays,
          },
        },
        ventes: Array.from(uniqueSales).map((key) => {
          const [article, prix, date] = key.split("|");
          return {
            article,
            prix: parseFloat(prix),
            date,
          };
        }),
        ventes_stat: Array.from(ventesByMarque.entries()).map(
          ([marque, stats]) => ({
            marque,
            prix: stats.totalPrix,
            vues: stats.ventes.reduce((acc, v) => acc + v.vues, 0),
            count: stats.count,
            sales: stats.count,
            revenue: stats.totalPrix,
          })
        ),
        stats: {
          totalViews,
          totalSales,
          conversionRate,
        },
        depenses: depenses,
        expenses: {
          vitrine: totalVitrineDepense,
          boost: totalBoostDepense,
          achats: totalAchats,
          total: totalVitrineDepense + totalBoostDepense + totalAchats,
        },
        pub: {
          totalVitrine: totalVitrineDepense,
          totalBoost: totalBoostDepense,
          total: totalVitrineDepense + totalBoostDepense,
        },
      };

      console.log("Stats ventes par pays:", result.value.statsVentes?.parPays);
      console.log("Données envoyées au store:", storeData);
      console.log("Données de la boutique : ", result.value.boutique);
      store.setAnalyzedData(storeData);
    }

    // Analyser les commentaires
    const comments = extractAll(patterns.comments, inputText.value);
    const salesByCountry = new Map<string, number>();
    const commentsList = [];

    comments.forEach((comment) => {
      const commentText = comment[2]; // Le texte du commentaire
      const country = detectLanguage(commentText);
      if (country) {
        salesByCountry.set(country, (salesByCountry.get(country) || 0) + 1);
      }

      commentsList.push({
        auteur: comment[1],
        contenu: commentText,
        dateRelative: comment[3],
        langue: country,
      });
    });

    const data = {
      boutique: extract(patterns.boutiqueName, inputText.value, 1),
      abonnes: extract(patterns.abonnes, inputText.value, 1),
      localisation: {
        ville: extract(patterns.localisation, inputText.value, 1)?.trim(),
        pays: extract(patterns.localisation, inputText.value, 2)?.trim(),
      },
      statsVentes: {
        parMarque: Object.fromEntries(ventesByMarque),
        sansMarque: ventesNoMarque,
        parPays: Object.fromEntries(salesByCountry),
      },
      realSales: {
        totalVentes: totalRealSales,
        totalCA: totalCA,
        parMois: Object.fromEntries(salesByMonth),
      },
      pub: {
        totalVitrine: totalVitrineDepense,
        totalBoost: totalBoostDepense,
        parMois: Object.fromEntries(pubByMonth),
      },
      achats: {
        total: totalAchats,
        parMois: Object.fromEntries(achatsParMois),
        items: listeAchats,
      },
      comments: commentsList,
    };

    result.value = data;
    console.log("Résultat de l'analyse:", result.value);
    console.log("Analyse terminée avec succès");
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
  }
}

const toggleMonthDetails = (month) => {
  if (result.value?.realSales?.parMois[month]) {
    result.value.realSales.parMois[month].showDetails =
      !result.value.realSales.parMois[month].showDetails;
  }
};

async function analyzeConcurrent() {
  try {
    concurrentResult.value = await concurrentAnalyzer.analyze(
      concurrentText.value
    );
    concurrentStore.updateConcurrentData({
      boutique: concurrentResult.value.boutique,
      analyseVentes: concurrentResult.value.analyseVentes,
      articles: concurrentResult.value.articles,
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse du concurrent:", error);
  }
}

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>
