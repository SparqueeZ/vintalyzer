<template>
  <section class="login-container">
    <div class="form-container">
      <header>
        <nuxt-link class="logo" to="/">
          <h1>STUD.I</h1>
        </nuxt-link>
      </header>
      <div class="form">
        <h2 class="welcome-title">Heureux de vous revoir !</h2>

        <form class="" @submit.prevent="login">
          <InputEmail
            label="Email"
            icon="mail01"
            v-model:modelValue="email"
            :value="email"
            placeholder="john.doe@gmail.com"
          />
          <InputPassword
            label="Password"
            icon="lock01"
            :value="password"
            v-model:modelValue="password"
            placeholder="Mot de passe"
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>

    <div class="image-container"></div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import InputEmail from "~/components/Form/InputEmail.vue";
import InputPassword from "~/components/Form/InputPassword.vue";

const userStore = useUserStore();
const router = useRouter();

const email = ref<string>("baptiste.dijouxn8@gmail.com");
const password = ref<string>("testo");

const login = () => {
  userStore.login(email.value, password.value);
};

watch(
  () => userStore.user,
  (newUser) => {
    if (newUser && Object.keys(newUser).length > 0) {
      // console.log("redirection");
      router.push("/app");
    }
  }
);

definePageMeta({
  layout: "no-header",
  middleware: "light-theme",
});
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100svh;
  background: linear-gradient(
    to right,
    #14172f,
    #131529,
    #111322,
    #10111c,
    #0d0e16
  );
  background-attachment: fixed;
  padding: 40px;
  gap: 3rem;
  .form-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 40%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;

    header {
      display: flex;
      align-items: start;
      justify-content: center;
      width: 100%;
      .logo {
        width: 100%;
        font-size: 2rem;
        color: var(--color-text);
        font-weight: bold;
      }
    }

    .form {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      width: 100%;
      height: 100%;
      .welcome-title {
        font-size: clamp(50px, 5vw, 100px);
        color: var(--color-text);
        font-weight: bold;
        text-align: center;
      }
      form {
        display: flex;
        width: 100%;
        align-items: center;
        flex-direction: column;
        button {
          padding: 10px;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          &:hover {
            background-color: var(--color-primary-dark);
          }
        }
      }
    }
  }
  .image-container {
    width: 60%;
    height: 100%;
    background-image: url("../../assets/images/osint.png");
    background-size: cover;
    background-position: center;
    border-radius: 3rem;
  }
}
</style>
