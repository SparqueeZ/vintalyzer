<template>
  <div v-if="hasVentesStat" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg w-72 transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Engagement</h3>
        </div>
      </div>

      <div class="flex justify-between text-sm">
        <div class="text-center">
          <span class="text-white/50">Vues</span>
          <div class="text-violet-400 font-bold text-lg">{{ totalViews }}</div>
        </div>
        <div class="text-center">
          <span class="text-white/50">Ventes</span>
          <div class="text-violet-400 font-bold text-lg">{{ totalSales }}</div>
        </div>
      </div>

      <div class="relative h-40">
        <canvas ref="chart"></canvas>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <span class="text-2xl font-bold text-white/90">{{ conversionRate }}%</span>
          <p class="text-xs text-white/50">Taux de conversion</p>
        </div>
      </div>

      <div class="text-sm text-center" v-html="performanceMessage"></div>

      <hr class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-4" />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDataStore } from '~/stores/dataStore'
import Chart from 'chart.js/auto'

const store = useDataStore()
const chart = ref(null)
let chartInstance = null

const hasVentesStat = computed(() => {
  return store.analyzedData?.ventes_stat?.length > 0
})

const totalViews = computed(() => {
  return store.getTotalViews
})

const totalSales = computed(() => {
  return store.getTotalSales
})

const conversionRate = computed(() => {
  return store.getConversionRate.toFixed(2)
})

const performanceMessage = computed(() => {
  const rate = parseFloat(conversionRate.value)
  if (rate >= 3) {
    return '<span class="text-green-400">🌟 Excellent taux de conversion !</span>'
  } else if (rate >= 2) {
    return '<span class="text-blue-400">✨ Très bon taux de conversion !</span>'
  } else if (rate >= 1) {
    return '<span class="text-yellow-400">👍 Bon taux de conversion</span>'
  } else {
    return '<span class="text-white/50">💡 Optimisez vos descriptions</span>'
  }
})

const updateChart = () => {
  if (!chart.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chart.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Vues', 'Ventes'],
      datasets: [{
        data: [totalViews.value - totalSales.value, totalSales.value],
        backgroundColor: [
          'rgba(167, 139, 250, 0.2)',
          'rgba(167, 139, 250, 0.6)'
        ],
        borderColor: [
          'rgba(167, 139, 250, 0.5)',
          'rgba(167, 139, 250, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '85%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.raw || 0
              const percentage = ((value / totalViews.value) * 100).toFixed(1)
              return `${label}: ${value.toLocaleString()} (${percentage}%)`
            }
          },
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: 'rgb(209, 213, 219)',
          bodyColor: 'rgb(209, 213, 219)',
          padding: 12,
          cornerRadius: 8
        }
      }
    }
  })
}

watch(() => store.analyzedData, () => {
  if (hasVentesStat.value) {
    nextTick(updateChart)
  }
}, { deep: true })

onMounted(() => {
  if (hasVentesStat.value) {
    updateChart()
  }
})
</script>

<style scoped>
.electric-flow {
  animation: flowRight 2s linear infinite;
}

@keyframes flowRight {
  from {
    left: -50%;
  }
  to {
    left: 100%;
  }
}
</style>
