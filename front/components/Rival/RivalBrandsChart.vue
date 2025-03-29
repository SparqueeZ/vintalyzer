<template>
  <section class="rival-brands-chart">
    <div class="header">
      <div class="icon-wrapper">
        <Icon name="chartBar"></Icon>
      </div>
      <h2 class="title">Statistiques des Marques</h2>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <p class="label">Marques différentes</p>
        <p class="value">{{ uniqueBrandsCount }}</p>
      </div>
      <div class="stat-card">
        <p class="label">Marque principale</p>
        <p class="value">{{ mainBrand }}</p>
      </div>
    </div>

    <div class="chart-wrapper">
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
      <p v-if="mainBrandStats" class="chart-description">
        {{ mainBrandStats.brand }} représente {{ mainBrandStats.percentage }}%
        des ventes
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from "vue";
import { Chart } from "chart.js/auto";
import { useRivalStore } from "~/stores/rivalStore";

const store = useRivalStore();
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const hasData = computed(() => {
  return store.analysis?.brandsStats?.brandCount?.length > 0;
});

const uniqueBrandsCount = computed(() => {
  return store.analysis?.brandsStats?.brandCount?.length || 0;
});

const mainBrand = computed(() => {
  return store.analysis?.brandsStats?.mostRepresentedBrand?.name || "-";
});

const mainBrandStats = computed(() => {
  const brand = store.analysis?.brandsStats?.mostRepresentedBrand;
  if (!brand) return null;

  const chartData = sortedBrands.value.find((b) => b.name === brand.name);
  const percentage = chartData?.percentage?.toFixed(1) || "0"; // Use percentage from chart data
  return { brand: brand.name, percentage };
});

const sortedBrands = computed(() => {
  return store.analysis?.brandsStats?.top5 || [];
});

function updateChart() {
  if (!chartCanvas.value) return;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(chartCanvas.value, {
    type: "bar",
    data: {
      labels: sortedBrands.value.map((brand) => brand.name),
      datasets: [
        {
          label: "Pourcentage",
          data: sortedBrands.value.map((brand) => brand.percentage || 0),
          backgroundColor: [
            "rgba(167, 139, 250, 0.5)", // violet-400
            "rgba(192, 132, 252, 0.5)", // violet-300
            "rgba(216, 180, 254, 0.5)", // violet-200
            "rgba(233, 213, 255, 0.5)", // violet-100
            "rgba(245, 243, 255, 0.5)", // violet-50
          ],
          borderColor: [
            "rgb(167, 139, 250)", // violet-400
            "rgb(192, 132, 252)", // violet-300
            "rgb(216, 180, 254)", // violet-200
            "rgb(233, 213, 255)", // violet-100
            "rgb(245, 243, 255)", // violet-50
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true, // Ensure the chart respects its container's aspect ratio
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return `${context.parsed.y}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
  });
}

watch(
  () => store.analysis?.brandsStats,
  () => {
    if (hasData.value) {
      nextTick(() => {
        updateChart();
      });
    }
  },
  { deep: true }
);

onMounted(() => {
  if (hasData.value) {
    updateChart();
  }
});
</script>

<style scoped lang="scss">
.rival-brands-chart {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background-color: var(--color-bg-secondary);

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-bg-tertiary);
      height: 40px;
      width: 40px;
      border-radius: 0.5rem;
      border: 1px solid var(--color-border);

      .icon {
        width: 24px;
        height: 24px;
        stroke: var(--color-primary);
      }
    }

    .title {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--color-text);
    }
  }

  .stats-grid {
    display: flex;
    gap: 1rem;

    .stat-card {
      flex: 1;
      padding: 1rem;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      background-color: var(--color-bg-tertiary);

      .label {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.5rem;
      }

      .value {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-text);
      }
    }
  }

  .chart-wrapper {
    position: relative;

    .chart-container {
      width: 100%;
      height: 200px; /* Fix the height to prevent infinite growth */
      position: relative;
    }

    canvas {
      width: 100% !important; /* Ensure the canvas respects the container's width */
      height: 100% !important; /* Ensure the canvas respects the container's height */
    }

    .chart-description {
      margin-top: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-subtitle);
      text-align: center;
    }
  }
}
</style>
