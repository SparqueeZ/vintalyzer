<template>
  <div
    class="button"
    :class="{
      cta: parentProps?.cta,
      disabled: parentProps?.disabled,
      invalid: parentProps?.invalid,
      active,
    }"
    @click="parentProps?.disabled ? null : $emit('click')"
  >
    <slot></slot>
    <slot name="events" />
  </div>
</template>

<script setup lang="ts">
import Icon from "~/components/Icon.vue";
const props = defineProps({
  parentProps: Object,
  active: Boolean,
});
</script>

<style scoped lang="scss">
.button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-height: 40px;
  padding: 10px 20px;
  border-radius: 5px;
  border: 1px solid var(--color-border);
  background-color: var(--color-btn-primary-bg);
  cursor: pointer;
  transition: background-color 0.3s ease-out, border 0.3s ease-out,
    color 0.1s ease-out;
  user-select: none;
  &:hover {
    border: 1px solid transparent;
    background-color: var(--color-primary);
    color: var(--color-btn-primary-text);
  }
  &.cta {
    background-color: var(--color-primary);
    color: var(--color-btn-primary-text);
    &:hover {
      background-color: var(--color-primary-hover);
    }
  }
  &.disabled {
    cursor: not-allowed;
    background-color: var(--color-btn-disabled-bg);
    &:hover {
      border: 1px solid var(--color-border);
    }
  }
  &.invalid {
    border: 1px solid var(--color-border-error);

    &:focus-within {
      box-shadow: 0 0 1px 3px var(--color-shadow-error);
      border: 1px solid var(--color-border-error);
    }
    &:hover {
      box-shadow: 0 0 1px 3px var(--color-shadow-error);
      border: 1px solid var(--color-border-error);
    }
  }
  &.active {
    background-color: var(--color-primary);
    color: var(--color-btn-primary-text);
  }
}
</style>
