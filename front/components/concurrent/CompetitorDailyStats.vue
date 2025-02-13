<!-- components/concurrent/CompetitorDailyStats.vue -->
<template>
  <div v-if="hasData" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Ventes Journalières</h3>
        </div>
      </div>

      <div class="text-xs text-white/50">
        {{ periodText }}
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-white/50">CA / jour</p>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold text-emerald-400">{{ formattedDailyRevenue }}</span>
            <span class="text-xs text-white/50">€</span>
          </div>
        </div>
        <div>
          <p class="text-xs text-white/50">Ventes / jour</p>
          <div class="flex items-baseline">
            <span class="text-2xl font-bold text-violet-400">{{ formattedDailyOrders }}</span>
          </div>
        </div>
      </div>

      <hr class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StatsTemporelles {
  commandesParJour: number
  caParJour: number
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

const hasData = computed(() => {
  return props.analyseVentes?.totalVentes && props.analyseVentes.totalVentes > 0
})

const formattedDailyRevenue = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(props.statsTemporelles?.caParJour || 0)
})

const formattedDailyOrders = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(props.statsTemporelles?.commandesParJour || 0)
})

const periodText = computed(() => {
  return 'Moyenne sur 30 jours'
})
</script>
