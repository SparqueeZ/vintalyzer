<template>
  <section class="sidebar-container" :class="{ padding: props.padding }">
    <slot></slot>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  padding?: boolean;
  bkgColor?: string;
}>();
</script>

<style scoped lang="scss">
.sidebar-container {
  width: 100%;
  height: 100svh;
  display: flex;
  align-items: center;
  background-color: var(--color-secondary-bg);
  &.padding {
    padding: 10px 10px 10px 0;
  }
}
</style>
