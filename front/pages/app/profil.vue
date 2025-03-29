<template>
  <section class="subscription-page-wrapper">
    <aside class="profile-navigation-wrapper">
      <div class="welcomeMessage">
        <h1 class="title">Gérez votre profil</h1>
      </div>

      <Spacer :height="32" />

      <nav class="profile-navigation">
        <ul class="navigation-list">
          <li
            v-for="nav in navigation"
            @click="navSelected = nav.title"
            class="navigation-item"
            :class="navSelected === nav.title ? 'active' : ''"
          >
            {{ nav.title }}
          </li>
        </ul>
      </nav>
    </aside>
    <div class="body-wrapper">
      <ProfileInformation v-if="navSelected === 'Informations personnelles'" />
    </div>
  </section>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const subscriptionStore = useSubscriptionStore();

const navSelected = ref("Informations personnelles");

const navigation = ref([
  {
    title: "Informations personnelles",
  },
  {
    title: "Récupération des commandes",
  },
  {
    title: "Arrêter l'abonnement",
  },
  {
    title: "Mes préférences",
  },
  {
    title: "Sécurité",
  },
]);

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
  display: flex;

  .profile-navigation-wrapper {
    width: 30%;
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

    .navigation-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      .navigation-item {
        cursor: pointer;
        border-radius: 0.5rem;
        color: var(--color-text-primary);
        transition: font-weight 0.1s ease-out;

        &:hover {
          font-weight: 700;
        }
        &.active {
          font-weight: 700;
        }
      }
    }
  }
  .body-wrapper {
    width: 70%;
  }
}
</style>
