<template>
  <section class="rival-score-wrapper">
    <div class="title-wrapper">
      <div class="icon-wrapper">
        <Icon name="chartUp"></Icon>
      </div>
      <h2 class="title">Score de la boutique</h2>
    </div>

    <div class="charts-wrapper">
      <div class="score-donut-wrapper">
        <div class="chart relative">
          <canvas ref="scoreChartRef"></canvas>
          <div class="score-overlay">
            <span class="score">{{
              rivalStore.analysis.score.scoreOn100
            }}</span>
            <p class="label">Score Global</p>
          </div>
        </div>
      </div>

      <div class="score-kiviat-wrapper">
        <div class="chart">
          <canvas ref="radarChartRef"></canvas>
        </div>
      </div>
    </div>

    <div class="scores-wrapper">
      <div class="score-category engagement-wrapper">
        <div class="score engagement">
          <p class="title">Engagement</p>
          <p class="value">
            {{
              rivalStore.analysis.score.details.engagement.rating +
              rivalStore.analysis.score.details.engagement.subscribers
            }}/25
          </p>
        </div>
        <div class="score followers">
          <p class="title">Abonnés</p>
          <p class="value">
            {{ rivalStore.analysis.score.details.engagement.subscribers }}/15
          </p>
        </div>
        <div class="score evaluations">
          <p class="title">Evaluation</p>
          <p class="value">
            {{ rivalStore.analysis.score.details.engagement.rating }}/15
          </p>
        </div>
      </div>
      <div class="score-category sales-wrapper">
        <div class="score sales">
          <p class="title">Ventes</p>
          <p class="value">
            {{
              rivalStore.analysis.score.details.sales.totalSales +
              rivalStore.analysis.score.details.sales.monthlySales
            }}/30
          </p>
        </div>
        <div class="score sales-count">
          <p class="title">Total</p>
          <p class="value">
            {{ rivalStore.analysis.score.details.sales.totalSales }}/15
          </p>
        </div>
        <div class="score monthly-sales">
          <p class="title">Mensuel</p>
          <p class="value">
            {{ rivalStore.analysis.score.details.sales.monthlySales }}/15
          </p>
        </div>
      </div>

      <div class="score-category diversitfication-wrapper">
        <div class="score diversification">
          <p class="title">Diversification</p>
          <p class="value">
            {{
              rivalStore.analysis.score.details.diversification.international
            }}/20
          </p>
        </div>
        <div class="score international">
          <p class="title">International</p>
          <p class="value">
            {{
              rivalStore.analysis.score.details.diversification.international
            }}/20 ({{
              rivalStore.analysis.score.details.diversification.brands
            }}
            pays)
          </p>
        </div>
      </div>
    </div>

    <div class="resume-wrapper">
      <div class="resume-title-wrapper">
        <p class="title">
          {{ rivalStore.analysis.score.level.name }}
        </p>
        <p class="description">
          {{ rivalStore.analysis.score.level.description }}
        </p>
      </div>

      <div class="resume-niche-analysis-wrapper">
        <p class="title">Analyse de niche</p>
        <p class="description">
          {{ rivalStore.analysis.score.level.nicheAnalysis }}
        </p>
      </div>

      <div class="resume-keypoints-wrapper">
        <p class="title">Points clés</p>
        <ul class="keypoints">
          <li v-for="keypoint in rivalStore.analysis.score.level.tips">
            {{ keypoint }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Chart, type ChartType } from "chart.js/auto";

const rivalStore = useRivalStore();

const scoreChartRef = ref<HTMLCanvasElement | null>(null);
const radarChartRef = ref<HTMLCanvasElement | null>(null);
const scoreChart = ref<ChartType | null>(null);
const radarChart = ref<ChartType | null>(null);

const updateScoreChart = () => {
  if (!scoreChartRef.value || !rivalStore.analysis.score) return;

  const ctx = scoreChartRef.value.getContext("2d");
  if (!ctx) return;

  const score = rivalStore.analysis.score.scoreOn100;
  const gradient = ctx.createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, "rgba(167, 139, 250, 0.8)");
  gradient.addColorStop(1, "rgba(139, 92, 246, 0.8)");

  if (scoreChart.value) {
    scoreChart.value.destroy();
  }

  scoreChart.value = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [score, 100 - score],
          backgroundColor: [gradient, "rgba(255, 255, 255, 0.05)"],
          borderWidth: 0,
          borderRadius: 5,
          spacing: 2,
          cutout: "85%",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  });
};

const updateRadarChart = () => {
  if (!radarChartRef.value || !rivalStore.analysis.score) return;

  const ctx = radarChartRef.value.getContext("2d");
  if (!ctx) return;

  const details = rivalStore.analysis.score.details;

  if (radarChart.value) {
    radarChart.value.destroy();
  }

  radarChart.value = new Chart(ctx, {
    type: "radar",
    data: {
      labels: [
        "Abonnés",
        "Évaluation",
        "Ventes Totales",
        "Ventes Mensuelles",
        "International",
      ],
      datasets: [
        {
          data: [
            (details.engagement.subscribers / 15) * 100,
            (details.engagement.rating / 10) * 100,
            (details.sales.totalSales / 15) * 100,
            (details.sales.monthlySales / 15) * 100,
            (details.diversification.international / 20) * 100,
          ],
          backgroundColor: "rgba(167, 139, 250, 0.2)",
          borderColor: "rgba(167, 139, 250, 0.8)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(167, 139, 250, 1)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { display: false },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          angleLines: { color: "rgba(255, 255, 255, 0.1)" },
          pointLabels: {
            color: "rgba(255, 255, 255, 0.7)",
            font: { size: 12, weight: "bold" },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 12 },
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => `Score: ${Math.round(context.raw as number)}%`,
          },
        },
      },
    },
  });
};

// Initialize charts when component is mounted
onMounted(() => {
  updateScoreChart();
  updateRadarChart();
});

// Update charts when analysis data changes
watch(
  () => rivalStore.analysis,
  () => {
    updateScoreChart();
    updateRadarChart();
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.rival-score-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid var(--color-border);
  padding: 16px 16px 12px 16px;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;

  .title-wrapper {
    display: flex;
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
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text);
    }
  }
}

.charts-wrapper {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
  height: 300px;

  .score-donut-wrapper,
  .score-kiviat-wrapper {
    flex: 1;
    position: relative;

    .chart {
      height: 100%;
      width: 100%;
    }
  }

  .score-donut-wrapper {
    .score-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      .score {
        font-size: 2rem;
        font-weight: bold;
        color: var(--color-text);
      }

      .label {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }
    }
  }
}
</style>
