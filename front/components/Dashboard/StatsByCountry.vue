<template>
  <article class="country-stats-module-wrapper">
    <div class="title-wrapper">
      <div class="icon-wrapper">
        <Icon name="world"></Icon>
      </div>
      <p class="title">Ventes / pays</p>
    </div>
    <div class="stats-wrapper">
      <div class="stat-wrapper" v-for="c in commentsByCountry" :key="c.country">
        <div class="country-top">
          <div class="country-wrapper">
            <div class="country-icon"></div>
            <p class="country-name">{{ c.country }}</p>
          </div>
          <div class="stat-wrapper">{{ c.percentage.toFixed(1) }}%</div>
        </div>
        <div class="country-bottom">
          <div class="stat-bar-wrapper">
            <div class="stat-bar" :style="{ width: c.percentage + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
const saleStore = useSaleStore();

const countryMapping: { [key: string]: string } = {
  fr: "France",
  de: "Allemagne",
  es: "Espagne",
  it: "Italie",
  gb: "Royaume-Uni",
  nl: "Pays-Bas",
  be: "Belgique",
  pt: "Portugal",
  unknown: "Inconnu",
};

const commentsByCountry = ref<
  { country: string; count: number; percentage: number }[]
>([]);

const checkCommentsByCountry = () => {
  const comments = saleStore.coments;
  const langs = comments.map((c) => c.lang);
  const uniqueLangs = langs.reduce(
    (acc: { [key: string]: number }, lang: string) => {
      if (acc[lang]) {
        acc[lang]++;
      } else {
        acc[lang] = 1;
      }
      return acc;
    },
    {}
  );

  const total = Object.values(uniqueLangs).reduce(
    (sum, count) => sum + count,
    0
  );

  commentsByCountry.value = Object.entries(uniqueLangs)
    .map(([code, count]) => ({
      country: countryMapping[code] || code,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);
};

console.log(checkCommentsByCountry());
</script>

<style scoped lang="scss">
.country-stats-module-wrapper {
  padding: 16px;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;
  width: fit-content;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  gap: 32px;
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
  .stats-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;

    .stat-wrapper {
      border-radius: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 8px;
      .country-top {
        display: flex;
        justify-content: space-between;
        .country-wrapper {
          display: flex;
          gap: 8px;
          .country-icon {
            width: 25px;
            height: 25px;
            background-color: var(--color-bg-tertiary);
            border-radius: 5px;
            border: var(--color-border) solid 1px;
          }
          .country-name {
            font-size: 1rem;
            color: var(--color-text);
          }
        }
      }
      .country-bottom {
        .stat-bar-wrapper {
          background-color: var(--color-bg-tertiary);
          border-radius: 0.5rem;
          overflow: hidden;
          .stat-bar {
            height: 10px;
            background-color: var(--color-primary);
            border-radius: 5px;
          }
        }
      }
    }
  }
}
</style>
