<template>
  <div class="main-page">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const userStore = useUserStore();
const router = useRouter();

const loadUser = async () => {
  try {
    const response = await userStore.fetchUser();
  } catch (error) {}
};

onMounted(async () => {
  await loadUser();
});
</script>

<style scoped lang="scss">
.main-page {
  transition: background-color 0.2s ease-in-out;
  background-color: var(--color-bg);
}
</style>
