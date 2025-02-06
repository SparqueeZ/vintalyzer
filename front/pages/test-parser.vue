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
      <h2 class="text-xl mb-2">Résultats de l'analyse :</h2>
      <div class="mb-4">
        <div class="flex gap-4">
          <SalesStats />
          <TotalStats />
          <ExpenseStats />
          <CountrySales />
          <EngagementStats />
        </div>
      </div>
      <div class="mb-4">
        <BrandStats />
      </div>
      <div class="mb-4">
        <SalesChart />
      </div>
      <div class="bg-gray-100 p-4 rounded overflow-auto">
        <div class="mb-4">
          <h3 class="font-bold">🏪 Informations Boutique</h3>
          <pre>{{ formatSection(result.boutique) }}</pre>
        </div>

        <div class="mb-4">
          <h3 class="font-bold">💰 Ventes</h3>
          <p>Nombre total de ventes : {{ result.ventes?.length || 0 }}</p>
          <p>Dernières ventes :</p>
          <pre>{{ formatSection(result.ventes?.slice(-3)) }}</pre>
        </div>

        <div class="mb-4">
          <h3 class="font-bold">📢 Marketing</h3>
          <p>Nombre de boosts : {{ result.marketing?.boosts?.length || 0 }}</p>
          <p>Nombre de vitrines : {{ result.marketing?.dressingVitrine?.length || 0 }}</p>
          <pre>{{ formatSection(result.marketing) }}</pre>
        </div>

        <div class="mb-4">
          <h3 class="font-bold">💶 Finances</h3>
          <p>Nombre de transferts : {{ result.finances?.transferts?.length || 0 }}</p>
          <p>Solde actuel : {{ result.finances?.soldeActuel?.toFixed(2) || 0 }} €</p>
          <pre>{{ formatSection(result.finances) }}</pre>
        </div>

        <div class="mb-4">
          <h3 class="font-bold">💸 Dépenses</h3>
          <p>Nombre total de dépenses : {{ result.depenses?.length || 0 }}</p>
          <pre>{{ formatSection(result.depenses) }}</pre>
        </div>
      </div>
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
                <p class="font-semibold">Ventes totales</p>
                <p>{{ concurrentResult.analyseVentes.totalVentes }} ventes</p>
              </div>
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
                  ({{ concurrentResult.analyseVentes.pourcentagesParPays[pays].toFixed(1) }}%)
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
import { VintedAnalyzer } from '~/utils/vintedAnalyzer'
import { concurrentAnalyzer } from '~/utils/concurrentAnalyzer'
import { useDataStore } from '~/stores/dataStore'
import SalesStats from '~/components/SalesStats.vue'
import TotalStats from '~/components/TotalStats.vue'
import ExpenseStats from '~/components/ExpenseStats.vue'
import EngagementStats from '~/components/EngagementStats.vue'
import CountrySales from '~/components/CountrySales.vue'
import BrandStats from '~/components/BrandStats.vue'
import SalesChart from '~/components/SalesChart.vue'

const inputText = ref('')
const concurrentText = ref('')
const result = ref<any>(null)
const concurrentResult = ref<any>(null)
const logs = ref<string[]>([])

const store = useDataStore()

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

function formatSection(data: any) {
  return JSON.stringify(data, null, 2)
}

async function analyzeText() {
  logs.value = []
  const analyzer = new VintedAnalyzer(inputText.value)
  result.value = analyzer.analyze()
  store.setAnalyzedData(result.value)
}

async function analyzeConcurrent() {
  logs.value = []
  concurrentResult.value = await concurrentAnalyzer.analyze(concurrentText.value)
}
</script>
