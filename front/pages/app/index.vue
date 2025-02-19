<template>
  <section class="dashboard-wrapper">
    <div class="welcomeMessage">
      <h1>Bienvenue {{ userStore.user.firstname }},</h1>
      <p>Voici une vue d'ensemble de votre boutique vinted.</p>
    </div>

    <div class="store-informations-wrapper">
      <div class="flex flex-wrap gap-4 mt-6">
        <ShopStats />
        <SalesStats />
        <TotalStats />
        <ExpenseStats />
      </div>
    </div>
  </section>
</template>

<script setup>
import { useUserStore } from "../stores/UserStore";
import { hasPermission } from "~/assets/js/auth";
const userStore = useUserStore();

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>

<style lang="scss" scoped>
.dashboard-wrapper {
  padding: 2rem 10rem;

  .welcomeMessage {
    h1 {
      font-size: 2rem;
      font-weight: bold;
    }

    p {
      font-size: 1rem;
    }
  }
}
</style>
