<template>
  <section class="sidebar-inset" :class="rounded ? 'rounded' : ''">
    <slot />
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  rounded?: boolean;
}>();
</script>

<style scoped lang="scss">
.sidebar-inset {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  &.rounded {
    border-radius: 10px;
  }
}
</style>
