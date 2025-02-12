<template>
  <div class="input-container" :class="{ disabled }">
    <label for="input" class="input-label">{{ label }}</label>
    <div
      class="input shadow-sm"
      :class="invalid || errorMessage ? 'invalid' : ''"
    >
      <Icon v-if="icon" :name="icon" />
      <input
        class="text"
        :type="passwordVisible ? 'text' : 'password'"
        v-model="inputValue"
        :placeholder="placeholder"
        @input="handleInput"
      />
      <slot name="events" />
      <div class="icon-container">
        <transition-group name="test">
          <Icon
            v-if="passwordVisible"
            class="togglePassword"
            name="viewOff"
            @click="passwordVisible = !passwordVisible"
          />
          <Icon
            v-else
            class="togglePassword"
            name="view"
            @click="passwordVisible = !passwordVisible"
          />
        </transition-group>
      </div>
    </div>
    <div class="input-messages">
      <div class="important-messages">
        <transition-group name="fade">
          <p v-if="!errorMessage" class="important-message hint">{{ hint }}</p>
          <div v-else class="important-message errorMessage">
            <Icon v-if="errorIcon" :name="errorIcon" />
            <p class="error">{{ errorMessage }}</p>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, defineEmits } from "vue";
const props = defineProps<{
  icon?: string;
  label?: string;
  invalid?: boolean;
  hint?: string;
  errorMessage?: string;
  errorIcon?: string;
  disabled?: boolean;
  value?: string;
  placeholder?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const passwordVisible = ref(false);
const inputValue = ref(props.value || "");

const handleInput = () => {
  if (props.disabled) {
    inputValue.value = "";
    return;
  }
};

watch(inputValue, (newValue) => {
  emit("update:modelValue", newValue);
});
</script>

<style scoped lang="scss">
.input-container {
  display: flex;
  flex-direction: column;
  max-width: 350px;
  width: 100%;
  gap: 6px;
  .input-label {
    font-size: 0.9rem;
    color: var(--color-text);
    cursor: text;
  }
  .input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    background-color: var(--color-bg);
    border-radius: 7px;
    border: 1px solid var(--color-border);
    transition: 0.3s ease border-color, 0.3s ease box-shadow,
      0.3s ease background-color;
    overflow: hidden;

    .icon-container {
      display: flex;
      width: 20px;
      height: 20px;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
      .togglePassword {
        top: 0;
        right: 0;
        position: absolute;
        opacity: 1;
        &.test-enter-from,
        &.test-leave-to {
          opacity: 0;
          transform: translateX(10px);
        }
      }
    }
    .icon {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--color-text-secondary);
      transition: opacity 0.1s ease-out, transform 0.2s ease-out,
        stroke 0.2s ease-out;
      cursor: pointer;
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
    .text {
      width: 100%;
      outline: none;
      color: var(--color-text);
      background-color: transparent;
      padding: 10px 0;
      &::placeholder {
        user-select: none;
        font-weight: 300;
      }
      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px var(--color-bg) inset;
        -webkit-text-fill-color: var(--color-text);
        transition: background-color 5000s ease-in-out 0s;
      }
    }
  }

  &.disabled {
    .input {
      background-color: var(--color-secondary-bg);
    }
    pointer-events: none;
    // opacity: 0.8;
  }
  .input-messages {
    display: flex;
    justify-content: space-between;
    .important-messages {
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
      width: 100%;

      .important-message {
        &.fade-enter-active,
        &.fade-leave-active {
          transition: opacity 0.1s ease-out, transform 0.1s ease-out;
        }
        &.fade-enter-from,
        &.fade-leave-to {
          opacity: 0;
          transform: translateY(-10px);
        }
      }

      .hint {
        position: absolute;
        font-size: 0.775rem;
        letter-spacing: 0.2px;
        color: var(--color-text-subtitle);
      }

      .errorMessage {
        position: absolute;
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
    }
    .informations-mesages {
      display: flex;
      gap: 4px;
      color: var(--color-text-subtitle);
      font-size: 0.775rem;
      transition: color 0.1s ease-out;
      &.shake {
        color: var(--color-text-error);
        animation: shake 0.5s;
      }
    }
  }
}
</style>
