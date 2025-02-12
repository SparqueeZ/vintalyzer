<template>
  <div v-if="hasStats" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg w-56 min-w-[14rem] max-w-[14rem] transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 class="text-lg font-semibold text-white/90">Distribution Géographique</h2>
        </div>
      </div>

      <div class="relative h-40 mb-2">
        <canvas ref="chart"></canvas>
      </div>

      <div class="flex items-center justify-center text-xs text-white/50 mt-2">
        <span class="inline-flex items-center px-2 py-1 bg-violet-500/20 text-violet-400 rounded-full">
          {{ internationalPercentage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useDataStore } from '~/stores/dataStore'
import Chart from 'chart.js/auto'

const store = useDataStore()
const chart = ref(null)
let chartInstance = null

const hasStats = computed(() => {
  console.log('Store data:', store.analyzedData);
  console.log('VentesParPays:', store.analyzedData?.boutique?.stats?.ventesParPays);
  return store.analyzedData?.boutique?.stats?.ventesParPays !== undefined
})

const countryNames = {
  italie: 'Italie',
  espagne: 'Espagne',
  allemagne: 'Allemagne',
  republiqueTcheque: 'Rép. Tchèque',
  lituanie: 'Lituanie',
  paysBas: 'Pays-Bas',
  royaumeUni: 'Royaume-Uni'
}

function getCountryName(country: string) {
  return countryNames[country] || country
}

const salesData = computed(() => {
  if (!store.analyzedData?.boutique?.stats?.ventesParPays) return {}
  
  const ventesParPays = store.analyzedData.boutique.stats.ventesParPays;
  console.log('Données des ventes par pays:', ventesParPays);
  return Object.entries(ventesParPays)
    .filter(([_, value]) => value > 0)
    .reduce((acc, [country, value]) => {
      acc[getCountryName(country)] = value
      return acc
    }, {})
})

const internationalPercentage = computed(() => {
  if (!store.analyzedData?.boutique?.stats?.ventesParPays) return 'Pas de ventes'
  
  const ventesParPays = store.analyzedData.boutique.stats.ventesParPays
  const totalVentes = Object.values(ventesParPays).reduce((acc, count) => acc + count, 0)
  
  if (totalVentes === 0) return 'Pas de ventes'
  
  const ventesInternationales = Object.entries(ventesParPays)
    .filter(([country, _]) => country !== 'france')
    .reduce((acc, [_, count]) => acc + count, 0)
  
  const pourcentage = (ventesInternationales / totalVentes * 100).toFixed(0)
  return `${pourcentage}% à l'international`
})

function updateChart() {
  if (!chart.value) return

  const ctx = chart.value.getContext('2d')
  
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Préparer les données pour le graphique
  const salesByCountry = salesData.value
  const labels = []
  const data = []

  // Créer un dégradé de bleu-vert plus doux
  const colors = [
    'rgba(45, 212, 191, 0.85)',   // Turquoise principal
    'rgba(34, 211, 238, 0.85)',   // Cyan
    'rgba(56, 189, 248, 0.85)',   // Bleu clair
  ]

  // Filtrer et trier les pays par nombre de ventes
  Object.entries(salesByCountry)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([country, value]) => {
      labels.push(country)
      data.push(value)
    })

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
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
              const value = context.raw || 0
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0)
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

watch(() => store.analyzedData, () => {
  if (hasStats.value) {
    nextTick(updateChart)
  }
}, { deep: true })

onMounted(() => {
  if (hasStats.value) {
    nextTick(updateChart)
  }
})
</script>
