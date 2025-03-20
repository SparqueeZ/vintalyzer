<template>
  <article class="subscription-module-wrapper">
    <div class="title-wrapper">
      <div class="icon-wrapper">
        <Icon name="award"></Icon>
      </div>
      <p class="title">Abonnement</p>
    </div>
    <div v-if="userStore.user.Subscription" class="content-wrapper">
      <div class="plan-name-wrapper">
        <p class="plan-name">
          {{ userStore.user.Subscription?.name }}
        </p>
        <defaultButton
          small
          small-text
          small-icon
          icon-only
          icon-left="linkSquare01"
          fit
          link="/app/mon-abonnement"
        />
      </div>
      <p class="plan-end">
        {{ "Expire le " + endDate }}
      </p>
    </div>
    <div v-else class="content-wrapper no-subscription">
      <p>Aucun abonnement</p>
      <defaultButton
        text="Choisir un abonnement"
        small
        small-text
        small-icon
        icon-only
        transparent
        link="/app/mon-abonnement"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import defaultButton from "../Form/Buttons/defaultButton.vue";
const userStore = useUserStore();

const dateOptions = {
  year: "numeric" as "numeric",
  month: "numeric" as "numeric",
  day: "numeric" as "numeric",
  hour: "numeric" as "numeric",
  minute: "numeric" as "numeric",
};

const endDate = ref(
  new Date(userStore.user.Subscription?.endDate).toLocaleDateString(
    "fr-FR",
    dateOptions
  )
);
</script>

<style scoped lang="scss">
.subscription-module-wrapper {
  padding: 16px;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;
  width: fit-content;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .title-wrapper {
    display: flex;
    gap: 16px;
    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-bg-tertiary);
      height: 35px;
      width: 35px;
      border-radius: 5px;
      border: var(--color-border) solid 1px;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 25px;
        stroke: var(--color-primary);
        fill: none;
      }
    }
    .title {
      font-size: 1.3rem;
      font-weight: bold;
      color: var(--color-text);
    }
  }
  .content-wrapper {
    background-color: rgba(167, 139, 250, 0.1);
    border: 1px solid rgba(167, 139, 250, 0.6);
    padding: 8px 16px;
    border-radius: 0.3rem;
    .plan-name-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      .plan-name {
        font-size: 1.2rem;
        font-weight: bold;
      }
    }
    .plan-end {
      font-size: 0.8rem;
      color: var(--color-text-subtitle);
    }
    &.no-subscription {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: none;
      background-color: transparent;
      gap: 8px;
      p {
        font-size: 1rem;
        font-weight: bold;
        color: var(--color-text-subtitle);
        text-align: center;
      }
    }
  }
}
</style>
