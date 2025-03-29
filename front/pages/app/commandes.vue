<template>
  <section class="orders-wrapper">
    <div class="welcomeMessage-module-wrapper">
      <div class="welcomeMessage-wrapper">
        <h1 class="title">Vos commandes</h1>
        <p class="subtitle">
          Voici un aperçu de vos commandes en cours et en attente d'expédition.
        </p>
      </div>
      <CalendarInput
        v-if="saleStore.shop.name"
        v-model="userStore.selectedRange"
        format="DD/MM/YYYY"
      />
    </div>
    <OrdersOverview :selectedRange="userStore.selectedRange" />

    <div class="orders">
      <OrdersList
        v-if="orderStore.loading || orderStore.orders.length > 0"
        :selectedRange="userStore.selectedRange"
      />

      <div
        v-if="orderStore.orders.length === 0 && !orderStore.loading"
        class="orders-none"
      >
        <p class="text">
          Aucune commande n'est actuellement reliée à votre compte.
        </p>
        <div class="reload-orders">
          <p class="reload-text">Essayer de recharger les commandes :</p>
          <DefaultButton
            text="Rafraichir"
            iconLeft="refresh01"
            fit
            :loading="orderStore.loading"
            :disabled="orderStore.loading"
            @click="fetchOrders"
            transparent
          />
        </div>
        <p class="help-text">
          Vous ne voyez toujours pas vos commandes ?
          <span class="link">
            Regardez le tutoriel pour savoir comment ajouter vos commandes.
          </span>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";
import OrdersOverview from "~/components/Orders/overview.vue";
import OrdersList from "~/components/Orders/orderList.vue";
import Summaries from "~/components/Dashboard/Summaries.vue";
import OverviewCards from "~/components/OverviewCards.vue";
import CalendarInput from "~/components/Form/CalendarInput.vue";

const saleStore = useSaleStore();
const userStore = useUserStore();
const orderStore = useOrderStore();

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

// Remove or comment out the unused function since we're handling downloads in orderList.vue now
/* 
type DocumentType = "shippingLabel" | "returnForm" | "invoice";

const downloadDocument = async (orderId: string, type: string) => {
  try {
    // Code removed as it's now implemented in orderList.vue
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
  }
};
*/

const fetchOrders = () => {
  return orderStore.fetchOrders();
};
</script>

<style scoped lang="scss">
.orders-wrapper {
  width: 85%;
  padding: 2rem 2rem;
  margin-inline: auto;
  // width: fit-content;
  display: flex;
  flex-direction: column;
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

  .orders {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .orders-none {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rem;
    padding: 2rem;
    border-radius: 5px;
    min-height: 50svh;

    .text {
      font-size: 3rem;
      font-weight: bold;
    }

    .reload-orders {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      justify-content: center;
      .reload-text {
        font-size: 0.9rem;
        color: var(--color-text-subtitle);
      }
    }

    .help-text {
      font-size: 0.9rem;
      color: var(--color-text-subtitle);
      display: flex;
      flex-direction: column;
      align-items: center;

      .link {
        cursor: pointer;
        text-decoration: underline;
        color: var(--color-text);
        transition: color 0.2s ease-out;
      }
      &:hover {
        .link {
          color: var(--color-primary);
        }
      }
    }
  }
}
</style>
