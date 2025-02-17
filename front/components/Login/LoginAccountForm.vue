<template>
  <section class="login-account-form-container">
    <div class="title-wrapper">
      <h1 class="title">Connexion</h1>
      <p class="subtitle">
        Vous n'avez pas de compte ?
        <span class="text-link" @click="userStore.changeLoginPage('register')">
          <a> Créez un compte.</a>
        </span>
      </p>
    </div>

    <div class="form-wrapper">
      <form @submit.prevent="login">
        <InputEmail
          icon="mail01"
          v-model:modelValue="email"
          :value="email"
          placeholder="Email"
          fullSize
        />

        <InputPassword
          icon="lock01"
          v-model:modelValue="password"
          :value="password"
          placeholder="Entrez votre mot de passe"
          fullSize
        />
        <div class="text-link">
          <a class="text-link small" @click="handleForgotPassword"
            >Vous avez oublié votre mot de passe ?</a
          >
        </div>
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
import InputPassword from "~/components/Form/InputPassword.vue";
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";
const userStore = useUserStore();

const email = ref<string>(userStore.loginPageEmail);
const password = ref<string>("");

const login = () => {
  console.log("login");
  userStore.login(email.value, password.value);
};

const handleForgotPassword = () => {
  userStore.loginPageEmail = email.value;
  userStore.loginPage = "forgotPassword";
};
</script>

<style scoped lang="scss">
.text-link {
  text-align: right;
  a {
    cursor: pointer;
    color: var(--color-text-subtitle);
    text-decoration: underline;
    transition: 0.3s ease color;
  }
  &:hover a {
    color: var(--color-text);
  }
  &.small {
    font-size: 0.8rem;
  }
}
.login-account-form-container {
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
      line-height: 4rem;
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
