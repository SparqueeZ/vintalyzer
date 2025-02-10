<template>
  <input class="text" :type="type" :value="value" :placeholder="placeholder" />
</template>

<script setup lang="ts">
const props = defineProps<{
  value?: string;
  placeholder?: string;
  type?: string;
}>();
</script>

<style scoped lang="scss">
.text {
  width: 100%;
  outline: none;
  color: var(--color-text);
  background-color: transparent;
  padding: 10px 0;
  &::placeholder {
    user-select: none;
  }
}
</style>
