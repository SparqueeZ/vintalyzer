<template>
  <section v-if="rivalStore.shop.name" class="rival-analysis-wrapper">
    <div class="welcomeMessage-module-wrapper">
      <div class="welcomeMessage-wrapper">
        <h1 class="title">Analyse concurrente</h1>
        <p class="subtitle">
          Voici une vue d'ensemble de la boutique vinted "{{
            rivalStore.shop.name
          }}".
        </p>
      </div>
    </div>

    <article v-if="rivalStore.shop" class="rival-profile-wrapper">
      <PresentationCard
        :content="rivalShopContent"
        presentation
        :link="rivalStore.shop.url"
      />
      <OverviewCards
        :content="{
          title: `Nombre d'articles`,
          value: rivalStore.articles.length.toString(),
          positive: '0',
          negative: '0',
          icon: 'followers',
        }"
      />
      <OverviewCards
        :content="{
          title: `Evaluations`,
          evaluation: {
            rating: rivalStore.shop?.globalRatings?.rating || '0',
            reviews: rivalStore.shop?.globalRatings?.count || '0',
          },
          positive: '0',
          negative: '0',
          icon: 'star01',
        }"
      />
    </article>

    <section class="CA-overview" v-if="analysis.CA">
      <RivalCACard
        :content="{
          title: 'Ventes',
          subtitle: 'journalières (moyenne sur 30 jours)',
          value1: {
            title: 'CA / jour',
            value: analysis.CA.dailyCA || '0',
          },
          value2: {
            title: 'Ventes / jour',
            value: analysis.CA.dailyCA || '0',
          },
          positive: '0',
          negative: '0',
          icon: 'sales',
        }"
      />

      <RivalCACard
        :content="{
          title: 'Ventes',
          subtitle: 'mensuelles (moyenne sur 30 jours)',
          value1: {
            title: 'CA / mois',
            value: analysis.CA.monthlyCA || '0',
          },
          value2: {
            title: 'Ventes / mois',
            value: analysis.CA.monthlyCA || '0',
          },
          positive: '0',
          negative: '0',
          icon: 'sales',
        }"
      />
      <RivalCACard
        :content="{
          title: `Chiffres d'affaires`,
          subtitle: 'mensuelles (moyenne sur 30 jours)',
          value1: {
            title: 'CA total',
            value: analysis.CA.globalCA || '0',
          },
          value2: {
            title: 'Total commandes',
            value: rivalStore.evaluations.length || '0',
          },
          value3: {
            title: 'Prix moyen',
            value: analysis.CA.globalCA || '0',
          },
          positive: '0',
          negative: '0',
          icon: 'sales',
        }"
      />
    </section>

    <div>
      <h1>Données de la boutique</h1>
      <pre v-if="rivalStore.shop">
        {{ rivalStore.shop }}
    </pre
      >
      <p v-else>Aucune donnée disponible.</p>
    </div>
  </section>
  <section v-else class="rival-analysis-wrapper">
    <p>Aucune donnée disponible.</p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { launchAnalysis } from "~/utils/v2/rivalAnalyzerEngine";
import RivalCACard from "~/components/Rival/RivalCACard.vue";
const analysis = ref({
  CA: {
    dailyCA: 0,
    monthlyCA: 0,
    globalCA: 0,
  },
});
const props = defineProps<{
  content: {
    title: string;
    value?: string;
    icon: string;
    positive?: string;
    negative?: string;
    func?: () => void;
  };
  splitThree?: boolean;
  splitFour?: boolean;
  loading?: boolean;
}>();

const rivalShopContent = ref({
  title: "Boutique",
  value: "Vinted",
  icon: "store",
  positive: "0",
  negative: "0",
  func: () => {
    console.log("test");
  },
});

const rivalStore = useRivalStore();
const saleStore = useSaleStore();

onMounted(() => {
  window.addEventListener("message", async (event) => {
    if (event.data && event.data.type === "EXTENSION_DONNEES") {
      rivalStore.setShopData(event.data.data);
      analysis.value = await launchAnalysis({
        shop: rivalStore.shop,
        evaluations: rivalStore.evaluations,
        articles: rivalStore.articles,
      });
      console.log(analysis.value);
      console.log("SHOP : ", rivalStore.shop);
    }
  });
});

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});
</script>

<style scoped lang="scss">
.rival-analysis-wrapper {
  width: 85%;
  padding: 2rem 2rem;
  margin-inline: auto;
  gap: 100px;
  // width: fit-content;
  .welcomeMessage-module-wrapper {
    display: flex;
    justify-content: space-between;
    .welcomeMessage-wrapper {
      .title {
        font-size: 2.1rem;
        font-weight: bold;
      }

      .subtitle {
        color: var(--color-text-subtitle);
        font-size: 1.1rem;
      }
    }
  }
  .rival-profile-wrapper {
    width: 100%;
    display: flex;
    gap: 64px;
  }
}
</style>
