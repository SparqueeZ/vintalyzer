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

<style lang="scss">
@keyframes loading {
  to {
    background-position: left;
  }
}

.loading-text {
  width: 100%;
  height: 100%;
  min-height: 20px;
  border-radius: 0.5rem;
  background: linear-gradient(
      90deg,
      var(--color-bg-tertiary) 40%,
      #525877,
      var(--color-bg-tertiary) 70%
    )
    right / 300% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

.main-page {
  transition: background-color 0.2s ease-in-out;
  background-color: var(--color-bg);
}
</style>
