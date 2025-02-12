<template>
  <div class="button-wrapper" :class="{ bordered }">
    <button class="button" @click="toggleTheme">
      <div class="icon-wrapper">
        <transition name="fade" mode="out-in">
          <Icon v-if="currentTheme === 'dark'" name="moon01" key="lightTheme" />
          <Icon v-else name="sun01" key="darkTheme" />
        </transition>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import Icon from "@/components/Icon.vue";
import { useTheme } from "~/composables/useTheme";
const { currentTheme, toggleTheme } = useTheme();
console.log(currentTheme.value);

const props = defineProps({
  bordered: Boolean,
});
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-out, transform 0.1s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}

.button-wrapper {
  transition: background-color 0.1s ease-out;
  background-color: var(--color-secondary-bg);
  border-radius: 5px;
  &:hover {
    background-color: var(--color-hover-bg);
    color: var(--color-hover-text);

    .icon {
      stroke: var(--color-hover-text);
      fill: none;
    }
  }
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    .icon-wrapper {
      overflow: hidden;
      .icon {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: var(--color-text);
      }
    }
  }
  &.bordered {
    border: 1px solid var(--color-border);
    background-color: var(--color-bg);
    &:hover {
      border: 1px solid var(--color-border);
      background-color: var(--color-border);
    }
  }
}
</style>
