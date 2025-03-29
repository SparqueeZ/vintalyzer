<template>
  <section class="profile-informations-wrapper">
    <div class="title-wrapper">
      <p class="title">Informations personnelles</p>
      <!-- <div class="status-wrapper up-to-date">
        <span class="status-indicator"></span>
        <p class="status-name">A jour</p>
      </div> -->
      <DefaultButton text="Enregistrer" iconLeft="checkCircle01" fit />
    </div>
    <Spacer :height="32" />
    <!-- <div class="profil-informations">
      <div class="names-wrapper">
        <InputNewText
          label="Prénom"
          :value="userStore.user.firstname"
          full-size
        />
        <InputNewText label="Nom" :value="userStore.user.lastname" full-size />
      </div>
      <InputEmail
        label="Adresse mail"
        :value="userStore.user.email"
        full-size
      />
    </div> -->
    <div class="profile-informations">
      <div class="information">
        <p class="label">Nom</p>
        <p class="value">{{ userStore.user.lastname }}</p>
      </div>
      <div class="information">
        <p class="label">Prénom</p>
        <p class="value">{{ userStore.user.firstname }}</p>
      </div>
      <div class="information">
        <p class="label">Adresse mail</p>
        <p class="value">{{ userStore.user.email }}</p>
      </div>
      <div class="information">
        <p class="label">Numéro de téléphone</p>
        <p class="value">Non défini.</p>
      </div>
      <div class="information">
        <p class="label">Biographie</p>
        <p class="value">Non définie.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const userStore = useUserStore();
import DefaultButton from "../Form/Buttons/defaultButton.vue";
import InputEmail from "../Form/InputEmail.vue";
import InputNewText from "../Form/InputNewText.vue";
</script>

<style scoped lang="scss">
.profile-informations-wrapper {
  width: 100%;
  gap: 100px;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 32px;
  .title-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      font-size: 1.3rem;
      font-weight: 600;
    }
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

      &.up-to-date {
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
  .profile-informations {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 0;
    // .names-wrapper {
    //   display: flex;
    //   justify-content: space-between;
    //   .input-container {
    //     width: 48%;
    //   }
    // }
    .information {
      width: 48%;
      justify-content: space-between;
      .label {
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text-subtitle);
      }
      .value {
        font-size: 1rem;
        font-weight: 400;
        color: var(--color-text-primary);
      }
    }
  }
}
</style>
