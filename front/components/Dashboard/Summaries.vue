<template>
  <section class="summaries-wrapper">
    <OverviewCards :content="summary" v-for="summary in summaries" />
  </section>
</template>

<script setup lang="ts">
const saleStore = useSaleStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
const props = defineProps({
  selectedRange: Object,
});

const summaries = [
  {
    title: "Nombre de ventes",
    value: saleStore.sales.length,
    icon: "saleTag",
    positive: "0",
    negative: "0",
  },
  {
    title: "Total des dépenses",
    value: saleStore.expenses.length,
    icon: "receipt",
    positive: "0",
    negative: "0",
  },
  {
    title: "Commandes à traiter",
    value: orderStore.orders.filter((order) => order.status === "0").length,
    icon: "warningCircle",
    positive: "0",
    negative: "0",
  },
  {
    title: "Commandes expédiées",
    value: orderStore.orders.filter((order) => order.status === "1").length,
    icon: "deliveryTruck",
    positive: "0",
    negative: "0",
  },
];
</script>

<style scoped lang="scss">
.summaries-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  width: 100%;
  justify-content: space-between;

  .summary {
    padding: 16px 16px 12px 16px;
    border-radius: 0.5rem;
    background-color: transparent;
    border: var(--color-border) solid 1px;
    width: fit-content;

    @media only screen and (min-width: 1224px) {
      min-width: 45%;
    }
    @media only screen and (min-width: 1824px) {
      min-width: 300px;
    }
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
      font-size: 1.1rem;
      color: var(--color-text-subtitle);
    }

    .informations {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .metric-wrapper {
        display: flex;
        align-items: center;
        border-radius: 5px;
        height: fit-content;
        padding: 0 8px 0 4px;
        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          stroke: var(--color-primary);
          fill: none;
        }
        .percentage {
          font-size: 1.1rem;
          color: var(--color-text);
        }
        &.positive {
          background-color: var(--color-bg-green);
          border: 1px solid var(--color-green);
          .icon {
            stroke: var(--color-green);
            transform: rotate(45deg);
          }
          .percentage {
            font-size: 0.9rem;
            color: var(--color-green);
          }
        }
        &.negative {
          background-color: var(--color-bg-red);
          border: 1px solid var(--color-red);
          .icon {
            stroke: var(--color-red);
            transform: rotate(135deg);
          }
          .percentage {
            font-size: 0.9rem;
            color: var(--color-red);
          }
        }
      }
    }

    .value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--color-text);
    }
  }
}
</style>
