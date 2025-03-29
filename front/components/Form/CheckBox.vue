<template>
  <div class="checkbox-wrapper">
    <input
      id="c1-13"
      type="checkbox"
      :checked="checked"
      @change="toggleCheck"
    />
    <label for="c1-13">
      <slot></slot>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const props = defineProps<{
  modelValue: boolean;
}>();

const checked = ref(props.modelValue);

const toggleCheck = () => {
  checked.value = !checked.value;
  emits("update:modelValue", checked.value);
};

watch(
  () => props.modelValue,
  (newVal) => {
    checked.value = newVal;
  }
);
</script>

<style lang="scss" scoped>
.checkbox-wrapper {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 8px;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;

  &.checked {
    background-color: var(--color-primary);
  }

  &.animate-check {
    animation: check-animation 0.3s ease;
  }
}

@keyframes check-animation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@supports (-webkit-appearance: none) or (-moz-appearance: none) {
  .checkbox-wrapper {
    input[type="checkbox"] {
      --color-primary-inner: #fff;
      --focus: 2px rgba(39, 94, 254, 0.3);
      --border: var(--color-border);
      --background: #fff;
      --disabled: #f6f8ff;
      --disabled-inner: #e1e6f9;
      -webkit-appearance: none;
      -moz-appearance: none;
      height: 20px;
      outline: none;
      vertical-align: top;
      position: relative;
      margin: 0;
      border: 1px solid var(--bc, var(--color-border));
      background: var(--b, var(--color-background));
      transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;

      &:after {
        content: "";
        display: block;
        left: 0;
        top: 0;
        position: absolute;
        transition: transform var(--d-t, 0.3s) var(--d-t-e, ease),
          opacity var(--d-o, 0.2s);
      }

      &:checked {
        --b: var(--color-primary);
        --bc: var(--color-primary);
        --d-o: 0.3s;
        --d-t: 0.6s;
        --d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
      }

      &:disabled {
        --b: var(--disabled);
        cursor: not-allowed;
        opacity: 0.9;
      }

      &:disabled:checked {
        --b: var(--disabled-inner);
        --bc: var(--border);
      }

      &:disabled + label {
        cursor: not-allowed;
      }

      &:hover:not(:checked):not(:disabled) {
        --bc: var(--color-primary);
      }

      &:focus {
        box-shadow: 0 0 0 var(--focus);
      }

      &:not(.switch) {
        width: 21px;
        border-radius: 7px;

        &:after {
          opacity: var(--o, 0);
          width: 5px;
          height: 9px;
          border: 2px solid var(--color-primary-inner);
          border-top: 0;
          border-left: 0;
          left: 7px;
          top: 4px;
          transform: rotate(var(--r, 20deg));
        }

        &:checked {
          --o: 1;
          --r: 43deg;
        }
      }

      + label {
        display: inline-block;
        vertical-align: middle;
        font-size: 0.85rem;
        cursor: pointer;
        margin-left: 4px;
      }
    }

    * {
      box-sizing: inherit;

      &:before,
      &:after {
        box-sizing: inherit;
      }
    }
  }
}
</style>
