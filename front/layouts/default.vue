<template>
  <header class="shadow-sm bg-white">
    <nav class="container mx-auto py-4 flex justify-between items-center">
      <p class="font-bold">NuxtCourse</p>
      <ul class="flex gap-4">
        <li>
          <NuxtLink to="/">Home</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/about">About</NuxtLink>
        </li>
        <li v-if="userStore.user.firstname">
          <NuxtLink to="/app" class="btn">Dashboard</NuxtLink>
        </li>
        <li v-if="userStore.user.firstname">
          <NuxtLink to="/" class="btn" @click="logout">Logout</NuxtLink>
        </li>
        <li v-else>
          <NuxtLink to="/app/connexion" class="btn">Login</NuxtLink>
        </li>
      </ul>
    </nav>
  </header>

  <div class="container mx-auto p-4">
    <slot />
  </div>
</template>

<script setup>
import { useUserStore } from "../stores/UserStore";
const userStore = useUserStore();
const logout = () => {
  userStore.logout();
};
</script>

<style lang="scss" scoped>
.router-link-exact-active {
  font-weight: bold;
}
</style>
