<template>
  <div class="logo">
    <div class="logo-container">
      <!-- <img src="~/assets/logo.png" alt="NuxtCourse" /> -->
    </div>
    <p class="logo-title">Vintalyze</p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.logo {
  display: flex;
  gap: 20px;
  align-items: center;
  overflow: hidden;
  transition: all 0.3s ease;
  transition: background-color 0.3s ease-out color 0.3s ease-out;

  .sidebar.closed & {
    .logo-title {
      opacity: 0;
      transform: translateX(-100%);
    }
  }

  .logo-container {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: var(--color-text);
    transition: background-color 0.3s ease-out color 0.3s ease-out;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }

  .logo-title {
    color: var(--color-text);
    font-size: 1.5rem;
    font-weight: bold;
    white-space: nowrap;
    flex-shrink: 1;
    transition: all 0.2s ease;
    transition: background-color 0.3s ease-out color 0.3s ease-out;
  }
}
</style>
