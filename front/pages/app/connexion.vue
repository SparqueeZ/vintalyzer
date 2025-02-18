<template>
  <section class="login-container">
    <Transition name="login">
      <section
        class="login-form-wrapper"
        v-if="userStore.loginPage === 'login'"
      >
        <LoginAccountForm />
      </section>
    </Transition>
    <section
      class="image-container"
      :class="userStore.loginPage === '' ? 'full' : ''"
    ></section>
    <transition name="register">
      <section
        class="register-form-wrapper"
        v-if="userStore.loginPage === 'register'"
      >
        <CreateAccountForm />
      </section>
    </transition>

    <transition name="register">
      <section
        class="password-forgot-form-wrapper"
        v-if="userStore.loginPage === 'forgotPassword'"
      >
        <ForgotPasswordForm />
      </section>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import LoginAccountForm from "~/components/Login/LoginAccountForm.vue";
import CreateAccountForm from "~/components/Login/CreateAccountForm.vue";
import ForgotPasswordForm from "~/components/Login/ForgotPasswordForm.vue";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
console.log(route.query.token);

onMounted(() => {
  userStore.loginPage = "login";
  if (route.query.token) {
    userStore.loginPage = "forgotPassword";
  }
});

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
  middleware: "dark-theme",
});
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100svh;
  overflow: hidden;

  background: rgb(2, 0, 36);
  background: linear-gradient(
    31deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(89, 37, 126, 1) 81%,
    rgba(109, 44, 157, 1) 94%,
    rgba(129, 48, 192, 1) 98%,
    rgba(157, 78, 221, 1) 100%
  );

  background-attachment: fixed;
  padding: 20px;
  gap: 3rem;
  label {
    color: var(--color-text);
  }
  .login-form-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 45%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;

    &.login-enter-active,
    &.login-leave-active {
      transition: width 0.2s ease-out, opacity 0.1s ease-out;
    }

    &.login-enter-from,
    &.login-leave-to {
      width: 0%;
      opacity: 0;
    }
  }

  .register-form-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 45%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;

    &.register-enter-active,
    &.register-leave-active {
      transition: width 0.2s ease-out, opacity 0.1s ease-out;
    }

    &.register-enter-from,
    &.register-leave-to {
      width: 0%;
      opacity: 0;
    }
  }

  .password-forgot-form-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 45%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;

    &.register-enter-active,
    &.register-leave-active {
      transition: width 0.2s ease-out, opacity 0.1s ease-out;
    }

    &.register-enter-from,
    &.register-leave-to {
      width: 0%;
      opacity: 0;
    }
  }
  .image-container {
    width: 50%;
    height: 100%;
    background-image: url("../../assets/images/login.jpg");
    // background-color: red;
    background-size: cover;
    background-position: center;
    border-radius: 10px;
    transition: width 0.2s ease-out;
    &.full {
      width: 70%;
    }
  }
  .form-wrapper {
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
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
</style>
