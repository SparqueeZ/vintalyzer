<template>
  <transition name="load" mode="out-in">
    <article class="engagement-module-wrapper">
      <div class="title-wrapper">
        <div class="icon-wrapper">
          <Icon name="heart"></Icon>
        </div>
        <p class="title">Engagement</p>
      </div>
      <div class="stats-wrapper">
        <div class="stat">
          <p class="stat-title">vues</p>
          <p class="stat-amount">{{ saleStore.statistics.totalViews }}</p>
        </div>
        <div class="stat">
          <p class="stat-title">ventes</p>
          <p class="stat-amount">{{ saleStore.statistics.totalSales }}</p>
        </div>
      </div>
      <div class="chart-wrapper">
        <div class="chart-container">
          <canvas ref="chart" id="engagementChart"></canvas>
          <div class="conversion-overlay">
            <span class="conversion-value"
              >{{ saleStore.statistics.conversionRate.toFixed(2) }}%</span
            >
            <p class="conversion-label">Taux de conversion</p>
          </div>
        </div>
      </div>
      <div class="recommandations-wrapper">
        <p class="recommandation">{{ performanceMessage }}</p>
      </div>
    </article>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useDataStore } from "~/stores/dataStore";
import Chart from "chart.js/auto";
const store = useDataStore();
const chart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const saleStore = useSaleStore();

// const totalViews = ref(3348);

// const totalSales = ref(18);

// const conversionRate = computed(() => {
//   if (totalViews.value === 0) return 0;
//   return ((totalSales.value / totalViews.value) * 100).toFixed(2);
// });

const totalViews = ref(saleStore.statistics.totalViews);

const totalSales = ref(saleStore.statistics.totalSales);

const conversionRate = ref(saleStore.statistics.conversionRate);

const performanceMessage = computed(() => {
  const rate = saleStore.statistics.conversionRate;
  if (rate >= 3) {
    return "🌟 Excellent taux de conversion !";
  } else if (rate >= 2) {
    return "✨ Très bon taux de conversion !";
  } else if (rate >= 1) {
    return "👍 Bon taux de conversion";
  } else {
    return "💡 Optimisez vos descriptions";
  }
});

const updateChart = () => {
  const canvas = chart.value;
  if (!canvas) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Vues", "Ventes"],
      datasets: [
        {
          data: [
            saleStore.statistics.totalViews - saleStore.statistics.totalSales,
            saleStore.statistics.totalSales,
          ],
          backgroundColor: [
            "rgba(167, 139, 250, 0.2)",
            "rgba(167, 139, 250, 0.6)",
          ],
          borderColor: ["rgba(167, 139, 250, 0.5)", "rgba(167, 139, 250, 1)"],
          borderWidth: 1,
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "85%",
      layout: {
        padding: 10,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
};

watch(
  () => saleStore.statistics,
  () => {
    nextTick(() => updateChart());
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  updateChart();
});
</script>

<style scoped lang="scss">
.load-enter-active,
.load-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.load-enter-from,
.load-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes loading {
  to {
    background-position: left;
  }
}

.loading-text {
  width: 100%;
  height: 100%;
  min-height: 20px;
  border-radius: 0.5rem;
  background: linear-gradient(
      90deg,
      var(--color-bg-tertiary) 40%,
      #525877,
      var(--color-bg-tertiary) 70%
    )
    right / 300% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

.engagement-module-wrapper {
  padding: 16px;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;
  width: fit-content;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .title-wrapper {
    display: flex;
    gap: 16px;
    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-bg-tertiary);
      height: 35px;
      width: 35px;
      border-radius: 5px;
      border: var(--color-border) solid 1px;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 25px;
        stroke: var(--color-primary);
        fill: none;
      }
    }
    .title {
      font-size: 1.3rem;
      font-weight: bold;
      color: var(--color-text);
    }
  }
}

.stats-wrapper {
  display: flex;
  gap: 1rem;
  justify-content: space-between;

  .stat {
    border-radius: 0.5rem;

    .stat-title {
      font-size: 0.875rem;
      color: var(--color-text-subtitle);
    }

    .stat-amount {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--color-text);
    }
    &:nth-child(2) {
      .stat-amount {
        text-align: right;
      }
    }
  }
}

.chart-wrapper {
  width: 100%;

  .chart-container {
    position: relative;
    width: 100%;
    height: 200px;
  }

  .conversion-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 1;

    .conversion-value {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--color-text);
    }

    .conversion-label {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
  }
}

#engagementChart {
  width: 100% !important;
  height: 100% !important;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
