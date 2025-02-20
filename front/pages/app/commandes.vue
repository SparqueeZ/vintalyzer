<template>
  <section class="orders-wrapper">
    <OrdersOverview v-if="orderStore.orders.length > 0" />

    <div class="orders">
      <OrdersList v-if="orderStore.orders.length > 0" />

      <div v-else class="orders-none">
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
            @click="orderStore.fetchOrders()"
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

const orderStore = useOrderStore();

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

type DocumentType = "shippingLabel" | "returnForm" | "invoice";

const downloadDocument = async (orderId: string, type: string) => {
  try {
    // @click="downloadDocument(order.id, 'shippingLabel')"
    //
    // const response = await fetch(`/api/documents/order/${orderId}/${type}`);
    // const blob = await response.blob();
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = `${type}-${orderId}.pdf`;
    // document.body.appendChild(a);
    // a.click();
    // window.URL.revokeObjectURL(url);
    // a.remove();
    // router.push(`http://localhost:3001/api/documents/order/${orderId}/${type}`);
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
  }
};
</script>

<style scoped lang="scss">
.orders-wrapper {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 5rem;
  min-height: 100svh;

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
    min-height: 100svh;

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
