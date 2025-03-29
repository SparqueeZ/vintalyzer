<template>
  <article class="statistics-wrapper">
    <div class="head-wrapper">
      <div class="title-wrapper">
        <div class="icon-wrapper">
          <Icon name="chartUp" />
        </div>
        <p class="title">Statistiques</p>
      </div>
      <div class="button-wrapper"></div>
    </div>
    <div class="data-wrapper">
      <div class="income">
        <p>
          <span class="amount">{{ calculateTotalSales() }}€</span>
          de revenus
        </p>
      </div>
      <div class="sales">
        <span class="amount">{{ salesAmount }}</span>
        ventes
      </div>
    </div>
    <div class="chart-wrapper">
      <canvas id="statisticSalesChart" width="1048" height="300"></canvas>
    </div>
  </article>
</template>

<script setup>
import Chart from "chart.js/auto";
import { onBeforeUnmount } from "vue";
const saleStore = useSaleStore();
const props = defineProps({
  selectedRange: Object,
});

const salesAmount = ref(0);
const salesTotal = ref(0);

const startPeriod = ref(
  props.selectedRange.start
    ? props.selectedRange.start.toISOString()
    : "2025-01-01T00:00:00"
);
const endPeriod = ref(
  props.selectedRange.end
    ? props.selectedRange.end.toISOString()
    : new Date().toISOString()
);

// Mettre à jour les périodes quand les props changent
watch(
  () => props.selectedRange,
  (newRange) => {
    if (newRange.start) {
      startPeriod.value = newRange.start.toISOString();
    }
    if (newRange.end) {
      endPeriod.value = newRange.end.toISOString();
    }
    createChart();
  },
  { deep: true }
);

console.log(props.selectedRange);
let salesChart = null;

// Fonction pour formater les données de ventes
const formatSalesData = () => {
  const sales = saleStore.sales;
  const dailySales = {};

  sales.forEach((sale) => {
    const saleDate = sale.date.split("T")[0];
    const startDate = startPeriod.value.split("T")[0];
    const endDate = endPeriod.value.split("T")[0];

    if (saleDate >= startDate && saleDate <= endDate) {
      dailySales[saleDate] = (dailySales[saleDate] || 0) + 1;
    }
  });

  salesAmount.value = Object.values(dailySales).reduce(
    (acc, count) => acc + count,
    0
  );

  // Filtrer pour ne garder que les jours avec des ventes
  const filteredDates = Object.entries(dailySales)
    .filter(([_, count]) => count > 0)
    .reduce((acc, [date, count]) => {
      acc[date] = count;
      return acc;
    }, {});

  return {
    labels: Object.keys(filteredDates),
    data: Object.values(filteredDates),
  };
};

// Fonction pour calculer le total des ventes
const calculateTotalSales = () => {
  const sales = saleStore.sales;
  return sales
    .filter((sale) => {
      const saleDate = sale.date.split("T")[0];
      const startDate = startPeriod.value.split("T")[0];
      const endDate = endPeriod.value.split("T")[0];
      return saleDate >= startDate && saleDate <= endDate;
    })
    .reduce((total, sale) => total + sale.price, 0)
    .toFixed(2);
};

// Fonction pour formater les dates au format français
const formatDateFr = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("fr-FR", { month: "short" });
  return `${day} ${month.toLowerCase()}`;
};

// Création du graphique
const createChart = () => {
  const ctx = document.getElementById("statisticSalesChart");
  if (!ctx) return;

  if (salesChart) {
    salesChart.destroy();
  }

  const { labels, data } = formatSalesData();
  const formattedLabels = labels.map((date) => formatDateFr(date));

  salesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: formattedLabels.reverse(),
      datasets: [
        {
          label: "Nombre de ventes",
          data: data.reverse(),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.9)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#8b5cf6",
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
            stepSize: 1,
          },
        },
      },
    },
  });
};

// Clean up chart when component is destroyed
onBeforeUnmount(() => {
  if (salesChart) {
    salesChart.destroy();
    salesChart = null;
  }
});

// Mettre à jour le graphique quand les ventes changent
watch(
  () => saleStore.sales,
  () => {
    createChart();
  },
  { deep: true }
);

// Créer le graphique au montage du composant
onMounted(() => {
  createChart();
});
</script>

<style scoped lang="scss">
.statistics-wrapper {
  width: fit-content;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  padding: 16px 16px 12px 16px;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;
  min-width: 100%;

  .head-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
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
    .button-wrapper {
      display: flex;
      gap: 8px;
    }
  }

  .data-wrapper {
    display: flex;
    gap: 2rem;
  }

  .chart-wrapper {
    display: flex;
    gap: 2rem;
    height: 300px;
    width: 100%;
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  }
}
</style>
