<template>
  <section class="orders-wrapper">
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

    <div class="orders-display">
      <DefaultButton
        small
        smallText
        smallIcon
        iconLeft="menu"
        fit
        text="Vue en liste"
      />
      <DefaultButton
        small
        smallText
        smallIcon
        iconLeft="menuSquare"
        text="Vue en carte"
        fit
      />
    </div>

    <table class="orders-table">
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
        <tr v-for="sale in saleStore.sales" :key="sale.id">
          <td>{{ formatDate(sale.saleDate) }}</td>
          <td>{{ sale.orderNumber }}</td>
          <td>{{ sale.itemName }}</td>
          <td>{{ sale.paymentMethod }}</td>
          <td>{{ formatPrice(sale.saleAmount) }}</td>
          <td>{{ formatPrice(sale.expenses) }}</td>
          <td>{{ formatPrice(sale.totalAmount) }}</td>
          <td>
            <a
              :href="`http://localhost:3001/api/documents/sale/${sale.id}/shippingLabel`"
            >
              <DefaultButton text="Télécharger" iconLeft="download01" fit />
            </a>
          </td>
          <td>
            <a
              :href="`http://localhost:3001/api/documents/sale/${sale.id}/returnForm`"
            >
              <DefaultButton text="Télécharger" iconLeft="download01" fit />
            </a>
          </td>
          <td>
            <a
              :href="`http://localhost:3001/api/documents/sale/${sale.id}/invoice`"
            >
              <DefaultButton text="Télécharger" iconLeft="download01" fit />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";

const userStore = useUserStore();
const saleStore = useSaleStore();
const router = useRouter();

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR");
};

const formatPrice = (price: string) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price));
};

type DocumentType = "shippingLabel" | "returnForm" | "invoice";

const downloadDocument = async (saleId: string, type: string) => {
  try {
    // @click="downloadDocument(sale.id, 'shippingLabel')"
    //
    // const response = await fetch(`/api/documents/sale/${saleId}/${type}`);
    // const blob = await response.blob();
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = `${type}-${saleId}.pdf`;
    // document.body.appendChild(a);
    // a.click();
    // window.URL.revokeObjectURL(url);
    // a.remove();
    // router.push(`http://localhost:3001/api/documents/sale/${saleId}/${type}`);
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
