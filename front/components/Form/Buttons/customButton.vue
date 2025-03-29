<template>
  <button
    class="button"
    :class="{
      cta: parentProps?.cta,
      disabled: parentProps?.disabled,
      invalid: parentProps?.invalid,
      active,
      small: parentProps?.small,
      smallText: parentProps?.smallText,
      clear: parentProps?.clear,
      hoverPrimary: parentProps?.hoverPrimary,
      fit: parentProps?.fit,
      iconOnly: parentProps?.iconOnly,
      reverseColor: parentProps?.reverseColor,
      transparent: parentProps?.transparent,
      reverseTextColors: parentProps?.reverseTextColors,
      green: parentProps?.green,
      orange: parentProps?.orange,
      red: parentProps?.red,
    }"
    :type="parentProps?.type"
    @click="parentProps?.disabled ? null : $emit('click')"
  >
    <slot></slot>
    <slot name="events" />
  </button>
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
  &.fit {
    width: fit-content;
  }
  &:hover {
    border: 1px solid var(--color-border);
    background-color: var(--color-border);
  }
  &.hoverPrimary {
    &:hover {
      background-color: var(--color-primary);
      color: var(--color-btn-primary-text);
    }
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
      background-color: var(--color-btn-disabled-bg);
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
    background-color: var(--color-border);
    &.reverseColor {
      background-color: var(--color-bg);
    }
  }
  &.reverseColor {
    background-color: transparent;
    border-color: transparent;

    &:hover {
      background-color: var(--color-bg);
    }
  }
  &.small {
    padding: 5px 7px;
    max-height: 30px;
  }
  &.smallText {
    font-size: 0.875rem;
  }
  &.clear {
    background-color: transparent;
    color: var(--color-text);
    border: 1px solid transparent;
    transition: transform 0.2s ease-out, translate 0.2s ease-out;
    padding: 0;
    &:hover {
      background-color: var(--color-btn-clear-bg);
      color: var(--color-btn-clear-text);
      translate: 5px 1px;
    }
  }
  &.transparent {
    background-color: transparent;
    &.disabled {
      background-color: var(--color-btn-disabled-bg);
    }
    &.cta {
      background-color: var(--color-primary);
      color: var(--color-btn-primary-text);
      &:hover {
        background-color: var(--color-primary-hover);
      }
    }
    &:hover {
      border: 1px solid var(--color-border);
      background-color: var(--color-border);
    }
  }
  &.green {
    background-color: var(--color-green);
    color: var(--color-primary-text);
    border-color: var(--color-green);
  }
  &.orange {
    background-color: var(--color-orange);
    color: var(--color-primary-text);
    border-color: var(--color-orange);
  }
  &.red {
    background-color: var(--color-red);
    color: var(--color-primary-text);
    border-color: var(--color-red);
  }
  &.reverseTextColors {
    color: var(--color-btn-primary-bg);
  }
  &.iconOnly {
    padding: 4px;
  }
}
</style>
