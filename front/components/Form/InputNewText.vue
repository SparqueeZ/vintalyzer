<template>
  <div class="input-container" :class="{ disabled }">
    <label for="input" class="input-label">{{ label }}</label>
    <div
      class="input shadow-sm"
      :class="invalid || errorMessage ? 'invalid' : ''"
    >
      <div v-if="icon" class="icon-slot">
        <Icon :name="icon" />
      </div>
      <input
        class="text"
        :type="type"
        v-model="inputValue"
        :placeholder="placeholder"
        @input="handleInput"
      />

      <slot name="events" />
      <transition name="fade">
        <Icon
          class="clearBtn"
          v-if="clearBtn"
          name="cancel01"
          @click="$emit('clear')"
        />
      </transition>
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

      <p
        v-if="maxChars"
        class="informations-mesages input-information"
        :class="shakeMaxCharsVar ? 'shake' : ''"
      >
        {{ inputValue.length }} / {{ maxChars?.toString() }}
      </p>
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
  maxChars?: number;
  value?: string;
  placeholder?: string;
  type?: string;
}>();

const inputValue = ref(props.value || "");
const shakeMaxCharsVar = ref(false);

const handleInput = () => {
  if (props.disabled) {
    inputValue.value = "";
    return;
  }
};

const shakeMaxChars = () => {
  shakeMaxCharsVar.value = true;
  setTimeout(() => {
    shakeMaxCharsVar.value = false;
  }, 500);
};

watch(inputValue, (newValue) => {
  if (props.maxChars && newValue.length > props.maxChars) {
    shakeMaxChars();
    inputValue.value = newValue.slice(0, props.maxChars);
  }
});
</script>

<style scoped lang="scss">
@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  50% {
    transform: translateX(2.5px);
  }
  75% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(0);
  }
}

.input-container {
  display: flex;
  flex-direction: column;
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
    transition: 0.3s ease border-color, 0.3s ease box-shadow,
      0.3s ease background-color;
    overflow: hidden;
    .icon-slot {
      display: flex;
      align-items: center;
      gap: 8px;
      max-height: 46px;

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
      }
      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px var(--color-bg) inset;
        -webkit-text-fill-color: var(--color-text);
        transition: background-color 5000s ease-in-out 0s;
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

  .input-messages {
    display: flex;
    justify-content: space-between;
    width: 100%;
    .important-messages {
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
      width: 80%;
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
        animation: shake 0.5s 1 ease-out;
      }
    }
  }
}
</style>
