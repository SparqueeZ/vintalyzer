<template>
  <div
    v-if="hasVentes"
    class="bg-[#1a1b23] rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:shadow-xl"
    :style="{ width: 'calc(48rem + 2rem)' }"
  >
    <div class="flex flex-col h-96">
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
            ></path>
          </svg>
          <h3 class="text-lg font-semibold text-white/90">
            Analyse des Ventes
          </h3>
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <input
              v-model="startDate"
              type="date"
              class="bg-[#1a1b23] text-white/90 rounded px-2 py-1 text-sm border border-gray-700 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              style="color-scheme: dark"
              @change="updateStats"
            />
            <span class="text-white/50">à</span>
            <input
              v-model="endDate"
              type="date"
              class="bg-[#1a1b23] text-white/90 rounded px-2 py-1 text-sm border border-gray-700 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              style="color-scheme: dark"
              @change="updateStats"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-2">
        <div class="text-sm text-white/50">{{ periodDisplay }}</div>
        <div class="flex items-baseline space-x-2">
          <div class="text-lg font-bold text-white/90">{{ totalSales }}</div>
          <div class="text-sm text-white/50">ventes</div>
        </div>
      </div>

      <div class="flex items-baseline mb-3">
        <div class="text-3xl font-bold text-green-500">
          {{ formattedRevenue }}
        </div>
        <div class="text-sm text-white/50 ml-2">revenus sur la période</div>
      </div>

      <div class="relative flex-grow">
        <canvas ref="chart" class="absolute inset-0 w-full h-full"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useDataStore } from "~/stores/dataStore";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const store = useDataStore();
const chart = ref(null);
let chartInstance = null;

const startDate = ref("");
const endDate = ref("");

const hasVentes = computed(() => {
  return store.analyzedData?.ventes?.length > 0;
});

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const filteredVentes = computed(() => {
  if (!store.analyzedData?.ventes) return [];
  return store.analyzedData.ventes
    .filter((vente) => {
      const date = new Date(vente.date);
      return (
        (!startDate.value || date >= new Date(startDate.value)) &&
        (!endDate.value || date <= new Date(endDate.value))
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const filteredDepenses = computed(() => {
  if (!store.analyzedData?.depenses) return [];
  return store.analyzedData.depenses
    .filter((depense) => {
      const date = new Date(depense.date);
      return (
        (!startDate.value || date >= new Date(startDate.value)) &&
        (!endDate.value || date <= new Date(endDate.value))
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const totalSales = computed(() => filteredVentes.value.length);

const totalRevenue = computed(() => {
  return filteredVentes.value.reduce(
    (sum, vente) => sum + (vente.prix || 0),
    0
  );
});

const formattedRevenue = computed(() => formatMoney(totalRevenue.value));

const periodDisplay = computed(() => {
  if (filteredVentes.value.length === 0) return "Aucune vente sur la période";
  const first = new Date(filteredVentes.value[0].date);
  const last = new Date(
    filteredVentes.value[filteredVentes.value.length - 1].date
  );
  return `${formatDate(first)} - ${formatDate(last)}`;
});

function aggregateByDay(items: any[]) {
  const map = new Map();
  items.forEach((item) => {
    const date = new Date(item.date).toISOString().split("T")[0];
    map.set(date, (map.get(date) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([date, count]) => ({ date: new Date(date), count }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function updateChart() {
  if (!chart.value) return;

  const ventesParJour = aggregateByDay(filteredVentes.value);
  const depensesParJour = aggregateByDay(filteredDepenses.value);

  const allDates = [
    ...new Set([
      ...ventesParJour.map((v) => v.date.toISOString().split("T")[0]),
      ...depensesParJour.map((d) => d.date.toISOString().split("T")[0]),
    ]),
  ].sort();

  const datasets = [
    {
      data: ventesParJour.map((v) => v.count),
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    },
    {
      data: allDates.map((date) => {
        const depense = depensesParJour.find(
          (d) => d.date.toISOString().split("T")[0] === date
        );
        return depense ? depense.count : null;
      }),
      borderColor: "#f43f5e",
      backgroundColor: "#f43f5e",
      borderWidth: 0,
      pointRadius: 6,
      pointStyle: "rectRot",
      showLine: false,
    },
  ];

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chart.value.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: allDates.map((date) =>
        new Date(date).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        })
      ),
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.8,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.9)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#3b82f6",
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (tooltipItem) => {
              if (tooltipItem.datasetIndex === 0) {
                return `${tooltipItem.raw} vente${
                  tooltipItem.raw > 1 ? "s" : ""
                }`;
              } else {
                return `${tooltipItem.raw} dépense${
                  tooltipItem.raw > 1 ? "s" : ""
                }`;
              }
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: "rgba(75, 85, 99, 0.2)",
          },
          ticks: {
            color: "#9ca3af",
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            color: "rgba(75, 85, 99, 0.2)",
          },
          ticks: {
            color: "#9ca3af",
          },
        },
      },
      elements: {
        point: {
          radius: 3,
          hitRadius: 10,
          hoverRadius: 5,
          hoverBorderWidth: 2,
          backgroundColor: "#3b82f6",
          borderColor: "#1e293b",
          borderWidth: 2,
        },
      },
    },
  });
}

watch(
  [() => store.analyzedData, startDate, endDate],
  () => {
    if (hasVentes.value) {
      nextTick(updateChart);
    }
  },
  { deep: true }
);

onMounted(() => {
  if (store.analyzedData?.ventes?.length > 0) {
    // Initialiser avec le dernier mois
    const ventes = [...store.analyzedData.ventes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestDate = new Date(ventes[0].date);
    const oneMonthAgo = new Date(latestDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    startDate.value = oneMonthAgo.toISOString().split("T")[0];
    endDate.value = latestDate.toISOString().split("T")[0];
  }

  if (hasVentes.value) {
    nextTick(updateChart);
  }
});
</script>
