<template>
  <div class="bg-[#1a1b23] rounded-lg p-4 shadow-lg w-56 min-w-[14rem] max-w-[14rem] transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Boutique</h3>
        </div>
      </div>
      
      <div class="text-xs text-white/50">
        {{ store.analyzedData?.nom || 'Non renseigné' }}
      </div>
      
      <div class="flex flex-col space-y-2">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span class="text-violet-400">{{ store.analyzedData?.abonnes || 0 }} abonnés</span>
        </div>
        <div v-if="store.analyzedData?.localisation" class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-emerald-400">{{ store.analyzedData?.localisation?.ville }}, {{ store.analyzedData?.localisation?.pays }}</span>
        </div>
      </div>

      <hr class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataStore } from '~/stores/dataStore'

const store = useDataStore()
</script>
