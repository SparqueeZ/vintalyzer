<!-- components/concurrent/CompetitorBrands.vue -->
<template>
  <div v-if="hasData" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Distribution des Marques</h3>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-[#20212c] rounded-lg p-3 border border-violet-500/10">
          <div class="text-sm text-white/50 mb-1">Marques différentes</div>
          <div class="text-lg font-bold text-violet-400">{{ uniqueBrandsCount }}</div>
        </div>
        <div class="bg-[#20212c] rounded-lg p-3 border border-violet-500/10">
          <div class="text-sm text-white/50 mb-1">Marque principale</div>
          <div class="text-lg font-bold text-emerald-400">{{ mainBrand }}</div>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-[#20212c] rounded-lg p-4">
        <div class="relative h-[200px]">
          <canvas ref="chartCanvas"></canvas>
        </div>
        <div v-if="mainBrandStats" class="mt-4 text-sm text-white/50 italic">
          {{ mainBrandStats.brand }} représente {{ mainBrandStats.percentage }}% du dressing
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Chart } from 'chart.js/auto'
import { useConcurrentStore } from '~/stores/concurrentStore'

const store = useConcurrentStore()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const hasData = computed(() => {
  return store.articles && store.articles.length > 0
})

const brandCounts = computed(() => {
  if (!store.articles) return {}
  
  return store.articles.reduce((acc: Record<string, number>, article: any) => {
    const brand = article.marque || 'Non spécifié'
    acc[brand] = (acc[brand] || 0) + 1
    return acc
  }, {})
})

const sortedBrands = computed(() => {
  return Object.entries(brandCounts.value)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
})

const uniqueBrandsCount = computed(() => {
  return Object.keys(brandCounts.value).length
})

const mainBrand = computed(() => {
  return sortedBrands.value[0]?.[0] || '-'
})

const mainBrandStats = computed(() => {
  if (!store.articles?.length || !sortedBrands.value.length) return null
  
  const [brand, count] = sortedBrands.value[0]
  const percentage = ((count / store.articles.length) * 100).toFixed(1)
  
  return { brand, percentage }
})

function updateChart() {
  if (!chartCanvas.value) return
  
  if (chart) {
    chart.destroy()
  }

  chart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: sortedBrands.value.map(([brand]) => brand),
      datasets: [{
        label: 'Articles',
        data: sortedBrands.value.map(([,count]) => count),
        backgroundColor: [
          'rgba(167, 139, 250, 0.5)', // violet-400
          'rgba(192, 132, 252, 0.5)', // violet-300
          'rgba(216, 180, 254, 0.5)', // violet-200
          'rgba(233, 213, 255, 0.5)', // violet-100
          'rgba(245, 243, 255, 0.5)', // violet-50
        ],
        borderColor: [
          'rgb(167, 139, 250)', // violet-400
          'rgb(192, 132, 252)', // violet-300
          'rgb(216, 180, 254)', // violet-200
          'rgb(233, 213, 255)', // violet-100
          'rgb(245, 243, 255)', // violet-50
        ],
        borderWidth: 1
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
          callbacks: {
            label: function(context: any) {
              return `${context.parsed.y} articles`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      }
    }
  })
}

watch(() => store.articles, () => {
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
