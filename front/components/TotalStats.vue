<template>
  <div v-if="store.hasVentes" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg w-56 min-w-[14rem] max-w-[14rem] transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Chiffre d'affaires</h3>
        </div>
      </div>
      
      <div class="text-xs text-white/50">
        {{ dateRange }}
      </div>
      
      <div class="flex items-baseline">
        <div class="text-3xl font-bold text-green-500">
          {{ totalRevenue }}
        </div>
        <div class="text-xs text-white/50 ml-2">revenus</div>
      </div>

      <hr class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-4" />

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '~/stores/dataStore'

const store = useDataStore()

function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short'
  })
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const dateRange = computed(() => {
  const ventes = store.getVentes
  if (!ventes.length) return ''
  
  const firstDate = new Date(ventes[0].date)
  const lastDate = new Date(ventes[ventes.length - 1].date)
  
  return `${formatDate(firstDate)} - ${formatDate(lastDate)}`
})

const totalRevenue = computed(() => {
  const ventes = store.getVentes
  const total = ventes.reduce((sum, vente) => sum + (parseFloat(vente.prix) || 0), 0)
  return formatMoney(total)
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