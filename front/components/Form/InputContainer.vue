<template>
  <div class="input-container" :class="{ disabled }">
    <label for="input" class="input-label">{{ label }}</label>
    <div
      class="input shadow-sm"
      :class="invalid || errorMessage ? 'invalid' : ''"
    >
      <div class="icon-slot">
        <Icon v-if="icon" :name="icon" />
      </div>
      <slot />
      <slot name="events" />

      <div class="icon-slot">
        <transition name="fade">
          <Icon
            class="clearBtn"
            v-if="clearBtn"
            name="cancel01"
            @click="$emit('clear')"
          />
        </transition>
      </div>
    </div>
    <div class="input-messages">
      <div class="important-messages">
        <p v-if="!errorMessage" class="hint">{{ hint }}</p>
        <div class="errorMessage">
          <Icon v-if="errorIcon" :name="errorIcon" />
          <p class="error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from "vue";
const props = defineProps<{
  icon?: string;
  label?: string;
  invalid?: boolean;
  hint?: string;
  errorMessage?: string;
  errorIcon?: string;
  disabled?: boolean;
  clearBtn?: boolean;
  maxChars?: number | string;
  value?: string;
}>();

const inputValue = ref(props.value || "");
</script>

<style scoped lang="scss">
.input-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  max-width: 350px;
  gap: 6px;
  .input-label {
    font-size: 0.9rem;
    color: var(--color-text);
    cursor: text;
  }
  .input {
    display: flex;
    gap: 8px;
    padding: 0 14px;
    background-color: var(--color-bg);
    border-radius: 7px;
    border: 1px solid var(--color-border);
    transition: 0.3s ease border-color, 0.3s ease box-shadow;
    overflow: hidden;
    .icon-slot {
      display: flex;
      align-items: center;
      gap: 8px;
      max-height: 46px;
    }
    .icon {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--color-text-secondary);
      transition: opacity 0.1s ease-out, transform 0.2s ease-out,
        stroke 0.2s ease-out;
      cursor: pointer;

      &.clearBtn {
        &:hover {
          stroke: var(--color-text);
        }
      }

      &.fade-enter-from,
      &.fade-leave-to {
        opacity: 0;
        transform: translateX(35px);
      }
    }
    &:focus-within {
      box-shadow: 0 0 1px 3px var(--color-shadow-accent);
      border: 1px solid var(--color-accent);
    }
    &:hover {
      box-shadow: 0 0 1px 3px var(--color-shadow-accent);
      border: 1px solid var(--color-accent);
    }
    &.invalid {
      // box-shadow: 0 0 1px 3px var(--color-shadow-error);
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
  }
  .hint {
    font-size: 0.775rem;
    letter-spacing: 0.2px;
    color: var(--color-text-subtitle);
  }
  .errorMessage {
    display: flex;
    align-items: center;
    gap: 8px;
    .icon {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: var(--color-text-error);
    }
    .error {
      font-size: 1rem;
      color: var(--color-text-error);
    }
  }
  &.disabled {
    .input {
      background-color: var(--color-secondary-bg);
    }
    pointer-events: none;
    // opacity: 0.8;
  }
}
</style>
