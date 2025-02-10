<template>
  <div
    v-if="store.hasVentes"
    class="bg-[#1a1b23] rounded-lg p-4 shadow-lg w-56 min-w-[14rem] max-w-[14rem] transform transition-all duration-300 hover:shadow-xl"
  >
    <div class="flex flex-col h-full space-y-3">
      <div class="flex items-center justify-between">
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            ></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">Ventes</h3>
        </div>
      </div>

      <div class="text-xs text-white/50">
        {{ dateRange }}
      </div>

      <div class="flex items-baseline">
        <div class="text-3xl font-bold text-violet-400">
          {{ store.getVentes.length }}
        </div>
        <div class="text-xs text-white/50 ml-2">ventes</div>
      </div>
      <hr
        class="w-full border-none h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-4"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDataStore } from "~/stores/dataStore";

const store = useDataStore();

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

const dateRange = computed(() => {
  const ventes = store.getVentes;
  if (!ventes.length) return "";

  const firstDate = new Date(ventes[0].date);
  const lastDate = new Date(ventes[ventes.length - 1].date);

  return `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
});
</script>
