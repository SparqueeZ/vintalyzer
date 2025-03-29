<template>
  <section class="subscription-details-wrapper">
    <div class="name-wrapper">
      <p v-if="userStore.user.Subscription" class="name">
        Abonnement
        <span class="bold">
          {{ userStore.user.Subscription.name }}
        </span>
      </p>
      <p class="expiration" v-if="userStore.user.Subscription">
        Expire le
        <span class="primary">
          {{
            new Date(userStore.user.Subscription.endDate).toLocaleDateString(
              "fr-FR",
              dateOptions
            )
          }}
        </span>
      </p>
      <p v-else class="name">Aucun abonnement</p>
    </div>
    <div class="button-wrapper">
      <defaultButton
        text="Rafraichir"
        iconLeft="refresh01"
        fit
        :loading="subscriptionStore.loading"
        :disabled="subscriptionStore.loading"
        @click="reloadSubscriptions()"
        transparent
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import defaultButton from "../Form/Buttons/defaultButton.vue";
const subscriptionStore = useSubscriptionStore();
const userStore = useUserStore();
import Subscription from "../Dashboard/Subscription.vue";

const dateOptions = {
  year: "numeric" as "numeric",
  month: "numeric" as "numeric",
  day: "numeric" as "numeric",
  hour: "numeric" as "numeric",
  minute: "numeric" as "numeric",
};

const reloadSubscriptions = async () => {
  try {
    await subscriptionStore.fetchUserSubscriptionHistory();
    const response = await subscriptionStore.fetchUserSubscription();
    if (response) {
      userStore.setSubscription(response.data);
    }
  } catch (error) {}
};
</script>

<style scoped lang="scss">
.subscription-details-wrapper {
  padding: 16px;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .name-wrapper {
    display: flex;
    flex-direction: column;
    .name {
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--color-text-primary);
    }
    .expiration {
      font-size: 1rem;
      font-weight: 400;
      color: var(--color-text-subtitle);
    }
  }
}
</style>
