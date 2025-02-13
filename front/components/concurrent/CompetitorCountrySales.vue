<!-- components/concurrent/CompetitorCountrySales.vue -->
<template>
  <div v-if="hasData" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Distribution Internationale</h3>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-[#20212c] rounded-lg p-3 border border-violet-500/10">
          <div class="text-sm text-white/50 mb-1">Pays actifs</div>
          <div class="text-lg font-bold text-violet-400">{{ activeCountries }} pays</div>
        </div>
        <div class="bg-[#20212c] rounded-lg p-3 border border-violet-500/10">
          <div class="text-sm text-white/50 mb-1">Part internationale</div>
          <div class="text-lg font-bold text-emerald-400">{{ internationalShare }}%</div>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-[#20212c] rounded-lg p-4">
        <div class="relative h-[200px]">
          <canvas ref="chartCanvas"></canvas>
        </div>
        <div v-if="topCountry" class="mt-4 text-sm text-white/50 italic">
          Le pays le plus actif est <span class="text-violet-400 font-medium">{{ getCountryName(topCountry.country) }}</span>
          avec <span class="text-violet-400 font-medium">{{ topCountry.sales }} ventes</span>
          ({{ topCountry.percentage }}% du total)
        </div>
      </div>

      <hr class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Chart } from 'chart.js/auto'
import { useConcurrentStore } from '~/stores/concurrentStore'

const store = useConcurrentStore()

interface Props {
  analyseVentes?: {
    ventesParPays: Record<string, number>
    totalVentes: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  analyseVentes: undefined
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const hasData = computed(() => {
  return store.analyseVentes?.ventesParPays && Object.keys(store.analyseVentes.ventesParPays).length > 0
})

const activeCountries = computed(() => {
  if (!store.analyseVentes?.ventesParPays) return 0
  // Compter les pays actifs (hors France)
  return Object.entries(store.analyseVentes.ventesParPays)
    .filter(([pays, ventes]) => pays.toLowerCase() !== 'france' && ventes > 0)
    .length
})

const salesByCountry = computed(() => {
  if (!store.analyseVentes?.ventesParPays) return {}
  
  // Ne prendre que les ventes internationales
  return Object.fromEntries(
    Object.entries(store.analyseVentes.ventesParPays)
      .filter(([pays, ventes]) => pays.toLowerCase() !== 'france' && ventes > 0)
      .sort((a, b) => b[1] - a[1])
  )
})

const internationalShare = computed(() => {
  if (!store.analyseVentes?.ventesParPays) return 0
  
  const ventesParPays = store.analyseVentes.ventesParPays
  const ventesInternationales = Object.entries(ventesParPays)
    .filter(([pays]) => pays.toLowerCase() !== 'france')
    .reduce((acc, [_, count]) => acc + count, 0)
  
  const totalVentes = Object.values(ventesParPays).reduce((acc, count) => acc + count, 0)
  
  return totalVentes === 0 ? 0 : ((ventesInternationales / totalVentes) * 100).toFixed(1)
})

const topCountry = computed(() => {
  const entries = Object.entries(salesByCountry.value)
  if (!entries.length) return null
  
  const [country, sales] = entries[0]
  const totalVentesInternationales = Object.values(salesByCountry.value).reduce((acc, count) => acc + count, 0)
  
  return {
    country,
    sales,
    percentage: ((sales / totalVentesInternationales) * 100).toFixed(1)
  }
})

const countryNames: Record<string, string> = {
  italie: 'Italie',
  espagne: 'Espagne',
  allemagne: 'Allemagne',
  republiqueTcheque: 'Rép. Tchèque',
  lituanie: 'Lituanie',
  paysBas: 'Pays-Bas',
  royaumeUni: 'Royaume-Uni',
  belgique: 'Belgique',
  suisse: 'Suisse',
  portugal: 'Portugal'
}

function getCountryName(country: string): string {
  return countryNames[country] || country
}

function updateChart() {
  if (!chartCanvas.value || !hasData.value) return
  
  if (chart) {
    chart.destroy()
  }

  const sortedSales = Object.entries(salesByCountry.value)
    .sort((a, b) => b[1] - a[1])

  const colors = [
    'rgba(167, 139, 250, 0.85)', // Violet
    'rgba(129, 140, 248, 0.85)', // Indigo
    'rgba(96, 165, 250, 0.85)',  // Bleu
    'rgba(56, 189, 248, 0.85)',  // Bleu clair
    'rgba(45, 212, 191, 0.85)',  // Turquoise
  ]

  chart = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: sortedSales.map(([country]) => getCountryName(country)),
      datasets: [{
        data: sortedSales.map(([_, value]) => value),
        backgroundColor: colors,
        borderColor: 'rgba(17, 24, 39, 0.8)',
        borderWidth: 2,
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 5,
          bottom: 5
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: 'rgb(156, 163, 175)',
            font: {
              size: 11,
              weight: '500'
            },
            padding: 10,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 6
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.raw as number || 0
              const total = (context.dataset.data as number[]).reduce((acc, val) => acc + val, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return ` ${label}: ${value} ventes (${percentage}%)`
            }
          },
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: 'rgb(209, 213, 219)',
          bodyColor: 'rgb(209, 213, 219)',
          padding: 10,
          cornerRadius: 6,
          displayColors: false
        }
      }
    }
  })
}

watch(() => store.analyseVentes, () => {
  if (hasData.value) {
    nextTick(() => {
      updateChart()
    })
  }
}, { deep: true })

onMounted(() => {
  if (hasData.value) {
    updateChart()
  }
})
</script>
