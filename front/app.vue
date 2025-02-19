<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const userStore = useUserStore();

onMounted(async () => {
  await userStore.fetchUser();
});
</script>
