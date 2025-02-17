<template>
  <div class="spacer" :style="`height: ${height}px`"></div>
</template>

<script setup lang="ts">
const props = defineProps<{
  height?: number;
}>();
</script>

<style scoped></style>
