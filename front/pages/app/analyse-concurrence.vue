<template>
  <section class="rival-analysis-wrapper">
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
      <PresentationCard :content="rivalShopContent" presentation />
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
    <div>
      <h1>Données de la boutique</h1>
      <pre v-if="rivalStore.shop">
        {{ rivalStore.shop }}
    </pre
      >
      <p v-else>Aucune donnée disponible.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { launchAnalysis } from "~/utils/v2/rivalAnalyzerEngine";
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

import { ref, onMounted } from "vue";
const rivalStore = useRivalStore();
const userStore = useUserStore();
const saleStore = useSaleStore();

onMounted(() => {
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "EXTENSION_DONNEES") {
      rivalStore.setShopData(event.data.data);
      launchAnalysis({
        shop: rivalStore.shop,
        evaluations: rivalStore.evaluations,
        articles: rivalStore.articles,
      });
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
  // width: fit-content;
  gap: 100px;
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
