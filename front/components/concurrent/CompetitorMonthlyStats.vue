<template>
  <div v-if="hasData" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Ventes Mensuelles</h3>
        </div>
      </div>

      <div class="text-xs text-white/50">
        Moyenne sur 30 jours
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-white/50">CA / mois</p>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold text-emerald-400">{{ formattedMonthlyRevenue }}</span>
            <span class="text-xs text-white/50">€</span>
          </div>
        </div>
        <div>
          <p class="text-xs text-white/50">Commandes / mois</p>
          <div class="flex items-baseline">
            <span class="text-2xl font-bold text-violet-400">{{ formattedMonthlyOrders }}</span>
          </div>
        </div>
      </div>

      <hr class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Chart, ChartConfiguration } from 'chart.js/auto'

interface StatsTemporelles {
  commandesParMois: number
  caParMois: number
}

interface Props {
  statsTemporelles?: StatsTemporelles
  analyseVentes?: {
    totalVentes: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  statsTemporelles: undefined,
  analyseVentes: undefined
})

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const hasData = computed(() => {
  return props.analyseVentes?.totalVentes && props.analyseVentes.totalVentes > 0
})

const formattedMonthlyRevenue = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(props.statsTemporelles?.caParMois || 0)
})

const formattedMonthlyOrders = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(props.statsTemporelles?.commandesParMois || 0)
})

function generateTrendData(currentValue: number) {
  const points = 12
  const data = []
  const variation = currentValue * 0.2
  
  for (let i = 0; i < points; i++) {
    const trend = currentValue * (1 + (i / points) * 0.1)
    const fluctuation = Math.sin(i * Math.PI / 6) * variation
    data.push(trend + fluctuation)
  }
  
  return data
}

function updateChart() {
  if (!chartRef.value || !props.statsTemporelles) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  if (chart) {
    chart.destroy()
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 60)
  gradient.addColorStop(0, 'rgba(124, 58, 237, 0.2)')
  gradient.addColorStop(1, 'rgba(124, 58, 237, 0)')

  const trendData = generateTrendData(props.statsTemporelles.caParMois)

  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels: Array(trendData.length).fill(''),
      datasets: [{
        data: trendData,
        borderColor: 'rgba(124, 58, 237, 0.8)',
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          display: false,
          beginAtZero: true
        }
      },
      elements: {
        point: {
          radius: 0,
          hitRadius: 0,
          hoverRadius: 0
        }
      },
      hover: {
        mode: null as any
      }
    }
  }

  chart = new Chart(ctx, config)
}

watch(() => props.statsTemporelles, () => {
  if (hasData.value) {
    updateChart()
  }
}, { deep: true })

onMounted(() => {
  if (hasData.value) {
    updateChart()
  }
})
</script>
