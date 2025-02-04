<template>
  <div v-if="store.hasVentes" 
       class="bg-white rounded-lg p-4 shadow-lg w-72 transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <h3 class="text-lg font-semibold text-gray-800">Ventes</h3>
        </div>
      </div>
      
      <div class="text-xs text-gray-600">
        {{ dateRange }}
      </div>
      
      <div class="flex items-baseline">
        <div class="text-3xl font-bold text-blue-600">
          {{ store.getVentes.length }}
        </div>
        <div class="text-xs text-gray-600 ml-2">ventes</div>
      </div>
      
      <div class="h-32 w-full">
        <canvas ref="chartRef" class="w-full h-full"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useDataStore } from '~/stores/dataStore'
import { Chart } from 'chart.js/auto'

const store = useDataStore()
const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const dateRange = computed(() => {
  const ventes = store.getVentes
  if (!ventes.length) return ''
  
  const firstDate = new Date(ventes[0].date)
  const lastDate = new Date(ventes[ventes.length - 1].date)
  
  return `${formatDate(firstDate)} - ${formatDate(lastDate)}`
})

function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short'
  })
}

function updateChart() {
  if (!chartRef.value) return
  
  const ventesParJour = store.getVentesParJour
  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ventesParJour.map(v => formatDate(v.date)),
      datasets: [{
        data: ventesParJour.map(v => v.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#3b82f6',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (tooltipItem: any) => {
              return `${tooltipItem.raw} vente${tooltipItem.raw > 1 ? 's' : ''}`
            }
          }
        }
      },
      scales: {
        x: { display: false },
        y: { 
          display: false,
          beginAtZero: true
        }
      },
      elements: {
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 2,
          backgroundColor: '#3b82f6'
        }
      }
    }
  })
}

watch(() => store.getVentesParJour, updateChart, { deep: true })

onMounted(() => {
  if (store.hasVentes) {
    updateChart()
  }
})
</script>
