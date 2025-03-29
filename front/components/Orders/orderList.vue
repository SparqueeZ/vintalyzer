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

  <table v-if="toggleButtonListActive" class="history-table">
    <thead class="table-header">
      <tr>
        <th @click="toggleSort('date')" class="sortable">
          Date
          <span class="sort-icon">{{ getSortIcon("date") }}</span>
        </th>
        <th @click="toggleSort('orderNumber')" class="sortable">
          N° Commande
          <span class="sort-icon">{{ getSortIcon("orderNumber") }}</span>
        </th>
        <th @click="toggleSort('itemName')" class="sortable">
          Article
          <span class="sort-icon">{{ getSortIcon("itemName") }}</span>
        </th>
        <th @click="toggleSort('orderAmount')" class="sortable">
          Prix de vente
          <span class="sort-icon">{{ getSortIcon("orderAmount") }}</span>
        </th>
        <th @click="toggleSort('expenses')" class="sortable">
          Frais
          <span class="sort-icon">{{ getSortIcon("expenses") }}</span>
        </th>
        <th @click="toggleSort('totalAmount')" class="sortable">
          Total
          <span class="sort-icon">{{ getSortIcon("totalAmount") }}</span>
        </th>
        <th>Date maximale</th>
        <th>Statut</th>
        <th>Document</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody v-if="!orderStore.loading">
      <tr v-for="order in ordersInSelectedDates" :key="order.id">
        <td>{{ formatDate(order.orderDate) }}</td>
        <td>{{ order.orderNumber }}</td>
        <td>{{ order.itemName }}</td>
        <td>
          {{
            formatPrice((order.totalAmount - order.buyerProtection).toString())
          }}
        </td>
        <td>{{ formatPrice(order.buyerProtection) }}</td>
        <td>
          {{ formatPrice(order.totalAmount) }}
        </td>

        <td class="limit-date">
          <p>{{ getLimitDate(order) }}</p>
        </td>
        <td>
          <div
            class="status-wrapper"
            :class="{
              waiting: Number(order.status) === 0,
              send: Number(order.status) === 1,
              late: Number(order.status) === 2,
              error: Number(order.status) > 2,
            }"
          >
            <div class="status-indicator"></div>
            <p class="status-text">
              {{
                Number(order.status) === 0
                  ? "En attente"
                  : Number(order.status) === 1
                  ? "Envoyée"
                  : Number(order.status) === 2
                  ? "En retard"
                  : "Erreur"
              }}
            </p>
          </div>
        </td>
        <td class="documents">
          <div class="buttons-wrapper">
            <DefaultButton
              iconLeft="tag01"
              fit
              transparent
              iconOnly
              tooltip="Bon de livraison"
              :loading="loadingDocs[`${order.id}-shippingLabel`]"
              :disabled="loadingDocs[`${order.id}-shippingLabel`]"
              @click="downloadDocument(order.id, 'shippingLabel')"
            />
            <DefaultButton
              iconLeft="truckReturn01"
              fit
              transparent
              iconOnly
              tooltip="Bon de retour"
              :loading="loadingDocs[`${order.id}-returnForm`]"
              :disabled="loadingDocs[`${order.id}-returnForm`]"
              @click="downloadDocument(order.id, 'returnForm')"
            />
            <DefaultButton
              iconLeft="receipt"
              fit
              transparent
              iconOnly
              tooltip="Facture"
              :loading="loadingDocs[`${order.id}-invoice`]"
              :disabled="loadingDocs[`${order.id}-invoice`]"
              @click="downloadDocument(order.id, 'invoice')"
            />
          </div>
        </td>
        <td>
          <ContextMenuButton
            text=""
            iconLeft="more01"
            fit
            transparent
            iconOnly
            tooltip="Afficher les options"
            ref="contextButton"
            @click="order.contextMenuIsVisible = true"
            @close-menu="order.contextMenuIsVisible = false"
            @option-selected="handleOptionSelected"
            :is-visible="order.contextMenuIsVisible"
            :menu-options="menuOptions"
            :current-order="order"
            position="left"
          />
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr v-for="index in 3" :key="index">
        <td>
          <div class="loading-text"></div>
        </td>
        <td>
          <div class="loading-text"></div>
        </td>
        <td>
          <div class="loading-text"></div>
        </td>
        <td>
          <div class="loading-text"></div>
        </td>
        <td>
          <div class="loading-text"></div>
        </td>
        <td>
          <div class="loading-text"></div>
        </td>
        <td>
          <div class="loading-text"></div>
        </td>
        <td>
          <div class="loading-text"></div>
        </td>
        <td class="documents">
          <div class="buttons-wrapper">
            <a>
              <DefaultButton
                iconLeft="tag01"
                fit
                transparent
                iconOnly
                tooltip="Bon de livraison"
              />
            </a>
            <a>
              <DefaultButton
                iconLeft="truckReturn01"
                fit
                transparent
                iconOnly
                tooltip="Bon de retour"
              />
            </a>
            <a>
              <DefaultButton
                iconLeft="receipt"
                fit
                transparent
                iconOnly
                tooltip="Facture"
              />
            </a>
          </div>
        </td>

        <td>
          <DefaultButton
            text=""
            iconLeft="more01"
            fit
            transparent
            iconOnly
            tooltip="Afficher les options"
          />
        </td>
      </tr>
    </tbody>
  </table>

  <div v-else class="orders-grid">
    <section class="orders-cards-wrapper">
      <article
        class="order-card"
        v-for="(order, index) in ordersInSelectedDates"
        :key="order.id"
      >
        <div
          class="status-wrapper"
          :class="{
            waiting: Number(order.status) === 0,
            send: Number(order.status) === 1,
            late: Number(order.status) === 2,
            error: Number(order.status) > 2,
          }"
        >
          <div class="status-indicator"></div>
          <p class="status-text">
            {{
              Number(order.status) === 0
                ? "En attente"
                : Number(order.status) === 1
                ? "Envoyée"
                : Number(order.status) === 2
                ? "En retard"
                : "Erreur"
            }}
          </p>
        </div>
        <div class="image-wrapper"></div>
        <div class="main-wrapper">
          <p class="name">{{ order.itemName }}</p>
          <p class="reference">#{{ order.orderNumber }}</p>
        </div>
        <div class="details-wrapper">
          <div class="date-wrapper">
            <Icon name="calendar01" />
            <p>{{ formatDate(order.orderDate) }}</p>
          </div>
          <div class="customer-wrapper">
            <div class="customer-name" v-if="order.Customer.name">
              <Icon name="user01" />
              <p>{{ cleanName(order.Customer.name) }}</p>
            </div>
            <div class="address-wrapper">
              <Icon name="location01" />
              <p>{{ formatAddress(order.Customer.address) }}</p>
            </div>
            <div class="email-wrapper">
              <Icon name="mail01" />
              <p>{{ order.Customer.email }}</p>
            </div>
          </div>
        </div>
        <!-- <p>{{ formatPrice(order.orderAmount) }}</p>
        <p>{{ formatPrice(order.expenses) }}</p>
        <p>
          {{ formatPrice(order.totalAmount) }}
        </p> -->
        <div class="button-wrapper">
          <p>
            {{ formatPrice(order.totalAmount) }}
          </p>
          <DefaultButton
            v-if="order.status === '0'"
            iconLeft="tick01"
            fit
            transparent
            text="Expédiée"
            green
            @click="handleStatusChange(order.id, '1')"
          />
          <DefaultButton
            v-if="order.status === '1'"
            iconLeft="cancel02"
            fit
            transparent
            text="En attente"
            red
            @click="handleStatusChange(order.id, '0')"
          />
        </div>

        <div class="documents-wrapper">
          <DefaultButton
            iconLeft="tag01"
            fit
            transparent
            text="Bon de livraison"
            :loading="loadingDocs[`${order.id}-shippingLabel`]"
            :disabled="loadingDocs[`${order.id}-shippingLabel`]"
            @click="downloadDocument(order.id, 'shippingLabel')"
          />
          <DefaultButton
            iconLeft="truckReturn01"
            fit
            transparent
            text="Bon de retour"
            :loading="loadingDocs[`${order.id}-returnForm`]"
            :disabled="loadingDocs[`${order.id}-returnForm`]"
            @click="downloadDocument(order.id, 'returnForm')"
          />
          <DefaultButton
            iconLeft="receipt"
            fit
            transparent
            text="Facture"
            :loading="loadingDocs[`${order.id}-invoice`]"
            :disabled="loadingDocs[`${order.id}-invoice`]"
            @click="downloadDocument(order.id, 'invoice')"
          />
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";
import ToggleButton from "../Form/Buttons/toggleButton.vue";
import OrdersOverview from "~/components/Orders/overview.vue";
import fixedContext from "../ContextMenu/fixedContext.vue";
import ContextMenuButton from "../Form/Buttons/contextMenuButton.vue";
const orderStore = useOrderStore();
const toggleButtonListActive = ref(true);
const toggleButtonCardActive = ref(false);
import type { MenuCategory } from "../Form/Buttons/contextMenuButton.vue";

const props = defineProps<{
  selectedRange: { start: Date; end: Date };
}>();

interface SortState {
  [key: string]: "asc" | "desc" | null;
}

const contextMenuVisible = ref(false);
const menuX = ref(0);
const menuY = ref(0);

const handleOptionSelected = () => {
  setTimeout(() => {
    contextMenuVisible.value = false;
  }, 100);
};

const getLimitDate = (order: any) => {
  const orderDate = new Date(order.orderDate);
  const limitDate = new Date(orderDate);
  limitDate.setDate(orderDate.getDate() + 4);

  return limitDate.toLocaleDateString("fr-FR");
};

const menuOptions = ref<MenuCategory[]>([
  {
    category: "Action",
    categoryIcon: "more01",
    options: [
      {
        icon: (order) => (order.status === "1" ? "cancel02" : "tick01"),
        label: (order) =>
          order.status === "1"
            ? "Remettre en attente"
            : "Marquer comme expédiée",
        action: (order: any) =>
          handleStatusChange(order.id, order.status === "1" ? "0" : "1"),
        category: "Action",
      },
    ],
  },
  {
    category: "Documents",
    categoryIcon: "more01",
    options: [
      {
        icon: "receipt",
        label: "Télécharger la facture",
        action: (order: any) => downloadDocument(order.id, "invoice"),
        category: "Documents",
      },
      {
        icon: "truckReturn01",
        label: "Télécharger le bon de retour",
        action: (order: any) => downloadDocument(order.id, "returnForm"),
        category: "Documents",
      },
      {
        icon: "tag01",
        label: "Télécharger le bon de livraison",
        action: (order: any) => downloadDocument(order.id, "shippingLabel"),
        category: "Documents",
      },
    ],
  },
  {
    category: "Other",
    categoryIcon: "more01",
    options: [
      {
        icon: "delete01",
        label: "Supprimer",
        action: () => console.log("Supprimer"),
        category: "Other",
        color: "red",
      },
    ],
  },
]);

const handleStatusChange = async (orderId: string, newStatus: string) => {
  try {
    // Add loading state for status changes
    const order = orderStore.orders.find((order) => order.id === orderId);
    if (!order) return;

    // Create a loading key for this specific action
    const loadingKey = `${orderId}-statusChange`;
    loadingDocs.value[loadingKey] = true;

    // Call store method to update status
    await orderStore.updateOrderStatus(orderId, newStatus);

    // Check if order became late (status 2) after trying to set it to pending (status 0)
    if (newStatus === "0" && order.status === "2") {
      alert(
        "Cette commande a dépassé sa date limite et a été marquée comme 'En retard'."
      );
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    alert("Erreur lors de la mise à jour du statut.");
  } finally {
    // Clear loading state
    const loadingKey = `${orderId}-statusChange`;
    loadingDocs.value[loadingKey] = false;
  }
};

const selectedButton = ref<HTMLElement | null>(null);
const openContextMenu = (event: MouseEvent, order: Order) => {
  event.preventDefault();
  selectedButton.value = event.currentTarget as HTMLElement;
  contextMenuVisible.value = true;
};

const sortState = ref<SortState>({});
const getSortIcon = (column: string) => {
  const sort = sortState.value[column];
  if (!sort) return "↕";
  return sort === "asc" ? "↑" : "↓";
};

const toggleSort = (column: string) => {
  const currentSort = sortState.value[column];
  if (!currentSort) {
    sortState.value[column] = "asc";
  } else if (currentSort === "asc") {
    sortState.value[column] = "desc";
  } else {
    sortState.value[column] = null;
  }
};

const ordersInSelectedDates = computed(() => {
  let filteredOrders = orderStore.orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    return (
      orderDate >= props.selectedRange.start &&
      orderDate <= props.selectedRange.end
    );
  });

  // Apply all active sorts
  return filteredOrders.sort((a, b) => {
    for (const [column, direction] of Object.entries(sortState.value)) {
      if (!direction) continue;

      let compareResult = 0;
      if (column === "date") {
        compareResult =
          new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      } else if (["orderAmount", "expenses", "totalAmount"].includes(column)) {
        compareResult = Number(a[column]) - Number(b[column]);
      } else {
        compareResult = String(a[column]).localeCompare(String(b[column]));
      }

      if (compareResult !== 0) {
        return direction === "asc" ? compareResult : -compareResult;
      }
    }
    return 0;
  });
});

const formatAddress = (address: string) => {
  return address
    .replace(/<[^>]*>/g, "")
    .split("https://")[0]
    .split(",")
    .slice(1)
    .join(",")
    .trim();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR");
};

const formatPrice = (price: string) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price));
};

// Add function to clean customer names by removing asterisks
const cleanName = (name: string) => {
  if (!name) return "";

  // Check if name is surrounded by asterisks
  if (name.startsWith("*") && name.endsWith("*")) {
    return name.slice(1, -1);
  }
  // Handle other cases
  return name.replace(/\*/g, "");
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

// Track loading state for document downloads
const loadingDocs = ref<{ [key: string]: boolean }>({});

const downloadDocument = async (orderId: string, type: string) => {
  try {
    // Set loading state for this specific document
    loadingDocs.value[`${orderId}-${type}`] = true;

    // Check the document type to determine the right API endpoint
    let url;

    if (type === "invoice") {
      url = `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
      }/api/invoices/${orderId}`;
    } else {
      // Use the existing endpoint for other document types
      url = `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
      }/api/documents/sale/${orderId}/${type}`;
    }

    // For invoice, use a different approach since it may need to be generated
    if (type === "invoice") {
      console.log(`[INVOICE] Requesting invoice for order ${orderId}`);

      // Make a direct fetch request - don't use HEAD for invoices
      const response = await fetch(url, {
        method: "GET",
        credentials: "include", // Important for auth cookies
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error(
            `[INVOICE ERROR] ${errorMessage}`,
            errorData.details || ""
          );
        } catch (e) {
          // Response wasn't JSON, use default error
        }

        throw new Error(errorMessage);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link and trigger it
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `facture-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the object URL
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 100);

      return;
    }

    // For other documents, continue using the existing logic with HEAD check
    const response = await fetch(url, {
      method: "HEAD",
      credentials: "include", // Include auth cookies
    });

    if (!response.ok) {
      throw new Error(`Document not available: ${response.statusText}`);
    }

    // Open in new tab
    window.open(url, "_blank");
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    alert(
      `Le document n'est pas disponible: ${error.message || "Erreur inconnue"}`
    );
  } finally {
    // Always clear loading state when done, regardless of success or failure
    loadingDocs.value[`${orderId}-${type}`] = false;
  }
};
</script>

<style scoped lang="scss">
.history-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  .table-header {
    th {
      padding: 1rem;
      text-align: left;
      background-color: var(--color-bg-tertiary);
      color: var(--color-white);
      font-size: 0.8rem;
      text-wrap: nowrap;

      &:first-child {
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
      }
      &:last-child {
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
      }
    }
    &.sortable {
      cursor: pointer;
      user-select: none;

      &:hover {
        background-color: var(--color-bg-secondary);
      }
    }
  }

  tbody {
    tr {
      transition: background-color 0.2s ease-out;
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
      min-height: 67px;
      margin: auto;
      font-size: clamp(0.6rem, 0.9rem, 1rem);

      &:hover {
        background-color: var(--color-bg-tertiary);
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid var(--color-border);
        min-height: 67px;
        margin: auto;
        font-size: clamp(0.6rem, 0.9rem, 1rem);
        .button-container {
          position: relative;
        }
        .contextMenu {
          position: absolute;
          left: 100%;
        }
        .buttons-wrapper {
          display: flex;
          align-items: center;
          width: fit-content;
          gap: 8px;
        }
        .status-wrapper {
          display: flex;
          align-items: center;
          width: fit-content;
          padding: 4px 8px;
          border-radius: 4px;
          .status-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 0.5rem;
            &.waiting {
              background-color: var(--color-orange);
            }
            &.send {
              background-color: var(--color-green);
            }
            &.late {
              background-color: var(--color-red);
            }
            &.error {
              background-color: var(--color-red);
            }
          }
          .status-text {
            font-weight: 600;
            font-size: clamp(0.5rem, 0.7rem, 0.8rem);
            text-wrap: nowrap;
            &.waiting {
              background-color: var(--color-bg-orange);
              color: var(--color-orange);
            }
            &.send {
              background-color: var(--color-bg-green);
              color: var(--color-green);
            }
            &.late {
              background-color: var(--color-bg-red);
              color: var(--color-red);
            }
            &.error {
              background-color: var(--color-bg-red);
              color: var(--color-red);
            }
          }
          &.waiting {
            background-color: var(--color-bg-orange);
            color: var(--color-orange);
            .status-indicator {
              background-color: var(--color-orange);
            }
          }
          &.send {
            background-color: var(--color-bg-green);
            color: var(--color-green);
            .status-indicator {
              background-color: var(--color-green);
            }
          }
          &.late {
            background-color: var(--color-bg-red);
            color: var(--color-red);
            .status-indicator {
              background-color: var(--color-red);
            }
          }
          &.error {
            background-color: var(--color-bg-red);
            color: var(--color-red);
            .status-indicator {
              background-color: var(--color-red);
            }
          }
        }
      }
    }

    tr:last-child {
      td {
        border-bottom: none;

        &:first-child {
          border-bottom-left-radius: 0.5rem;
        }
        &:last-child {
          border-bottom-right-radius: 0.5rem;
        }
      }
    }
  }
}

.orders-cards-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  .order-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border-radius: 5px;
    background-color: var(--color-bg-tertiary);
    width: 100%;
    .status-wrapper {
      display: flex;
      align-items: center;
      width: fit-content;
      padding: 4px 8px;
      border-radius: 4px;
      .status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 0.5rem;
        &.waiting {
          background-color: var(--color-orange);
        }
        &.send {
          background-color: var(--color-green);
        }
        &.late {
          background-color: var(--color-red);
        }
        &.error {
          background-color: var(--color-red);
        }
      }
      .status-text {
        font-weight: 600;
        font-size: clamp(0.5rem, 0.7rem, 0.8rem);
        text-wrap: nowrap;
        &.waiting {
          background-color: var (--color-bg-orange);
          color: var(--color-orange);
        }
        &.send {
          background-color: var(--color-bg-green);
          color: var(--color-green);
        }
        &.late {
          background-color: var(--color-bg-red);
          color: var(--color-red);
        }
        &.error {
          background-color: var(--color-bg-red);
          color: var(--color-red);
        }
      }
      &.waiting {
        background-color: var(--color-bg-orange);
        color: var(--color-orange);
        .status-indicator {
          background-color: var(--color-orange);
        }
      }
      &.send {
        background-color: var(--color-bg-green);
        color: var(--color-green);
        .status-indicator {
          background-color: var(--color-green);
        }
      }
      &.late {
        background-color: var(--color-bg-red);
        color: var(--color-red);
        &status-indicator {
          background-color: var(--color-red);
        }
      }
      &.error {
        background-color: var(--color-bg-red);
        color: var(--color-red);
        .status-indicator {
          background-color: var(--color-red);
        }
      }
    }
    .image-wrapper {
      width: 100%;
      height: 200px;
      background-color: var(--color-bg);
      border-radius: 5px;
    }
    .main-wrapper {
      .name {
        font-size: 1.2rem;
        font-weight: bold;
      }
      .reference {
        color: var(--color-text-subtitle);
        font-size: 1rem;
      }
    }
    .details-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-left: 16px;
      font-size: 0.85rem;
      min-height: 107px;
      .date-wrapper {
        display: flex;
        gap: 8px;
        align-items: center;
        .icon {
          width: 20px;
          height: 20px;
          stroke: var(--color-primary);
          fill: none;
        }
      }
      .customer-wrapper {
        display: flex;
        flex-direction: column;
        gap: 18px;
        .customer-name {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;
          .icon {
            width: 20px;
            height: 20px;
            stroke: var(--color-primary);
            fill: none;
          }
        }
        .address-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
          .icon {
            width: 20px;
            height: 20px;
            stroke: var(--color-primary);
            fill: none;
          }
        }
        .email-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
          .icon {
            width: 20px;
            height: 20px;
            stroke: var(--color-primary);
            fill: none;
          }
        }
      }
    }
    .button-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .documents-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  }
}

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
    background-color: var(--color-bg-tertiary);
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
    background-color: var(--color-bg-tertiary);
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

.sort-icon {
  margin-left: 0.5rem;
  display: inline-block;
  width: 1rem;
  text-align: center;
}
</style>
