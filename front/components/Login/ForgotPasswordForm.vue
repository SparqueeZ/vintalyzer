<template>
  <section class="forgot-password-form-container">
    <div class="title-wrapper">
      <h1 class="title">Mot de passe oublié</h1>
      <p class="subtitle">
        Vous avez retrouver votre mot de passe ?
        <span class="text-link" @click="userStore.changeLoginPage('login')">
          Se connecter
        </span>
      </p>
    </div>

    <div class="form-wrapper">
      <form @submit.prevent="resetPassword">
        <InputEmail
          icon="mail01"
          v-model:modelValue="email"
          :value="email"
          placeholder="Email"
          fullSize
        />

        <Spacer :height="50" />
        <p class="errorMessage">{{ userStore.error }}</p>
        <DefaultButton
          type="submit"
          :text="userStore.loading ? 'Connexion...' : 'Connexion'"
          cta
          :disabled="userStore.loading"
        />
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import InputEmail from "~/components/Form/InputEmail.vue";
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";
const userStore = useUserStore();

const email = ref<string>(userStore.loginPageEmail);

const resetPassword = async () => {
  console.log("resetPassword");
  //   await userStore.resetPassword(email.value);
};
</script>

<style scoped lang="scss">
.text-link {
  cursor: pointer;
  color: var(--color-text-subtitle);
  text-decoration: underline;
  transition: 0.3s ease color;
  text-align: right;
  &:hover {
    color: var(--color-text);
  }
  &.small {
    font-size: 0.8rem;
  }
}
.forgot-password-form-container {
  height: 100%;
  color: var(--color-text);
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 10%;
  .title-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 600px;
    gap: 10px;

    .title {
      font-size: 5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      line-height: 5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .subtitle {
      font-size: 0.8rem;
      color: var(--color-text-subtitle);
    }
  }
  .form-wrapper {
    display: flex;
    justify-content: center;
    form {
      width: 100%;
      max-width: 600px;
      .names {
        display: flex;
        gap: 1rem;
      }
    }
  }
}
</style>
