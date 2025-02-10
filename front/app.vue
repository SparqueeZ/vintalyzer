<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/UserStore";

const userStore = useUserStore();
await userStore.fetchUser();
</script>
