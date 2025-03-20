<template>
  <section class="subscription-history-wrapper">
    <table class="history-table">
      <thead class="table-header">
        <tr>
          <th>Nom de l'abonnement</th>
          <th>Montant</th>
          <th>Date d'achat</th>
          <th>Date de fin</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody v-if="!subscriptionStore.loading">
        <tr v-for="history in subscriptionStore.history" :key="history.id">
          <td>Abonnement {{ history.name }}</td>
          <td>{{ history.price }},00€</td>
          <td>
            {{
              new Date(history.startDate).toLocaleDateString(
                "fr-FR",
                dateOptions
              )
            }}
          </td>
          <td>
            {{
              new Date(history.endDate).toLocaleDateString("fr-FR", dateOptions)
            }}
          </td>
          <td>
            <div class="status-wrapper" :class="history.status">
              <span class="status-indicator"></span>
              <p class="status-name">
                {{ getSubscriptionStatus(history.status) }}
              </p>
            </div>
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
            <div class="status-wrapper">
              <div class="loading-text"></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
const subscriptionStore = useSubscriptionStore();
const dateOptions = {
  year: "numeric" as "numeric",
  month: "numeric" as "numeric",
  day: "numeric" as "numeric",
  hour: "numeric" as "numeric",
  minute: "numeric" as "numeric",
};
const getSubscriptionStatus = (status: string) => {
  if (status === "active") return "Actif";
  if (status === "cancelled") return "Annulé";
  if (status === "expired" || status === "inactive") return "Expiré";
};
</script>

<style scoped lang="scss">
.subscription-history-wrapper {
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

        &:first-child {
          border-top-left-radius: 0.5rem;
          border-bottom-left-radius: 0.5rem;
        }
        &:last-child {
          border-top-right-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
      }
    }

    tbody {
      tr {
        transition: background-color 0.2s ease-out;
        &:hover {
          background-color: var(--color-bg-tertiary);
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          .status-wrapper {
            display: flex;
            align-items: center;
            font-weight: 600;
            .status-indicator {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              display: inline-block;
              margin-right: 0.5rem;
            }

            &.active {
              .status-indicator {
                background-color: var(--color-green);
              }
              color: var(--color-green);
            }
            &.cancelled {
              .status-indicator {
                background-color: var(--color-red);
              }
              color: var(--color-red);
            }
            &.expired {
              .status-indicator {
                background-color: var(--color-red);
              }
              color: var(--color-red);
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
}
</style>
