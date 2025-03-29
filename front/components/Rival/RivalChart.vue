<template>
  <div class="rival-chart-wrapper">
    <div class="title-wrapper">
      <div class="icon-wrapper">
        <Icon name="chartUp"></Icon>
      </div>
      <h2 class="title">Activité des Commentaires</h2>
    </div>

    <!-- Sélecteur de mois -->
    <div class="month-selector">
      <button
        @click="selectedMonth = null"
        class="month-button"
        :class="{ active: !selectedMonth }"
      >
        Tous
      </button>
      <button
        v-for="mois in moisDisponibles"
        :key="mois.key"
        @click="selectedMonth = mois.key"
        class="month-button"
        :class="{ active: selectedMonth === mois.key }"
      >
        {{ formatMonthYear(mois.date) }}
      </button>
    </div>

    <!-- Statistiques de la période -->
    <div class="stats-wrapper">
      <div class="stat">
        <p class="label">Ventes sur la période</p>
        <p class="value">{{ totalVentes }}</p>
      </div>
      <div class="stat">
        <p class="label">CA sur la période</p>
        <p class="value">{{ formatPrice(chiffreAffaires) }}</p>
      </div>
    </div>

    <!-- Graphique -->
    <div class="chart-container">
      <canvas ref="commentsChart"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRivalStore } from "@/stores/rivalStore";
import Chart from "chart.js/auto";

const rivalStore = useRivalStore();
const commentsChart = ref<HTMLCanvasElement | null>(null);
const chart = ref<Chart | null>(null);
const selectedMonth = ref<string | null>(null);

// Calcul des données des commentaires
const commentsData = computed(() => {
  console.log("ANALYSIS", rivalStore.analysis);
  const comments = rivalStore.analysis.commentsData.commentList || [];
  const dates = comments
    .map((comment) => new Date(comment.date))
    .filter((date) => !isNaN(date.getTime()));

  const dateDebut = new Date(Math.min(...dates));
  const dateFin = new Date(Math.max(...dates));

  const mois = [];
  const currentDate = new Date(dateDebut);

  while (currentDate <= dateFin) {
    const key = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    mois.push({
      key,
      date: new Date(currentDate),
      count: 0,
      ventesParJour: {},
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  comments.forEach((comment) => {
    const date = new Date(comment.date);
    if (!isNaN(date.getTime())) {
      const key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const moisTrouve = mois.find((m) => m.key === key);
      if (moisTrouve) {
        moisTrouve.count++;
        const jourKey = date.getDate().toString();
        moisTrouve.ventesParJour[jourKey] =
          (moisTrouve.ventesParJour[jourKey] || 0) + 1;
      }
    }
  });

  return {
    mois,
    totalComments: comments.length,
  };
});

// Liste des mois disponibles
const moisDisponibles = computed(() => commentsData.value.mois);

// Calcul des statistiques pour la période sélectionnée
const totalVentes = computed(() => {
  if (!selectedMonth.value) return commentsData.value.totalComments;

  const moisSelectionne = commentsData.value.mois.find(
    (m) => m.key === selectedMonth.value
  );
  return moisSelectionne ? moisSelectionne.count : 0;
});

const chiffreAffaires = computed(() => {
  return totalVentes.value * rivalStore.analysis.averagePrice;
});

// Mise à jour du graphique
const updateChart = () => {
  if (!commentsChart.value || !commentsData.value.mois.length) return;

  const labels = [];
  const values = [];

  if (selectedMonth.value) {
    const moisSelectionne = commentsData.value.mois.find(
      (m) => m.key === selectedMonth.value
    );
    if (moisSelectionne) {
      const jours = Object.keys(moisSelectionne.ventesParJour).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );
      labels.push(...jours.map((jour) => `Jour ${jour}`));
      values.push(...jours.map((jour) => moisSelectionne.ventesParJour[jour]));
    }
  } else {
    labels.push(...commentsData.value.mois.map((m) => formatMonthYear(m.date)));
    values.push(...commentsData.value.mois.map((m) => m.count));
  }

  // Destroy the existing chart instance if it exists
  if (chart.value) {
    try {
      chart.value.destroy();
    } catch (error) {
      console.error("Error destroying chart:", error);
    }
    chart.value = null;
  }

  const ctx = commentsChart.value?.getContext("2d");
  if (!ctx) {
    console.error("Canvas context is null or undefined.");
    return;
  }

  // Create a new chart instance
  try {
    chart.value = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Commentaires",
            data: values,
            borderColor: "rgba(167, 139, 250, 0.8)",
            backgroundColor: "rgba(167, 139, 250, 0.2)",
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
            backgroundColor: "rgba(26, 27, 35, 0.95)",
            titleColor: "#fff",
            bodyColor: "#fff",
            displayColors: false,
          },
        },
        scales: {
          x: {
            ticks: { color: "rgba(255, 255, 255, 0.7)" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "rgba(255, 255, 255, 0.7)" },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating chart:", error);
  }
};

// Mettre à jour le graphique lorsque les données changent
watch(
  [commentsData, selectedMonth],
  () => {
    nextTick(() => {
      updateChart();
    });
  },
  { deep: true }
);

// Initialisation du graphique
onMounted(() => {
  nextTick(() => {
    updateChart();
  });
});

// Formatage des dates
const formatMonthYear = (date: Date) => {
  const mois = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ][date.getMonth()];
  return `${mois} ${date.getFullYear()}`;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
</script>

<style scoped lang="scss">
.rival-chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background-color: var(--color-bg-secondary);

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
      border: 1px solid var(--color-border);
    }

    .title {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--color-text);
    }
  }

  .month-selector {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .month-button {
      padding: 8px 12px;
      border-radius: 5px;
      background-color: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: background-color 0.2s;

      &.active {
        background-color: var(--color-primary);
        color: #fff;
      }

      &:hover {
        background-color: var(--color-primary-hover);
      }
    }
  }

  .stats-wrapper {
    display: flex;
    gap: 16px;

    .stat {
      flex: 1;
      background-color: var(--color-bg-tertiary);
      padding: 12px;
      border-radius: 5px;
      text-align: center;

      .label {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }

      .value {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-text);
      }
    }
  }

  .chart-container {
    position: relative;
    height: 300px;
  }
}
</style>
