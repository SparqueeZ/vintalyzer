<template>
  <section class="dashboard-wrapper">
    <section class="principal-content-wrapper">
      <div class="welcomeMessage-module-wrapper">
        <div class="welcomeMessage-wrapper">
          <h1 class="title">Bienvenue {{ userStore.user.firstname }},</h1>
          <p class="subtitle">
            Voici une vue d'ensemble de votre boutique vinted.
          </p>
        </div>
        <CalendarInput
          v-if="saleStore.shop.name"
          v-model="userStore.selectedRange"
          format="DD/MM/YYYY"
        />
      </div>
      <div v-if="saleStore.shop.name" class="content">
        <Summaries :selectedRange="userStore.selectedRange" />
        <StatisticChart :selectedRange="userStore.selectedRange" />
      </div>
    </section>
    <section class="secondary-content-wrapper">
      <Subscription />
      <ShopInformations v-if="saleStore.shop.name" />
      <Engagement v-if="saleStore.shop.name" />
      <StatsByCountry v-if="saleStore.shop.name" />
    </section>

    <!-- <div class="store-informations-wrapper">
      <div class="store-informations">
        <ShopStats />
      </div>
    </div>
    <div class="orders-informations-wrapper">
      <div class="orders-informations">
        <SalesStats />
        <p>Commandes à traiter</p>
        <p>Commandes à envoyer</p>
        <ExpenseStats />
      </div>
    </div>
    <div class="flex flex-wrap gap-4 mt-6">
      <!-- <SalesChart />
      <p>Commandes récentes</p>
    </div> -->
  </section>
  <section v-if="!saleStore.shop.name" class="dashboard-wrapper no-shop">
    <p class="error-message main">Vous n'avez pas encore de boutique. <br /></p>
    <p>Nouveau sur la plateforme ? Configurez votre boutique</p>
    <DefaultButton text="Recharger" transparent fit />
  </section>
</template>

<script setup>
import Icon from "~/components/Icon.vue";
import { useUserStore } from "../stores/UserStore";
import { useSaleStore } from "../stores/SaleStore";
import { hasPermission } from "~/assets/js/auth";
import { onMounted, ref } from "vue";
import Summaries from "~/components/Dashboard/Summaries.vue";
import StatisticChart from "~/components/Dashboard/StatisticChart.vue";
import Subscription from "~/components/Dashboard/Subscription.vue";
import ShopInformations from "~/components/Dashboard/ShopInformations.vue";
import Engagement from "~/components/Dashboard/Engagement.vue";
import StatsByCountry from "~/components/Dashboard/StatsByCountry.vue";
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";
import CalendarInput from "~/components/Form/CalendarInput.vue";

const saleStore = useSaleStore();
const userStore = useUserStore();

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>

<style lang="scss" scoped>
.dashboard-wrapper {
  width: 85%;
  padding: 2rem 2rem;
  margin-inline: auto;
  // width: fit-content;
  display: flex;
  gap: 100px;
  .error-message {
    width: 100%;
    font-size: 3rem;
    font-weight: bold;
    color: var(--color-text);
    text-align: center;
  }
  &.no-shop {
    gap: 16px;
    min-height: 50svh;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .principal-content-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 64px;

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
    .content {
      display: flex;
      flex-direction: column;
      gap: 64px;
    }
  }

  .secondary-content-wrapper {
    display: flex;
    flex-direction: column;
    width: fit-content;
    gap: 64px;
  }
}
</style>
