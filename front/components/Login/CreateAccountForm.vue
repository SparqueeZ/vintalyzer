<template>
  <section class="create-account-form-container">
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
      <form @submit.prevent="emits('register')">
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
        <DefaultButton text="S'enregistrer" cta />
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

const lastname = ref<string>("");
const firstname = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const confirmPassword = ref<string>("");
const acceptConditions = ref<boolean>(false);

const emits = defineEmits(["changeForm", "register"]);

const register = () => {
  console.log("register");
};
</script>

<style scoped lang="scss">
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
</style>
