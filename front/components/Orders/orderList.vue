<template>
  <div class="orders-display" v-if="orderStore.orders.length > 0">
    <ToggleButton
      small
      smallText
      smallIcon
      iconLeft="menu"
      fit
      reverseColor
      text="Vue en liste"
      :active="toggleButtonListActive"
      @click="handleChangeView('list')"
    />
    <ToggleButton
      small
      smallText
      smallIcon
      iconLeft="menuSquare"
      text="Vue en carte"
      fit
      reverseColor
      :active="toggleButtonCardActive"
      @click="handleChangeView('card')"
    />
  </div>

  <table v-if="toggleButtonListActive" class="orders-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>N° Commande</th>
        <th>Article</th>
        <th>Plateforme</th>
        <th>Prix de vente</th>
        <th>Frais</th>
        <th>Total</th>
        <th>Bordereau</th>
        <th>Retour</th>
        <th>Facture</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="order in orderStore.orders" :key="order.id">
        <td>{{ formatDate(order.orderDate) }}</td>
        <td>{{ order.orderNumber }}</td>
        <td>{{ order.itemName }}</td>
        <td>{{ order.paymentMethod }}</td>
        <td>{{ formatPrice(order.orderAmount) }}</td>
        <td>{{ formatPrice(order.expenses) }}</td>
        <td>{{ formatPrice(order.totalAmount) }}</td>
        <td>
          <a
            :href="`http://localhost:3001/api/documents/order/${order.id}/shippingLabel`"
          >
            <DefaultButton text="Télécharger" iconLeft="download01" fit />
          </a>
        </td>
        <td>
          <a
            :href="`http://localhost:3001/api/documents/order/${order.id}/returnForm`"
          >
            <DefaultButton text="Télécharger" iconLeft="download01" fit />
          </a>
        </td>
        <td>
          <a
            :href="`http://localhost:3001/api/documents/order/${order.id}/invoice`"
          >
            <DefaultButton text="Télécharger" iconLeft="download01" fit />
          </a>
        </td>
      </tr>
    </tbody>
  </table>

  <div v-else class="orders-grid">GRID</div>
</template>

<script setup lang="ts">
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";
import ToggleButton from "../Form/Buttons/toggleButton.vue";
import OrdersOverview from "~/components/Orders/overview.vue";

const orderStore = useOrderStore();

const toggleButtonListActive = ref(true);
const toggleButtonCardActive = ref(false);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR");
};

const formatPrice = (price: string) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price));
};

const handleChangeView = (view: string) => {
  if (view === "list") {
    toggleButtonListActive.value = true;
    toggleButtonCardActive.value = false;
  } else {
    toggleButtonListActive.value = false;
    toggleButtonCardActive.value = true;
  }
};
</script>

<style scoped lang="scss">
.orders-wrapper {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .title {
    margin-bottom: 2rem;
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
    .dealing-orders {
    }
  }

  .orders-display {
    display: flex;
    gap: 1rem;
    padding: 0.4rem;
    background-color: var(--color-secondary-bg);
    width: fit-content;
    border-radius: 5px;
  }

  .orders-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--color-border);
    }

    th {
      background-color: var(--color-secondary-bg);
      font-weight: bold;
    }

    tr:hover {
      background-color: var(--color-bg);
    }
  }
}

.download-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #eee;
  }

  .icon {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: var(--color-text);
  }
}
</style>
