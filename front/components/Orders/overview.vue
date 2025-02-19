<template>
  <div class="orders-overview-wrapper">
    <h1 class="title">Commandes</h1>
    <div class="orders-head">
      <div class="dealing-orders category">
        <h2>Commandes à traiter</h2>
        <p class="text">
          <span class="number">
            {{ saleStore.sales.length }}
          </span>
          commandes
        </p>
      </div>
      <div class="sended-orders category">
        <h2>Commandes expédiées</h2>
        <p class="text">
          <span class="number">
            {{ saleStore.sales.length }}
          </span>
          commandes
        </p>
      </div>

      <div class="reload-orders category">
        <h2>Rafraichir les commandes</h2>
        <div class="reload-button">
          <DefaultButton
            text="Recharger"
            iconLeft="refresh01"
            fit
            :loading="saleStore.loading"
            :disabled="saleStore.loading"
            @click="saleStore.fetchSales()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const saleStore = useSaleStore();
import DefaultButton from "../Form/Buttons/defaultButton.vue";
</script>

<style scoped lang="scss">
.orders-overview-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.orders-wrapper {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .title {
    font-size: 2rem;
    font-weight: bold;
  }
  .orders-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-secondary-bg);
    border-radius: 5px;
    padding: 50px 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    .category {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 0 50px;
      &:nth-child(2) {
        border-right: 1px solid var(--color-border);
        border-left: 1px solid var(--color-border);
      }

      .number {
        font-size: 4rem;
        line-height: 4rem;
        font-weight: bold;
        color: var(--color-text);
      }
      h2 {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-text-subtitle);
      }
      .text {
        font-size: 0.9rem;
      }
    }
    .reload-button {
      min-height: 64px;
      display: flex;
      align-items: end;
    }
  }
}
</style>
