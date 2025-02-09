<template>
  <div v-if="hasDepenses" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg w-56 min-w-[14rem] max-w-[14rem] transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Dépenses</h3>
        </div>
        <div class="flex flex-col items-end space-y-1">
          <div class="flex items-baseline space-x-2">
            <div class="text-sm font-bold text-white/90">{{ boostCount }}</div>
            <div class="text-xs text-white/50">boosts</div>
          </div>
          <div class="flex items-baseline space-x-2">
            <div class="text-sm font-bold text-white/90">{{ vitrineCount }}</div>
            <div class="text-xs text-white/50">vitrines</div>
          </div>
        </div>
      </div>
      
      <div class="text-xs text-white/50">
        {{ dateRange }}
      </div>
      
      <div class="flex items-baseline">
        <div class="text-3xl font-bold text-rose-500">
          {{ totalExpenses }}
        </div>
        <div class="text-xs text-white/50 ml-2">dépensés</div>
      </div>

      <hr class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useDataStore } from '~/stores/dataStore'

const store = useDataStore()

// Debug
watch(() => store.analyzedData, (newData) => {
  console.log('ExpenseStats - analyzedData:', newData)
  if (newData?.expenses) {
    console.log('Dépenses totales:', newData.expenses)
  }
}, { immediate: true })

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

const hasDepenses = computed(() => {
  return store.analyzedData?.pub && (
    store.analyzedData.pub.totalVitrine > 0 ||
    store.analyzedData.pub.totalBoost > 0
  )
})

const dateRange = computed(() => {
  const ventes = store.getVentes
  if (!ventes.length) return ''
  
  const firstDate = new Date(ventes[0].date)
  const lastDate = new Date(ventes[ventes.length - 1].date)
  
  return `${formatDate(firstDate)} - ${formatDate(lastDate)}`
})

const totalExpenses = computed(() => {
  const pub = store.analyzedData?.pub
  if (!pub) return formatMoney(0)
  
  return formatMoney(pub.total)
})

const boostCount = computed(() => {
  const depenses = store.analyzedData?.depenses || []
  return depenses.filter(d => d.type === 'boost').length || '-'
})

const vitrineCount = computed(() => {
  const depenses = store.analyzedData?.depenses || []
  return depenses.filter(d => d.type === 'vitrine').length || '-'
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
