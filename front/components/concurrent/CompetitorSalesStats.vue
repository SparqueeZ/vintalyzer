<template>
  <div v-if="hasData" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Chiffre d'affaires</h3>
        </div>
      </div>

      <div class="text-xs text-white/50">
        {{ periodText }}
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="flex items-center justify-between">
            <p class="text-xs text-white/50 flex items-center">
              CA total
              <span class="relative ml-1">
                <span class="cursor-help text-gray-500 hover:text-purple-400" @mouseenter="showCATooltip = true" @mouseleave="showCATooltip = false">
                  <span class="w-4 h-4 inline-flex items-center justify-center rounded-full border border-current">
                    i
                  </span>
                </span>
                <div v-show="showCATooltip" class="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs text-gray-300 bg-gray-900 rounded shadow-lg border border-gray-700">
                  <p class="mb-1">Le chiffre d'affaires est calculé comme suit :</p>
                  <ul class="space-y-1 text-gray-400">
                    <li>• Nombre total de ventes × Prix moyen</li>
                  </ul>
                </div>
              </span>
            </p>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold text-emerald-400">{{ formattedCA }}</span>
            <span class="text-xs text-white/50">€</span>
          </div>
        </div>
        <div>
          <p class="text-xs text-white/50">Total commandes</p>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold text-violet-400">{{ formattedOrders }}</span>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between">
            <p class="text-xs text-white/50 flex items-center">
              Prix moyen 
              <span class="relative ml-1">
                <span class="cursor-help text-gray-500 hover:text-purple-400" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
                  <span class="w-4 h-4 inline-flex items-center justify-center rounded-full border border-current">
                    i
                  </span>
                </span>
                <div v-show="showTooltip" class="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs text-gray-300 bg-gray-900 rounded shadow-lg border border-gray-700">
                  <p class="mb-1">Le prix moyen est calculé avec plusieurs ajustements :</p>
                  <ul class="space-y-1 text-gray-400">
                    <li>• Exclusion des prix anormalement bas ou élevés</li>
                    <li>• Combinaison médiane (60%) et moyenne (40%)</li>
                    <li>• Réduction progressive :</li>
                    <li class="ml-2">-5% si +50 articles</li>
                    <li class="ml-2">-7% si +100 articles</li>
                    <li class="ml-2">-10% si +200 articles</li>
                  </ul>
                </div>
              </span>
            </p>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold text-violet-400">{{ formattedAvgPrice }}</span>
            <span class="text-xs text-white/50">€</span>
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

interface Comment {
  date: string
  contenu: string
}

interface Props {
  analyseVentes?: {
    totalVentes: number
    ventesParPays: Record<string, number>
    totalCommandes?: number
  }
  prixMoyen?: number
  commentaires?: Comment[]
}

const props = withDefaults(defineProps<Props>(), {
  analyseVentes: undefined,
  prixMoyen: 0,
  commentaires: () => []
})

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const showTooltip = ref(false)
const showCATooltip = ref(false)

const hasData = computed(() => {
  return props.analyseVentes?.totalVentes && props.analyseVentes.totalVentes > 0
})

const caTotal = computed(() => {
  return (props.analyseVentes?.totalVentes || 0) * props.prixMoyen
})

const formattedCA = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(caTotal.value)
})

const formattedAvgPrice = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(props.prixMoyen)
})

const formattedOrders = computed(() => {
  const orders = props.analyseVentes?.totalCommandes || props.analyseVentes?.totalVentes || 0
  return new Intl.NumberFormat('fr-FR').format(orders)
})

const periodText = computed(() => {
  if (!props.commentaires?.length) return '30 derniers jours'

  const dates = props.commentaires
    .map(comment => new Date(comment.date))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())

  if (dates.length < 2) return '30 derniers jours'

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  return `${formatDate(dates[dates.length - 1])} - ${formatDate(dates[0])}`
})

function generateTrendData(currentValue: number) {
  const points = 12
  const data = []
  
  for (let i = 0; i < points; i++) {
    const base = currentValue * (0.7 + (i / points) * 0.6)
    const variation = Math.sin(i * Math.PI / 3) * (currentValue * 0.15)
    data.push(base + variation)
  }
  
  return data
}

function updateChart() {
  if (!chartRef.value || !hasData.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  if (chart) {
    chart.destroy()
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 60)
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')

  const ventesParMois: Record<string, { date: Date; nombre: number }> = {}
  
  props.commentaires?.forEach(comment => {
    const date = new Date(comment.date)
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    
    if (!ventesParMois[key]) {
      ventesParMois[key] = {
        date: date,
        nombre: 0
      }
    }
    ventesParMois[key].nombre++
  })

  const ventesTriees = Object.values(ventesParMois)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const trendData = generateTrendData(ventesTriees[0]?.nombre || 10000)

  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels: Array(trendData.length).fill(''),
      datasets: [{
        data: trendData,
        borderColor: 'rgba(16, 185, 129, 0.8)',
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

watch(() => [props.analyseVentes, props.commentaires], () => {
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
