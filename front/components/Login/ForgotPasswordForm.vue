<template>
  <section class="forgot-password-form-container">
    <div class="back-button">
      <DefaultButton
        type="submit"
        text="Retour à la page de connexion"
        cta
        clear
        :disabled="userStore.loading"
        iconLeft="backArrow"
        @click="userStore.changeLoginPage('login')"
      />
    </div>

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
      <form
        @submit.prevent="
          route.query.token ? sendResetPassword() : sendResetPasswordEmail()
        "
      >
        <InputEmail
          v-if="!route.query.token"
          icon="mail01"
          v-model:modelValue="email"
          :value="email"
          placeholder="Email"
          fullSize
        />

        <InputPassword
          v-if="route.query.token"
          icon="lock01"
          v-model:modelValue="password"
          :value="password"
          placeholder="Entrez votre mot de passe"
          fullSize
        />

        <InputPassword
          v-if="route.query.token"
          icon="lock01"
          v-model:modelValue="confirmPassword"
          :value="confirmPassword"
          placeholder="Confirmez votre mot de passe"
          fullSize
        />

        <Spacer :height="50" />
        <p class="errorMessage">{{ errorMessage }}</p>
        <DefaultButton
          type="submit"
          :text="
            loading
              ? 'Envoi en cours...'
              : route.query.token
              ? 'Réinitialiser le mot de passe'
              : 'Envoyer la demande de réinitialisation'
          "
          :cta="true"
          :disabled="loading"
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
const loading = ref<boolean>(false);

// Get the reset password token from the URL
const route = useRoute();
const resetPasswordToken = ref<string>(route.query.token as string);

console.log("resetPasswordToken", resetPasswordToken.value);

const password = ref<string>("");
const confirmPassword = ref<string>("");
const errorMessage = ref<string>("");

const sendResetPasswordEmail = async () => {
  loading.value = true;
  errorMessage.value = "";

  if (!email.value) {
    errorMessage.value = "Veuillez entrer votre adresse email.";
    loading.value = false;
    return;
  }

  try {
    const response = await userStore.requestPasswordReset(email.value);
    if (response.status === 200) {
      errorMessage.value = "Un email de réinitialisation a été envoyé.";
    } else {
      errorMessage.value =
        response.data?.message || "Une erreur s'est produite.";
    }
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message ||
      "Une erreur s'est produite lors de l'envoi.";
  } finally {
    loading.value = false;
  }
};

const sendResetPassword = async () => {
  loading.value = true;
  errorMessage.value = "";

  if (!password.value || !confirmPassword.value) {
    errorMessage.value = "Veuillez remplir tous les champs.";
    loading.value = false;
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas.";
    loading.value = false;
    return;
  }

  // if (password.value.length < 6) {
  //   errorMessage.value = "Le mot de passe doit contenir au moins 6 caractères.";
  //   loading.value = false;
  //   return;
  // }

  try {
    const response = await userStore.resetPassword(
      resetPasswordToken.value,
      password.value
    );
    if (typeof response === "string") {
      errorMessage.value = response;
    } else if (response?.data?.message) {
      errorMessage.value = response.data.message;
      if (response.status === 200) {
        // Redirection vers la page de connexion après 2 secondes
        setTimeout(() => {
          userStore.changeLoginPage("login");
        }, 2000);
      }
    }
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.error ||
      "Une erreur s'est produite lors de la réinitialisation.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  cursor: pointer;
  z-index: 100;
  .icon {
    width: 30px;
    height: 30px;
    stroke: var(--color-text);
  }
}
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
  position: relative;
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
