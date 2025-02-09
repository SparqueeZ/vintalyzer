<template>
  <div class="bg-[#1a1b23] rounded-lg shadow-lg p-4 h-full w-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white/90 flex items-center">
        <svg class="w-5 h-5 text-violet-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        Score Boutique
      </h2>
      <div :class="levelClass" class="text-sm font-medium px-3 py-1 rounded-full">
        {{ scoreResult?.level?.name }}
      </div>
    </div>

    <div v-if="isElite" class="mb-4 text-sm text-white/60 bg-[#1a1b23]/50 p-3 rounded-lg border-l-2" :style="{ borderColor: scoreResult?.level?.color }">
      <div class="space-y-2">
        <h4 class="text-sm font-bold text-white/90 mb-2">
          <span class="text-amber-400">✨ Boutique Elite</span>
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <p v-if="hasHighMonthlySales" class="text-sm">🌟 +30 ventes mensuelles</p>
            <p v-if="hasInternationalPresence" class="text-sm">🌍 Présence internationale établie dans 3+ pays</p>
          </div>
          <div class="space-y-2">
            <p v-if="hasLargeCommunity" class="text-sm">👥 Large communauté avec plus de 500 abonnés fidèles</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="relative h-64">
        <canvas ref="scoreChartRef"></canvas>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <span class="text-4xl font-bold text-white">{{ scoreResult?.scoreOn100 }}</span>
          <p class="text-sm text-white/50 mt-1">Score Global</p>
        </div>
      </div>

      <div class="h-64">
        <canvas ref="radarChartRef"></canvas>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-3">
      <!-- Engagement -->
      <div class="bg-[#1a1b23]/80 rounded-lg p-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium text-white/60">Engagement</h3>
          <div class="text-lg font-bold text-violet-400">
            {{ engagementTotal }}/25
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-white/50">Abonnés</span>
            <span class="text-sm font-medium text-white/80">
              {{ scoreResult?.details.engagement.subscribers }}/15 ({{ boutique?.abonnes || 0 }} abonnés)
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-white/50">Évaluation</span>
            <span class="text-sm font-medium text-white/80">
              {{ scoreResult?.details.engagement.rating }}/10 ({{ boutique?.note || 0 }}/5 - {{ boutique?.evaluations || 0 }} avis)
            </span>
          </div>
        </div>
      </div>

      <!-- Ventes -->
      <div class="bg-[#1a1b23]/80 rounded-lg p-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium text-white/60">Ventes</h3>
          <div class="text-lg font-bold text-pink-400">
            {{ salesTotal }}/30
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-white/50">Total</span>
            <span class="text-sm font-medium text-white/80">
              {{ scoreResult?.details.sales.totalSales }}/15 ({{ analyseVentes?.totalVentes || 0 }} ventes)
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-white/50">Mensuel</span>
            <span class="text-sm font-medium text-white/80">
              {{ scoreResult?.details.sales.monthlySales }}/15 ({{ monthlySales }} commandes/mois)
            </span>
          </div>
        </div>
      </div>

      <!-- Diversification -->
      <div class="bg-[#1a1b23]/80 rounded-lg p-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium text-white/60">Diversification</h3>
          <div class="text-lg font-bold text-blue-400">
            {{ diversificationTotal }}/20
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-white/50">International</span>
            <span class="text-sm font-medium text-white/80">
              {{ scoreResult?.details.diversification.international }}/20 ({{ internationalSales }} pays)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import Chart from 'chart.js/auto'
import { useConcurrentStore } from '~/stores/concurrentStore'
import { calculateScore, type ScoringResult } from '~/utils/competitorScoring'
import type { Chart as ChartType } from 'chart.js'

// Store
const concurrentStore = useConcurrentStore()
const { boutique, analyseVentes, scoringData } = storeToRefs(concurrentStore)

// Refs pour les charts
const scoreChartRef = ref<HTMLCanvasElement | null>(null)
const radarChartRef = ref<HTMLCanvasElement | null>(null)
const scoreChart = ref<ChartType | null>(null)
const radarChart = ref<ChartType | null>(null)

// État du score
const scoreResult = ref<ScoringResult | null>(null)

// Computed properties
const isElite = computed(() => scoreResult.value?.level?.name === 'Boutique Elite')
const hasHighMonthlySales = computed(() => (scoreResult.value?.details.sales.monthlySales || 0) >= 15)
const hasLargeCommunity = computed(() => (scoreResult.value?.details.engagement.subscribers || 0) >= 10)
const hasInternationalPresence = computed(() => (scoreResult.value?.details.diversification.international || 0) >= 15)

const engagementTotal = computed(() => {
  const details = scoreResult.value?.details.engagement
  return details ? details.subscribers + details.rating : 0
})

const salesTotal = computed(() => {
  const details = scoreResult.value?.details.sales
  return details ? details.totalSales + details.monthlySales : 0
})

const diversificationTotal = computed(() => {
  return scoreResult.value?.details.diversification.international || 0
})

const monthlySales = computed(() => analyseVentes.value?.ventesParMois || 0)
const internationalSales = computed(() => analyseVentes.value?.paysActifs?.length || 0)

const levelClass = computed(() => {
  if (!scoreResult.value?.level) return ''
  
  if (scoreResult.value.level.name === 'Boutique Elite') {
    return 'bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold'
  }
  
  return {
    backgroundColor: `${scoreResult.value.level.color}20`,
    color: scoreResult.value.level.color
  }
})

// Méthodes pour les charts
const updateScoreChart = () => {
  if (!scoreChartRef.value || !scoreResult.value) return

  const ctx = scoreChartRef.value.getContext('2d')
  if (!ctx) return

  const score = scoreResult.value.scoreOn100
  const gradient = ctx.createLinearGradient(0, 0, 0, 160)
  gradient.addColorStop(0, 'rgba(167, 139, 250, 0.8)')
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)')

  if (scoreChart.value) {
    scoreChart.value.destroy()
  }

  scoreChart.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [gradient, 'rgba(255, 255, 255, 0.05)'],
        borderWidth: 0,
        borderRadius: 5,
        spacing: 2,
        cutout: '85%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  })
}

const updateRadarChart = () => {
  if (!radarChartRef.value || !scoreResult.value) return

  const ctx = radarChartRef.value.getContext('2d')
  if (!ctx) return

  const details = scoreResult.value.details

  if (radarChart.value) {
    radarChart.value.destroy()
  }

  radarChart.value = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Abonnés', 'Évaluation', 'Ventes Totales', 'Ventes Mensuelles', 'International'],
      datasets: [{
        data: [
          (details.engagement.subscribers / 15) * 100,
          (details.engagement.rating / 10) * 100,
          (details.sales.totalSales / 15) * 100,
          (details.sales.monthlySales / 15) * 100,
          (details.diversification.international / 20) * 100
        ],
        backgroundColor: 'rgba(167, 139, 250, 0.2)',
        borderColor: 'rgba(167, 139, 250, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(167, 139, 250, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { display: false },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: { size: 12, weight: 'bold' }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => `Score: ${Math.round(context.raw)}%`
          }
        }
      }
    }
  })
}

// Watchers
watch([boutique, analyseVentes], () => {
  if (!boutique.value || !analyseVentes.value) return

  const scoringData = {
    subscribers: boutique.value.abonnes,
    rating: boutique.value.note,
    totalSales: analyseVentes.value.totalVentes,
    monthlySales: analyseVentes.value.ventesParMois,
    internationalSales: analyseVentes.value.paysActifs?.length || 0
  }

  scoreResult.value = calculateScore(scoringData)
  updateScoreChart()
  updateRadarChart()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (boutique.value && analyseVentes.value) {
    const scoringData = {
      subscribers: boutique.value.abonnes,
      rating: boutique.value.note,
      totalSales: analyseVentes.value.totalVentes,
      monthlySales: analyseVentes.value.ventesParMois,
      internationalSales: analyseVentes.value.paysActifs?.length || 0
    }

    scoreResult.value = calculateScore(scoringData)
    updateScoreChart()
    updateRadarChart()
  }
})
</script>
