<template>
  <div v-if="showChart" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Activité des Ventes</h3>
        </div>
      </div>

      <!-- Sélecteur de mois -->
      <div class="flex flex-wrap gap-2">
        <button 
          @click="selectedMonth = null"
          class="px-3 py-1 text-sm rounded-full transition-all duration-200"
          :class="!selectedMonth ? 'bg-violet-500 text-white' : 'bg-[#1e1f27] text-white/50 hover:text-white/90'"
        >
          Tous
        </button>
        <button 
          v-for="mois in moisDisponibles" 
          :key="mois.key"
          @click="selectedMonth = mois.key"
          class="px-3 py-1 text-sm rounded-full transition-all duration-200"
          :class="selectedMonth === mois.key ? 'bg-violet-500 text-white' : 'bg-[#1e1f27] text-white/50 hover:text-white/90'"
        >
          {{ formatMonthYear(mois.date) }}
        </button>
      </div>

      <!-- Statistiques de la période -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-[#1e1f27] rounded-lg p-4">
          <div class="text-xs text-white/50 mb-1">Ventes sur la période</div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold text-violet-400">{{ formatNumber(totalVentes) }}</span>
          </div>
        </div>
        <div class="bg-[#1e1f27] rounded-lg p-4">
          <div class="text-xs text-white/50 mb-1">CA sur la période</div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold text-emerald-400">{{ formatPrice(chiffreAffaires) }}</span>
          </div>
        </div>
      </div>

      <!-- Graphique des ventes -->
      <div class="relative w-full" style="height: 300px;">
        <canvas ref="salesChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'

interface Props {
  analyseVentes?: {
    totalVentes: number
    ventesParMois: number
    prixMoyen: number
  }
  commentaires?: Array<{
    date: string
    contenu: string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  analyseVentes: undefined,
  commentaires: undefined
})

const salesChart = ref(null)
const chart = ref(null)
const showChart = ref(false)
const selectedMonth = ref<string | null>(null)

// Computed properties pour les données de vente
const salesData = computed(() => {
  if (!props.analyseVentes?.totalVentes || !props.commentaires?.length) {
    return null
  }

  showChart.value = true

  // Trouver la période complète
  const dates = props.commentaires
    .map(comment => new Date(comment.date))
    .filter(date => !isNaN(date.getTime()))

  const dateDebut = new Date(Math.min(...dates))
  const dateFin = new Date(Math.max(...dates))

  // Créer un tableau de tous les mois entre dateDebut et dateFin
  const mois = []
  const currentDate = new Date(dateDebut)

  while (currentDate <= dateFin) {
    const key = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`
    mois.push({
      key: key,
      date: new Date(currentDate),
      nombre: 0,
      ventesParJour: {}
    })
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  // Compter les ventes pour chaque mois et jour
  props.commentaires.forEach(comment => {
    const date = new Date(comment.date)
    if (!isNaN(date.getTime())) {
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      const moisTrouve = mois.find(m => m.key === key)
      if (moisTrouve) {
        moisTrouve.nombre++
        const jourKey = date.getDate().toString()
        moisTrouve.ventesParJour[jourKey] = (moisTrouve.ventesParJour[jourKey] || 0) + 1
      }
    }
  })

  // Calculer les statistiques pour le mois sélectionné
  let totalVentesFiltered = props.analyseVentes.totalVentes
  
  if (selectedMonth.value) {
    const moisSelectionne = mois.find(m => m.key === selectedMonth.value)
    if (moisSelectionne) {
      totalVentesFiltered = moisSelectionne.nombre
    }
  }

  return {
    ventes: mois,
    totalVentes: totalVentesFiltered,
    chiffreAffaires: totalVentesFiltered * props.analyseVentes.prixMoyen,
    periode: {
      debut: dateDebut,
      fin: dateFin
    }
  }
})

// Liste des mois disponibles pour le sélecteur
const moisDisponibles = computed(() => {
  if (!salesData.value) return []
  const mois = salesData.value.ventes.map(v => ({
    key: `${v.date.getFullYear()}-${(v.date.getMonth() + 1).toString().padStart(2, '0')}`,
    date: v.date,
    nombre: v.nombre
  }))
  return [...mois].sort((a, b) => b.date - a.date)
})

// Computed properties pour les statistiques
const totalVentes = computed(() => salesData.value?.totalVentes || 0)
const chiffreAffaires = computed(() => salesData.value?.chiffreAffaires || 0)

// Formatage des nombres et dates
const formatNumber = (value) => new Intl.NumberFormat('fr-FR').format(value)
const formatPrice = (value) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' €'
const formatMonthYear = (date: Date) => {
  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
               'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][date.getMonth()]
  return `${mois} ${date.getFullYear()}`
}

// Mise à jour du graphique
const updateChart = () => {
  if (!salesChart.value || !salesData.value?.ventes.length) return

  const ventesTriees = [...salesData.value.ventes].sort((a, b) => a.date - b.date)
  const labels = ventesTriees.map(v => {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][v.date.getMonth()]
    return `${mois} ${v.date.getFullYear()}`
  })
  const values = ventesTriees.map(v => v.nombre)
  const borderColors = ventesTriees.map(v => 
    selectedMonth.value === v.key 
      ? 'rgb(167, 139, 250)' 
      : 'rgba(167, 139, 250, 0.5)'
  )
  const backgroundColors = ventesTriees.map(v => 
    selectedMonth.value === v.key 
      ? 'rgba(167, 139, 250, 0.3)' 
      : 'rgba(167, 139, 250, 0.1)'
  )
  const pointRadiuses = ventesTriees.map(v => 
    selectedMonth.value === v.key ? 6 : 4
  )

  if (!chart.value) {
    // Création initiale du graphique
    const ctx = salesChart.value.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, 'rgba(167, 139, 250, 0.2)')
    gradient.addColorStop(1, 'rgba(167, 139, 250, 0)')

    chart.value = new Chart(salesChart.value, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventes',
          data: values,
          borderColor: borderColors,
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: borderColors,
          pointBorderColor: '#1a1b23',
          pointBorderWidth: 2,
          pointRadius: pointRadiuses,
          pointHoverRadius: 8,
          cubicInterpolationMode: 'monotone'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(26, 27, 35, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(167, 139, 250, 0.2)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => {
                const d = ventesTriees[tooltipItems[0].dataIndex].date
                const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][d.getMonth()]
                return `${mois} ${d.getFullYear()}`
              },
              label: (context) => {
                const value = context.raw
                return `${value} vente${value > 1 ? 's' : ''}`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              stepSize: 1
            }
          }
        }
      }
    })
  } else {
    // Mise à jour des données existantes
    chart.value.data.labels = labels
    chart.value.data.datasets[0].data = values
    chart.value.data.datasets[0].borderColor = borderColors
    chart.value.data.datasets[0].pointBackgroundColor = borderColors
    chart.value.data.datasets[0].pointRadius = pointRadiuses
    chart.value.update('none') // Mode 'none' pour une transition plus fluide
  }
}

// Mise à jour du graphique quand les données changent
watch([salesData, selectedMonth], () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// Initialisation du graphique au montage
onMounted(() => {
  nextTick(() => {
    updateChart()
  })
})
</script>
