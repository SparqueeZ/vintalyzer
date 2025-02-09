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
      @click="analyzeText"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Analyser le texte
    </button>

    <div v-if="result" class="mt-4">
      <h2 class="text-xl mb-2">Résultats :</h2>
      <div class="bg-gray-100 p-4 rounded overflow-auto">
        <div class="mb-4">
          <h3 class="font-bold">🏪 Informations de base</h3>
          <p>Nom de la boutique : {{ result.boutique }}</p>
          <p>Abonnés : {{ result.abonnes }}</p>
          <p v-if="result.localisation">Localisation : {{ result.localisation.ville ? result.localisation.ville + ', ' : '' }}{{ result.localisation.pays }}</p>
          
          <template v-if="result.statsVentes">
            <div class="mt-4">
              <h4 class="font-bold">📊 Statistiques des ventes</h4>
              
              <div class="grid grid-cols-4 gap-2 text-sm">
                <div class="font-semibold">Marque</div>
                <div class="font-semibold text-center">Ventes</div>
                <div class="font-semibold text-center">Total €</div>
                <div class="font-semibold text-center">Vues moy.</div>
              </div>

              <template v-for="(stats, marque) in result.statsVentes.parMarque" :key="marque">
                <div class="grid grid-cols-4 gap-2 text-sm py-1 border-b">
                  <div>{{ marque }}</div>
                  <div class="text-center">{{ stats.count }}</div>
                  <div class="text-center">{{ stats.totalPrix.toFixed(2) }}€</div>
                  <div class="text-center">{{ Math.round(stats.ventes.reduce((acc, v) => acc + v.vues, 0) / stats.count) }}</div>
                </div>
              </template>

              <template v-if="result.statsVentes.sansMarque.length > 0">
                <div class="grid grid-cols-4 gap-2 text-sm py-1 border-b">
                  <div>Sans marque</div>
                  <div class="text-center">{{ result.statsVentes.sansMarque.length }}</div>
                  <div class="text-center">{{ result.statsVentes.sansMarque.reduce((acc, v) => acc + v.prix, 0).toFixed(2) }}€</div>
                  <div class="text-center">{{ Math.round(result.statsVentes.sansMarque.reduce((acc, v) => acc + v.vues, 0) / result.statsVentes.sansMarque.length) }}</div>
                </div>
              </template>

              <div class="mt-4">
                <h4 class="font-bold">🌍 Répartition des ventes par pays</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div v-for="(ventes, pays) in result.statsVentes.parPays" :key="pays">
                    <p v-if="ventes > 0">
                      {{ pays }}: {{ ventes }} ventes 
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="result.realSales">
            <div class="mt-6">
              <h4 class="font-bold">💰 Résultats</h4>
              <p class="mb-2">
                Ventes : {{ result.realSales.totalVentes }} ventes - {{ result.realSales.totalCA.toFixed(2) }}€<br>
                Dépenses vitrine : {{ result.pub?.totalVitrine.toFixed(2) }}€<br>
                Dépenses boost : {{ result.pub?.totalBoost.toFixed(2) }}€<br>
                Achats : {{ result.achats?.total.toFixed(2) }}€<br>
                <strong>CA Total : {{ (result.realSales.totalCA + (result.pub?.totalVitrine || 0) + (result.pub?.totalBoost || 0) + (result.achats?.total || 0)).toFixed(2) }}€</strong>
              </p>

              <div class="overflow-x-auto mt-2">
                <table class="min-w-full bg-white">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="py-2 px-4 text-left">Mois</th>
                      <th class="py-2 px-4 text-left">Ventes</th>
                      <th class="py-2 px-4 text-left">CA Ventes</th>
                      <th class="py-2 px-4 text-left">Vitrine</th>
                      <th class="py-2 px-4 text-left">Boost</th>
                      <th class="py-2 px-4 text-left">Achats</th>
                      <th class="py-2 px-4 text-left">CA Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(stats, month) in result.realSales.parMois" :key="month">
                      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          <button @click="toggleMonthDetails(month)" class="flex items-center space-x-2">
                            <span>{{ month }}</span>
                            <svg :class="{'rotate-180': result.realSales.parMois[month].showDetails}" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                        </td>
                        <td class="px-6 py-4">{{ stats.count }}</td>
                        <td class="px-6 py-4">{{ stats.ca.toFixed(2) }}€</td>
                        <td class="px-6 py-4">{{ (result.pub?.parMois[month]?.vitrine || 0).toFixed(2) }}€</td>
                        <td class="px-6 py-4">{{ (result.pub?.parMois[month]?.boost || 0).toFixed(2) }}€</td>
                        <td class="px-6 py-4">{{ (result.achats?.parMois[month] || 0).toFixed(2) }}€</td>
                        <td class="px-6 py-4 font-bold">{{ (stats.ca + (result.pub?.parMois[month]?.vitrine || 0) + (result.pub?.parMois[month]?.boost || 0) + (result.achats?.parMois[month] || 0)).toFixed(2) }}€</td>
                      </tr>
                      <!-- Détails des commandes du mois -->
                      <tr v-if="result.realSales.parMois[month].showDetails" class="bg-gray-50 dark:bg-gray-900">
                        <td colspan="7" class="px-6 py-4">
                          <div class="space-y-4">
                            <h4 class="font-medium text-gray-900 dark:text-white">Détails des commandes :</h4>
                            <div class="grid gap-4">
                              <div v-for="(order, orderIndex) in result.realSales.parMois[month].orders" :key="orderIndex" 
                                   class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                <div class="flex justify-between items-start">
                                  <div>
                                    <p class="font-medium text-gray-900 dark:text-white">
                                      {{ order.item }}
                                    </p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                      Prix : {{ order.price }}€
                                    </p>
                                  </div>
                                  <span class="text-sm text-gray-500 dark:text-gray-400">
                                    {{ order.date }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </template>

          <template v-if="result.pub">
            <div class="mt-6">
              <h4 class="font-bold">📢 Dépenses publicitaires</h4>
              <p>
                Total dépenses vitrine : {{ result.pub.totalVitrine.toFixed(2) }}€<br>
                Total dépenses boost : {{ result.pub.totalBoost.toFixed(2) }}€<br>
                Total dépenses : {{ (result.pub.totalVitrine + result.pub.totalBoost).toFixed(2) }}€
              </p>

              <div class="overflow-x-auto mt-2">
                <table class="min-w-full bg-white">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="py-2 px-4 text-left">Mois</th>
                      <th class="py-2 px-4 text-left">Vitrine</th>
                      <th class="py-2 px-4 text-left">Boost</th>
                      <th class="py-2 px-4 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(stats, month) in result.pub.parMois" :key="month">
                      <td class="py-2 px-4">{{ month }}</td>
                      <td class="py-2 px-4">{{ stats.vitrine.toFixed(2) }}€</td>
                      <td class="py-2 px-4">{{ stats.boost.toFixed(2) }}€</td>
                      <td class="py-2 px-4">{{ (stats.vitrine + stats.boost).toFixed(2) }}€</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p class="mt-4 font-bold">
                Bénéfice net : {{ (result.realSales.totalCA + result.pub.totalVitrine + result.pub.totalBoost).toFixed(2) }}€
              </p>
            </div>
          </template>

          <template v-if="result.achats?.items?.length">
            <div class="mt-6">
              <h4 class="font-bold">🛍️ Mes achats</h4>
              <div class="overflow-x-auto mt-2">
                <table class="min-w-full bg-white">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="py-2 px-4 text-left">Article</th>
                      <th class="py-2 px-4 text-left">Prix</th>
                      <th class="py-2 px-4 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(achat, index) in result.achats.items" :key="index">
                      <td class="py-2 px-4">{{ achat.article }}</td>
                      <td class="py-2 px-4">{{ achat.prix.toFixed(2) }}€</td>
                      <td class="py-2 px-4">{{ achat.date }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>

          <template v-if="result.comments">
            <div class="mt-6">
              <h4 class="font-bold">💬 Commentaires</h4>
              <p>Commentaires analysés : {{ result.comments.length }}</p>
              <div class="mt-2">
                <p class="font-semibold">Derniers commentaires :</p>
                <div class="space-y-2">
                  <div v-for="(comment, index) in result.comments.slice(-3)" :key="index" class="p-2 bg-white rounded">
                    <p class="text-sm text-gray-600">{{ comment.auteur }} - {{ comment.dateRelative }}</p>
                    <p>{{ comment.contenu }}</p>
                    <p class="text-xs text-gray-500">Langue détectée : {{ comment.langue }}</p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="logs.length" class="mt-4">
      <h3 class="font-bold">📝 Logs</h3>
      <pre class="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">{{ logs.join('\n') }}</pre>
    </div>

    <div class="mt-12 border-t pt-8">
      <h2 class="text-xl mb-4">🔍 Analyse des concurrents</h2>
      <textarea
        v-model="concurrentText"
        class="w-full h-64 p-2 border rounded mb-4"
        placeholder="Collez le texte de la boutique concurrente ici..."
      ></textarea>
      
      <button
        @click="analyzeConcurrent"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Analyser le concurrent
      </button>

      <div v-if="concurrentResult" class="mt-4">
        <h3 class="text-lg mb-2">Résultats de l'analyse du concurrent :</h3>
        <div class="bg-gray-100 p-4 rounded overflow-auto">
          <div class="mb-4">
            <h4 class="font-bold">🏪 Informations Boutique</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="font-semibold">Nom</p>
                <p>{{ concurrentResult.boutique.nom }}</p>
              </div>
              <div>
                <p class="font-semibold">Note</p>
                <p>{{ concurrentResult.boutique.note }}/5</p>
              </div>
              <div>
                <p class="font-semibold">Abonnés</p>
                <p>{{ concurrentResult.boutique.abonnes }}</p>
              </div>
              <div>
                <p class="font-semibold">Articles</p>
                <p>{{ concurrentResult.boutique.articles }}</p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="font-bold">📊 Statistiques des ventes</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="font-semibold">Prix moyen</p>
                <p>{{ concurrentResult.prixMoyen.toFixed(2) }}€</p>
              </div>
              <div>
                <p class="font-semibold">Chiffre d'affaires</p>
                <p>{{ concurrentResult.chiffreAffaires.toFixed(2) }}€</p>
              </div>
              <div>
                <p class="font-semibold">CA mensuel moyen</p>
                <p>{{ concurrentResult.statsTemporelles.caParMois.toFixed(2) }}€</p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="font-bold">🌍 Répartition des ventes par pays</h4>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="(ventes, pays) in concurrentResult.analyseVentes.ventesParPays" :key="pays">
                <p v-if="ventes > 0">
                  {{ pays }}: {{ ventes }} ventes 
                  ({{ (ventes / concurrentResult.analyseVentes.totalVentes * 100).toFixed(1) }}%)
                </p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="font-bold">📈 Statistiques temporelles</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="font-semibold">Commandes par mois</p>
                <p>{{ concurrentResult.statsTemporelles.commandesParMois }}</p>
              </div>
              <div>
                <p class="font-semibold">Commandes par jour</p>
                <p>{{ concurrentResult.statsTemporelles.commandesParJour }}</p>
              </div>
              <div>
                <p class="font-semibold">CA par mois</p>
                <p>{{ concurrentResult.statsTemporelles.caParMois.toFixed(2) }}€</p>
              </div>
              <div>
                <p class="font-semibold">CA par jour</p>
                <p>{{ concurrentResult.statsTemporelles.caParJour.toFixed(2) }}€</p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="font-bold">🏷️ Articles et marques</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="font-semibold">Articles analysés</p>
                <p>{{ concurrentResult.articles.length }}</p>
              </div>
              <div>
                <p class="font-semibold">Marques uniques</p>
                <p>{{ concurrentResult.scoringData.brandsCount }}</p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="font-bold">💬 Commentaires</h4>
            <p>Commentaires analysés : {{ concurrentResult.commentaires.length }}</p>
            <div class="mt-2">
              <p class="font-semibold">Derniers commentaires :</p>
              <div class="space-y-2">
                <div v-for="(comment, index) in concurrentResult.commentaires.slice(-3)" :key="index" class="p-2 bg-white rounded">
                  <p class="text-sm text-gray-600">{{ comment.auteur }} - {{ comment.dateRelative }}</p>
                  <p>{{ comment.contenu }}</p>
                  <p class="text-xs text-gray-500">Langue détectée : {{ comment.langue }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <h3 class="font-bold">📝 Logs Console</h3>
      <pre class="whitespace-pre-wrap text-sm">{{ logs.join('\n') }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { patterns } from '~/utils/regexPatterns'
import { concurrentAnalyzer } from '~/utils/concurrentAnalyzer'

const inputText = ref('')
const concurrentText = ref('')
const result = ref<any>(null)
const concurrentResult = ref<any>(null)
const logs = ref<string[]>([])

// Intercepter les logs de la console
const originalConsole = {
  log: console.log,
  error: console.error,
  group: console.group,
  groupEnd: console.groupEnd
}

let indentation = 0

console.log = (...args) => {
  originalConsole.log(...args)
  logs.value.push('  '.repeat(indentation) + args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' '))
}

console.error = (...args) => {
  originalConsole.error(...args)
  logs.value.push('❌ ' + '  '.repeat(indentation) + args.join(' '))
}

console.group = (label) => {
  originalConsole.group(label)
  logs.value.push('  '.repeat(indentation) + '📂 ' + label)
  indentation++
}

console.groupEnd = () => {
  originalConsole.groupEnd()
  indentation = Math.max(0, indentation - 1)
}

function extract(pattern: RegExp, text: string, index?: number): string | null {
  const match = text.match(pattern)
  return match ? match[index] : null
}

function extractAll(pattern: RegExp, text: string): RegExpExecArray[] {
  const matches: RegExpExecArray[] = []
  let match
  while ((match = pattern.exec(text)) !== null) {
    matches.push(match)
  }
  return matches
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

async function analyzeText() {
  logs.value = []
  console.log('Début de l\'analyse')
  console.log('Texte à analyser:', inputText.value)
  
  try {
    const locMatch = inputText.value.match(patterns.localisation)
    const venteMatches = extractAll(patterns.venteStats, inputText.value)
    const realSaleMatches = extractAll(patterns.realSales, inputText.value)
    
    console.log('Ventes trouvées:', realSaleMatches)
    
    // Organiser les ventes par marque
    const ventesByMarque = new Map()
    let totalVentes = 0
    let ventesNoMarque = []

    venteMatches.forEach(match => {
      const vente = {
        article: match[1],
        marque: match[2] || 'Sans marque',
        prix: parseFloat(match[3].replace(',', '.')),
        vues: parseInt(match[4])
      }
      
      totalVentes++
      if (vente.marque === 'Sans marque') {
        ventesNoMarque.push(vente)
      } else {
        if (!ventesByMarque.has(vente.marque)) {
          ventesByMarque.set(vente.marque, {
            ventes: [],
            totalPrix: 0,
            count: 0
          })
        }
        const marqueStats = ventesByMarque.get(vente.marque)
        marqueStats.ventes.push(vente)
        marqueStats.totalPrix += vente.prix
        marqueStats.count++
      }
    })

    const salesByMonth = new Map()
    const pubByMonth = new Map()
    const achatsParMois = new Map()
    let totalRealSales = 0
    let totalCA = 0
    let totalVitrineDepense = 0
    let totalBoostDepense = 0
    let totalAchats = 0
    const listeAchats = []

    // Chercher les ventes
    const ventesMatch = extractAll(patterns.realSales, inputText.value)
    if (ventesMatch) {
      // Utiliser un Set pour suivre les ventes uniques
      const uniqueSales = new Set()
      
      ventesMatch.forEach(match => {
        const vente = {
          article: match[1],
          prix: parseFloat(match[2].replace(',', '.')),
          date: match[3]
        }
        
        // Normaliser les données pour la comparaison
        const normalizedArticle = vente.article
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim()
        const normalizedPrice = vente.prix.toFixed(2)
        const normalizedDate = vente.date
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim()
        
        // Créer une clé unique normalisée pour cette vente
        const saleKey = `${normalizedArticle}|${normalizedPrice}|${normalizedDate}`
        
        // Ne traiter la vente que si elle n'a pas déjà été vue
        if (!uniqueSales.has(saleKey)) {
          uniqueSales.add(saleKey)
          
          const [, mois, annee] = vente.date.match(/(\w+) (\d{4})/)
          const monthKey = `${mois} ${annee}`
          
          if (!salesByMonth.has(monthKey)) {
            salesByMonth.set(monthKey, {
              count: 0,
              ca: 0,
              showDetails: false,
              orders: []
            })
          }
          
          const monthStats = salesByMonth.get(monthKey)
          monthStats.count++
          monthStats.ca += vente.prix
          monthStats.orders.push({
            item: vente.article,
            price: vente.prix,
            date: vente.date
          })
          totalRealSales++
          totalCA += vente.prix
        }
      })
    }

    // Chercher les dépenses de vitrine
    const vitrineMatch = extractAll(patterns.vitrine, inputText.value)
    if (vitrineMatch) {
      vitrineMatch.forEach(match => {
        const prix = parseFloat(match[1].replace(',', '.'))
        const date = match[2]
        const [, mois, annee] = date.match(/(\w+) (\d{4})/)
        const monthKey = `${mois} ${annee}`
        
        if (!pubByMonth.has(monthKey)) {
          pubByMonth.set(monthKey, {
            vitrine: 0,
            boost: 0
          })
        }
        
        const monthStats = pubByMonth.get(monthKey)
        monthStats.vitrine += prix
        totalVitrineDepense += prix
      })
    }

    // Chercher les dépenses de boost
    const boostMatch = extractAll(patterns.boost, inputText.value)
    if (boostMatch) {
      boostMatch.forEach(match => {
        const prix = parseFloat(match[1].replace(',', '.'))
        const date = match[2]
        const [, mois, annee] = date.match(/(\w+) (\d{4})/)
        const monthKey = `${mois} ${annee}`
        
        if (!pubByMonth.has(monthKey)) {
          pubByMonth.set(monthKey, {
            vitrine: 0,
            boost: 0
          })
        }
        
        const monthStats = pubByMonth.get(monthKey)
        monthStats.boost += prix
        totalBoostDepense += prix
      })
    }

    // Chercher les achats
    const achatsMatch = extractAll(patterns.achats, inputText.value)
    if (achatsMatch) {
      achatsMatch.forEach(match => {
        const article = match[1]
        const prix = parseFloat(match[2].replace(',', '.'))
        const date = match[3]
        const [, mois, annee] = date.match(/(\w+) (\d{4})/)
        const monthKey = `${mois} ${annee}`
        
        // Ajouter à la liste des achats
        listeAchats.push({
          article,
          prix,
          date
        })

        if (!achatsParMois.has(monthKey)) {
          achatsParMois.set(monthKey, 0)
        }
        
        achatsParMois.set(monthKey, achatsParMois.get(monthKey) + prix)
        totalAchats += prix
      })
    }

    // Analyser les commentaires
    const comments = extractAll(patterns.comments, inputText.value);
    const salesByCountry = new Map<string, number>();
    const commentsList = [];

    comments.forEach(comment => {
      const commentText = comment[2]; // Le texte du commentaire
      const country = detectLanguage(commentText);
      if (country) {
        salesByCountry.set(country, (salesByCountry.get(country) || 0) + 1);
      }

      commentsList.push({
        auteur: comment[1],
        contenu: commentText,
        dateRelative: comment[3],
        langue: country
      });
    });

    const data = {
      boutique: extract(patterns.boutiqueName, inputText.value, 1),
      abonnes: extract(patterns.abonnes, inputText.value, 1),
      localisation: {
        ville: extract(patterns.localisation, inputText.value, 1)?.trim(),
        pays: extract(patterns.localisation, inputText.value, 2)?.trim()
      },
      statsVentes: {
        parMarque: Object.fromEntries(ventesByMarque),
        sansMarque: ventesNoMarque,
        parPays: Object.fromEntries(salesByCountry)
      },
      realSales: {
        totalVentes: totalRealSales,
        totalCA: totalCA,
        parMois: Object.fromEntries(salesByMonth)
      },
      pub: {
        totalVitrine: totalVitrineDepense,
        totalBoost: totalBoostDepense,
        parMois: Object.fromEntries(pubByMonth)
      },
      achats: {
        total: totalAchats,
        parMois: Object.fromEntries(achatsParMois),
        items: listeAchats
      },
      comments: commentsList
    }
    
    result.value = data
    console.log('Analyse terminée avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error)
  }
}

const toggleMonthDetails = (month) => {
  if (result.value?.realSales?.parMois[month]) {
    result.value.realSales.parMois[month].showDetails = !result.value.realSales.parMois[month].showDetails
  }
}

async function analyzeConcurrent() {
  logs.value = []
  concurrentResult.value = await concurrentAnalyzer.analyze(concurrentText.value)
}
</script>
