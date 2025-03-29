<template>
  <section class="create-account-form-container">
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
      <h1 class="title">Créer un compte</h1>
      <p class="subtitle">
        Vous avez déjà un compte ?
        <span class="text-link" @click="userStore.changeLoginPage('login')">
          Connectez-vous.
        </span>
      </p>
    </div>

    <div class="form-wrapper">
      <form @submit.prevent="registerUser">
        <div class="names">
          <InputText
            icon="user"
            v-model:modelValue="lastname"
            :value="lastname"
            placeholder="Nom"
          />
          <InputText
            icon="user"
            v-model:modelValue="firstname"
            :value="firstname"
            placeholder="Prénom"
          />
        </div>

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

        <InputPassword
          icon="lock01"
          v-model:modelValue="confirmPassword"
          :value="confirmPassword"
          placeholder="Confirmez votre mot de passe"
          fullSize
        />

        <div v-if="formError" class="error-message">{{ formError }}</div>
        <div v-if="userStore.error" class="error-message">
          {{ userStore.error }}
        </div>

        <CheckBox
          v-model:modelValue="acceptConditions"
          :value="acceptConditions"
        >
          J'accepte les
          <nuxt-link class="text-link" to="/conditions-dutilisation"
            >conditions d'utilisation</nuxt-link
          >
        </CheckBox>
        <Spacer :height="50" />
        <DefaultButton
          text="S'enregistrer"
          cta
          :loading="userStore.loading"
          :disabled="userStore.loading"
          @click="registerUser"
        />
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import InputText from "~/components/Form/InputNewText.vue";
import InputEmail from "~/components/Form/InputEmail.vue";
import InputPassword from "~/components/Form/InputPassword.vue";
import CheckBox from "~/components/Form/CheckBox.vue";
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";
const userStore = useUserStore();

const lastname = ref<string>("dijoux");
const firstname = ref<string>("baptiste");
const email = ref<string>("baptiste.dijouxn20@gmail.com");
const password = ref<string>("test");
const confirmPassword = ref<string>("test");
const acceptConditions = ref<boolean>(true);
const formError = ref<string | null>(null);

const emits = defineEmits(["changeForm", "register"]);

const registerUser = async () => {
  formError.value = null;

  // Validate inputs
  if (!lastname.value || !firstname.value || !email.value || !password.value) {
    formError.value = "Veuillez remplir tous les champs obligatoires.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    formError.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  try {
    await userStore.register(
      email.value,
      password.value,
      lastname.value,
      firstname.value,
      "CLIENT", // Default role for new users
      acceptConditions.value
    );

    if (!userStore.error) {
      emits("register");
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    // Display network error message if there's a connection issue
    if (error.code === "ERR_NETWORK") {
      formError.value =
        "Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.";
    }
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
  color: var(--color-text-link);
  text-decoration: underline;
  transition: 0.3s ease color;
  &:hover {
    color: var(--color-text);
  }
}

.create-account-form-container {
  height: 100%;
  color: var(--color-text);
  display: flex;
  justify-content: center;
  flex-direction: column;
  position: relative;
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
      max-width: 600px;
      .names {
        display: flex;
        gap: 1rem;
      }
    }
  }
}
.error-message {
  color: #ff4d4d;
  margin: 10px 0;
  font-size: 0.9rem;
  text-align: center;
}
</style>
