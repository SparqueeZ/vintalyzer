<template>
  <span class="icon" :name="name" v-html="iconHTML"></span>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { icons } from "@/assets/js/icons.js";

const { name } = defineProps(["name"]);
const iconHTML = computed(
  () => icons.find((icon) => icon.name === name)?.[name]
);
</script>

<style>
.icon {
  aspect-ratio: 1/1;
  transition: fill 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    flex-shrink: 0;
  }
}

.icon-hover:hover .icon {
  fill: url(#like-gradient);
}
</style>
