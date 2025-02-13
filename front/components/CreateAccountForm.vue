<template>
  <section class="create-account-form-container">
    <h1 class="title">Créer un compte</h1>
    <p>Vous avez déjà un compte ? Connectez-vous.</p>

    <form @submit.prevent="register">
      <InputText
        label="Nom"
        icon="user"
        v-model:modelValue="lastname"
        :value="lastname"
        placeholder="Nom"
      />
      <InputText
        label="Prénom"
        icon="user"
        v-model:modelValue="firstname"
        :value="firstname"
        placeholder="Prénom"
      />
      <InputEmail
        label="Email"
        icon="mail01"
        v-model:modelValue="email"
        :value="email"
        placeholder="Email"
      />

      <InputPassword
        icon="lock01"
        v-model:modelValue="password"
        :value="password"
        placeholder="Entrez votre mot de passe"
      />

      <InputPassword
        icon="lock01"
        v-model:modelValue="confirmPassword"
        :value="confirmPassword"
        placeholder="Confirmez votre mot de passe"
      />
      <CheckBox v-model:modelValue="acceptConditions" :value="acceptConditions">
        J'accepte les
        <nuxt-link to="/conditions-dutilisation"
          >conditions d'utilisation</nuxt-link
        >
      </CheckBox>
      <DefaultButton text="S'enregistrer" cta />
    </form>
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

const register = () => {
  console.log("register");
};
</script>

<style scoped lang="scss">
.create-account-form-container {
  height: 100%;
  color: var(--color-text);
  .title {
    font-size: 6rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  form {
    max-width: 350px;
  }
}
</style>
