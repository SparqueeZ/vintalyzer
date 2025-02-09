<template>
  <div v-if="hasData" 
       class="bg-[#1a1b23] rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:shadow-xl">
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Profil Boutique</h3>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1b23] to-[#1a1b23]/80 shadow-xl">
        <div class="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-violet-400/5"></div>
        <div class="relative p-4">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h2 class="text-2xl font-bold bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
                {{ boutique.nom }}
              </h2>
              <div class="text-sm text-white/50 flex items-center">
                <svg class="w-3.5 h-3.5 mr-1 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ location }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold text-amber-400 flex items-center justify-end">
                {{ formattedNote }} <span class="ml-2">{{ stars }}</span>
              </div>
              <div class="text-xs text-white/50">{{ boutique.evaluations }} évaluations</div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-[#1a1b23]/50 backdrop-blur rounded-lg p-3 flex items-center border border-violet-500/10">
              <div class="mr-3 text-violet-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <div class="text-lg font-bold text-white">{{ boutique.articles }}</div>
                <div class="text-xs text-white/50">Articles</div>
              </div>
            </div>
            <div class="bg-[#1a1b23]/50 backdrop-blur rounded-lg p-3 flex items-center border border-violet-500/10">
              <div class="mr-3 text-violet-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div class="text-lg font-bold text-white">{{ boutique.abonnes }}</div>
                <div class="text-xs text-white/50">Abonnés</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Boutique {
  nom: string
  localisation?: {
    ville?: string
    pays?: string
  }
  articles: number
  abonnes: number
  evaluations: number
  note: number
}

const props = defineProps<{
  boutique: Boutique
}>()

const hasData = computed(() => !!props.boutique)

const location = computed(() => {
  const { localisation } = props.boutique
  return localisation?.ville
    ? `${localisation.ville}, ${localisation.pays}`
    : `Inconnue, ${localisation?.pays || 'Non renseigné'}`
})

const formattedNote = computed(() => {
  return props.boutique.note.toFixed(1)
})

const stars = computed(() => {
  const note = props.boutique.note
  const fullStars = Math.floor(note)
  const hasHalfStar = note % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return `${'★'.repeat(fullStars)}${hasHalfStar ? '½' : ''}${'☆'.repeat(emptyStars)}`
})
</script>
