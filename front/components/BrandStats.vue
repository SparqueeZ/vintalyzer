<template>
  <div
    v-if="hasStats"
    class="w-[640px] min-w-[640px] max-w-[640px] bg-[#1a1b23] rounded-lg p-4 transform transition-all duration-300"
  >
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <svg
          class="w-5 h-5 text-violet-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h2 class="text-lg font-semibold text-white/90">Top Marques</h2>
      </div>
    </div>

    <!-- En-tête des colonnes -->
    <div class="flex items-center text-xs text-white/50 mb-2 px-1">
      <div class="flex-1">
        <span>Marque</span>
      </div>
      <div class="flex gap-8">
        <span class="w-20 text-right">Vues</span>
        <span class="w-20 text-right">CA</span>
        <span class="w-16 text-right">Conv.</span>
      </div>
    </div>

    <!-- Liste des marques -->
    <div class="space-y-2">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-for="brand in topBrands"
          :key="brand.name"
          class="px-2 py-2 rounded hover:bg-white/5 transition-colors duration-200"
        >
          <div class="flex items-center">
            <!-- Nom marque -->
            <div class="flex-1">
              <span class="text-sm text-white/90 font-medium">{{
                brand.name
              }}</span>
            </div>

            <!-- Stats -->
            <div class="flex gap-8 items-center text-sm">
              <!-- Vues -->
              <div class="w-20 text-right">
                <span class="text-violet-400 font-medium">
                  {{ formatNumber(brand.vues) }}
                </span>
              </div>

              <!-- CA -->
              <div class="w-20 text-right">
                <span class="text-violet-400 font-medium">
                  {{ formatPrice(brand.revenue) }}
                </span>
              </div>

              <!-- Conversion -->
              <div class="w-16 text-right">
                <span class="text-violet-400 font-medium">
                  {{ formatPercent(brand.conversionRate) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <hr
      class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDataStore } from "~/stores/dataStore";

const store = useDataStore();

// Vérifier si on a des données
const hasStats = computed(() => {
  return store.analyzedData?.ventes_stat?.length > 0;
});

// Calculer les stats par marque
const topBrands = computed(() => {
  if (!store.analyzedData?.ventes_stat) return [];

  const brandStats = new Map();

  store.analyzedData.ventes_stat.forEach((vente) => {
    if (!vente?.marque) return;

    const brandName = vente.marque.toLowerCase().trim();

    if (!brandStats.has(brandName)) {
      brandStats.set(brandName, {
        name: formatBrandName(vente.marque),
        sales: 0,
        revenue: 0,
        vues: 0,
        favoris: 0,
      });
    }

    const stats = brandStats.get(brandName);
    stats.sales += 1;
    stats.revenue += parseFloat(vente.prix) || 0;
    stats.vues += parseInt(vente.vues) || 0;
    stats.favoris += parseInt(vente.favoris) || 0;
  });

  return Array.from(brandStats.values())
    .map((brand) => ({
      ...brand,
      conversionRate: brand.vues ? (brand.sales / brand.vues) * 100 : 0,
    }))
    .sort((a, b) => b.vues - a.vues)
    .slice(0, 5);
});

// Fonctions de formatage
function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR");
}

function formatPrice(num: number): string {
  return num.toFixed(2) + "€";
}

function formatPercent(num: number): string {
  return num.toFixed(2) + "%";
}

function formatBrandName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
</script>
