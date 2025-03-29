<template>
  <section class="subscription-page-wrapper">
    <div class="welcomeMessage">
      <h1 class="title">Mon abonnement</h1>
      <p class="subtitle">
        Vous verrez ici votre abonnement actuel. Vous pouvez également mettre à
        jour votre abonnement.
      </p>
    </div>
    <Spacer :height="50" />
    <SubscriptionDetails />
    <Spacer :height="50" />
    <SubscriptionsPlans />
    <Spacer :height="75" />
    <SubscriptionHistory v-if="userStore.user.Subscription" />
  </section>
</template>

<script setup>
const userStore = useUserStore();
const subscriptionStore = useSubscriptionStore();
import { ref } from "vue";
import axios from "axios";
import SubscriptionsPlans from "~/components/Subscription/SubscriptionsPlans.vue";
import SubscriptionDetails from "~/components/Subscription/SubscriptionDetails.vue";
import SubscriptionHistory from "~/components/Subscription/SubscriptionHistory.vue";

onMounted(async () => {
  if (subscriptionStore.subscriptions.length === 0) {
    // await subscriptionStore.fetchAllSubscriptions();
  }
  await subscriptionStore.fetchUserSubscriptionHistory();
});
const plans = [
  {
    link: "https://buy.stripe.com/test_8wM2b6fd93xofPafYY",
    priceId: "price_1QxsXiFMF8GHiO3if0BUSELX",
    name: "Basic",
    price: "5€/mois",
    plan: "basic",
  },
  {
    link: "https://buy.stripe.com/test_8wM2b6fd93xofPafYY",
    priceId: "price_1QxsXiFMF8GHiO3if0BUSELX",
    name: "Standard",
    price: "10€/mois",
    plan: "standard",
  },
  {
    link: "https://buy.stripe.com/test_8wM2b6fd93xofPafYY",
    priceId: "price_1QxsXiFMF8GHiO3if0BUSELX",
    name: "Premium",
    price: "20€/mois",
    plan: "premium",
  },
];
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});
</script>

<style scoped lang="scss">
.subscription-page-wrapper {
  padding: 2rem 2rem;
  margin-inline: auto;
  width: 85%;
  gap: 100px;
  .welcomeMessage {
    .title {
      font-size: 2.1rem;
      font-weight: bold;
    }

    .subtitle {
      color: var(--color-text-subtitle);
      font-size: 1.1rem;
    }
  }
  .subscriptions-plans-wrapper {
    .title {
      font-size: 1.8rem;
      font-weight: bold;
    }
    .plans {
      display: flex;
      gap: 20px;
      .plan {
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        p {
          font-size: 1.2rem;
          font-weight: bold;
        }
        a {
          display: block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          background-color: var(--color-primary);
          color: white;
          text-align: center;
          text-decoration: none;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
