<template>
  <section class="rival-score-wrapper">
    <div class="title-wrapper">
      <div class="left-section">
        <div class="icon-wrapper">
          <Icon name="chartUp"></Icon>
        </div>
        <h2 class="title">Score de la boutique</h2>
      </div>
      <div class="level-badge" :class="levelClass">
        <span class="medal">{{ levelBadge }}</span>
        {{ rivalStore.analysis.score.level.name }}
      </div>
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
      <div class="score-card">
        <div class="total-card">
          <h3 class="card-title">Engagement</h3>
          <p class="highlighted-total gradient-text">
            {{
              rivalStore.analysis.score.details.engagement.rating +
              rivalStore.analysis.score.details.engagement.subscribers
            }}/25
          </p>
        </div>
        <div class="card-details">
          <p>
            <span class="detail-title">Abonnés</span>
            <span class="detail-value"
              >{{
                rivalStore.analysis.score.details.engagement.subscribers
              }}/15</span
            >
          </p>
          <p>
            <span class="detail-title">Évaluation</span>
            <span class="detail-value"
              >{{
                rivalStore.analysis.score.details.engagement.rating
              }}/10</span
            >
          </p>
        </div>
      </div>

      <div class="score-card">
        <div class="total-card">
          <h3 class="card-title">Ventes</h3>
          <p class="highlighted-total gradient-text">
            {{
              rivalStore.analysis.score.details.sales.totalSales +
              rivalStore.analysis.score.details.sales.monthlySales
            }}/30
          </p>
        </div>
        <div class="card-details">
          <p>
            <span class="detail-title">Total</span>
            <span class="detail-value"
              >{{ rivalStore.analysis.score.details.sales.totalSales }}/15</span
            >
          </p>
          <p>
            <span class="detail-title">Mensuel</span>
            <span class="detail-value"
              >{{
                rivalStore.analysis.score.details.sales.monthlySales
              }}/15</span
            >
          </p>
        </div>
      </div>

      <div class="score-card">
        <div class="total-card">
          <h3 class="card-title">Diversification</h3>
          <p class="highlighted-total gradient-text">
            {{
              rivalStore.analysis.score.details.diversification.international
            }}/20
          </p>
        </div>
        <div class="card-details">
          <p>
            <span class="detail-title">International</span>
            <span class="detail-value"
              >{{
                rivalStore.analysis.score.details.diversification.international
              }}/20 ({{
                Object.entries(
                  rivalStore.analysis.commentsData.salesByCountry
                ).filter(
                  ([country, sales]) =>
                    country.toLowerCase() !== "france" && sales > 0
                ).length
              }}
              pays)</span
            >
          </p>
        </div>
      </div>
    </div>

    <div class="resume-wrapper styled-resume">
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
          <li
            v-for="keypoint in rivalStore.analysis.score.level.tips"
            :key="keypoint"
          >
            <span class="bullet">•</span> {{ keypoint }}
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

const levelBadge = computed(() => {
  const score = rivalStore.analysis.score.scoreOn100 || 0;
  if (score >= 90) return "🏆"; // Elite - Or
  if (score >= 75) return "🥈"; // Pro - Argent
  if (score >= 60) return "🥉"; // Active - Bronze
  if (score >= 40) return "🌱"; // Développement - Pousse
  return "🆕"; // Débutante - Nouveau
});

const levelClass = computed(() => {
  const score = rivalStore.analysis.score.scoreOn100 || 0;
  if (score >= 90) return "bg-amber-400/20 text-amber-400";
  if (score >= 75) return "bg-gray-400/20 text-gray-400";
  if (score >= 60) return "bg-orange-700/20 text-orange-700";
  if (score >= 40) return "bg-green-600/20 text-green-600";
  return "bg-blue-500/20 text-blue-500";
});

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
  padding: 16px;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .title-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-section {
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
          width: 25px;
          height: 25px;
          stroke: var(--color-primary);
          fill: none;
        }
      }

      .title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text);
      }
    }

    .level-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: bold;
      text-align: right;

      .medal {
        font-size: 1.25rem;
      }
    }
  }

  .charts-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    align-items: center;

    .score-donut-wrapper,
    .score-kiviat-wrapper {
      min-width: 300px;
      max-width: 100%;
      position: relative;

      .chart {
        height: 100%;
        width: 100%;
        max-height: 300px;
        max-width: 300px;
      }

      .chart-info {
        margin-top: 1rem;
        text-align: center;

        .info-title {
          font-size: 1rem;
          font-weight: bold;
          color: var(--color-text);
        }

        .info-value {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
      }
    }

    .score-donut-wrapper {
      flex: 1 1 30%; // Further reduce size of the global score chart
      max-width: 200px; // Ensure the chart is smaller
      position: relative;

      .chart {
        height: 100%;
        width: 100%;
        max-height: 200px; // Adjust max height
        max-width: 200px; // Adjust max width
      }

      .score-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;

        .score {
          font-size: 1.8rem; // Slightly smaller font size
          font-weight: bold;
          color: var(--color-text);
        }

        .label {
          font-size: 0.8rem; // Slightly smaller font size
          color: var(--color-text-secondary);
        }
      }
    }
  }

  .scores-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: space-between;

    .score-card {
      flex: 1 1 calc(33.33% - 16px);
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: 8px;

      .total-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--color-bg-secondary);
        border-radius: 0.5rem;

        .card-title {
          font-size: 1rem;
          font-weight: bold;
          color: var(--color-text);
        }

        .highlighted-total {
          font-size: 1.2rem;
          font-weight: bold;
          background: linear-gradient(
            0deg,
            rgba(167, 139, 250, 0.8),
            rgba(139, 92, 246, 0.8)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .card-details {
        font-size: 0.875rem;
        color: var(--color-text-secondary);

        p {
          display: flex;
          justify-content: space-between;
          margin: 0;

          .detail-title {
            font-weight: bold;
          }

          .detail-value {
            text-align: right;
          }
        }
      }
    }
  }

  .styled-resume {
    background-color: var(--color-bg-tertiary);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);

    .resume-title-wrapper,
    .resume-niche-analysis-wrapper,
    .resume-keypoints-wrapper {
      margin-bottom: 1rem;

      .title {
        font-size: 1rem;
        font-weight: bold;
        color: var(--color-text);
        margin-bottom: 0.5rem;
      }

      .description {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }

      .keypoints {
        list-style: none;
        padding: 0;

        li {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          color: var (--color-text-secondary);

          .bullet {
            color: var(--color-primary);
            margin-right: 0.5rem;
          }
        }
      }
    }
  }
}
</style>
