<template>
  <div class="min-h-screen bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white">Test Module Commandes</h1>
        <p class="mt-2 text-gray-400">Module de gestion des commandes Vinted</p>
      </div>

      <!-- Module Commandes -->
      <div class="bg-gray-800 rounded-xl shadow-xl">
        <VintedOrders />
      </div>
    </div>
  </div>
</template>

<script setup>
import VintedOrders from '~/components/commande/VintedOrders.vue'
</script>
