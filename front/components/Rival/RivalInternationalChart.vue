<template>
  <section class="rival-international-chart">
    <div class="header">
      <div class="icon-wrapper">
        <Icon name="globe"></Icon>
      </div>
      <h2 class="title">Ventes Internationales</h2>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <p class="label">Pays actifs</p>
        <p class="value">{{ activeCountries }} pays</p>
      </div>
      <div class="stat-card">
        <p class="label">Part internationale</p>
        <p class="value">{{ internationalShare }}%</p>
      </div>
    </div>

    <div class="chart-wrapper">
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
      <p v-if="topCountry" class="chart-description">
        Le pays le plus actif est
        <span class="highlight">{{ topCountry.country }}</span> avec
        <span class="highlight">{{ topCountry.sales }} ventes</span> ({{
          topCountry.percentage
        }}% du total)
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from "vue";
import { Chart } from "chart.js/auto";
import { useRivalStore } from "~/stores/rivalStore";

const rivalStore = useRivalStore();
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const hasData = computed(() => {
  return (
    rivalStore.analysis?.commentsData?.salesByCountry &&
    Object.keys(rivalStore.analysis.commentsData.salesByCountry).length > 0
  );
});

const activeCountries = computed(() => {
  if (!rivalStore.analysis?.commentsData?.salesByCountry) return 0;
  return Object.entries(rivalStore.analysis.commentsData.salesByCountry).filter(
    ([country, sales]) => country.toLowerCase() !== "france" && sales > 0
  ).length;
});

const internationalShare = computed(() => {
  if (!rivalStore.analysis?.commentsData?.salesByCountry) return 0;
  const salesByCountry = rivalStore.analysis.commentsData.salesByCountry;
  const totalSales = rivalStore.analysis.commentsData.totalSales || 0;
  const internationalSales = Object.entries(salesByCountry)
    .filter(([country]) => country.toLowerCase() !== "france")
    .reduce((acc, [, sales]) => acc + sales, 0);
  return totalSales === 0
    ? 0
    : ((internationalSales / totalSales) * 100).toFixed(1);
});

const topCountry = computed(() => {
  if (!rivalStore.analysis?.commentsData?.salesByCountry) return null;
  const salesByCountry = Object.entries(
    rivalStore.analysis.commentsData.salesByCountry
  )
    .filter(([country]) => country.toLowerCase() !== "france")
    .sort(([, a], [, b]) => b - a);
  if (!salesByCountry.length) return null;

  const [country, sales] = salesByCountry[0];
  const totalSales = salesByCountry.reduce((acc, [, sales]) => acc + sales, 0);
  return {
    country,
    sales,
    percentage: ((sales / totalSales) * 100).toFixed(1),
  };
});

function updateChart() {
  if (!chartCanvas.value || !hasData.value) return;

  if (chart) {
    chart.destroy();
  }

  const salesByCountry = Object.entries(
    rivalStore.analysis.commentsData.salesByCountry
  )
    .filter(([country]) => country.toLowerCase() !== "france")
    .sort(([, a], [, b]) => b - a);

  chart = new Chart(chartCanvas.value, {
    type: "doughnut",
    data: {
      labels: salesByCountry.map(([country]) => country),
      datasets: [
        {
          data: salesByCountry.map(([, sales]) => sales),
          backgroundColor: [
            "rgba(167, 139, 250, 0.85)",
            "rgba(129, 140, 248, 0.85)",
            "rgba(96, 165, 250, 0.85)",
            "rgba(56, 189, 248, 0.85)",
            "rgba(45, 212, 191, 0.85)",
          ],
          borderColor: "rgba(17, 24, 39, 0.8)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
            font: { size: 12 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} ventes (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

watch(
  () => rivalStore.analysis?.commentsData?.salesByCountry,
  () => {
    if (hasData.value) {
      nextTick(() => updateChart());
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
.rival-international-chart {
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
      height: 200px;
    }

    .chart-description {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      text-align: center;

      .highlight {
        color: var(--color-primary);
        font-weight: bold;
      }
    }
  }
}
</style>
