<template>
  <div class="button-container" :class="{ disabled, invalid, privateInvalid }">
    <div
      class="toggle-switch"
      :class="{ checked: modelValue }"
      @click="toggle"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean,
  },
  invalid: Boolean,
  disabled: Boolean,
});

const emit = defineEmits(["update:modelValue"]);
const privateInvalid = ref(props.invalid || false);

const toggle = () => {
  emit("update:modelValue", !props.modelValue);
};
</script>

<style scoped lang="scss">
.toggle-switch {
  background: #ddd;
  border-radius: 0.75em;
  cursor: pointer;
  flex: none;
  height: 1.5em;
  position: relative;
  transition: background-color 150ms;
  width: 3em;
}

.toggle-switch::before {
  background-color: var(--color-bg);
  border-radius: 0.625em;
  content: "";
  display: block;
  height: 1.25em;
  left: 0.125em;
  position: absolute;
  top: 0.125em;
  transition: left 150ms;
  width: 1.25em;
  will-change: left;
}

.checked {
  background-color: var(--color-primary);
}

.checked::before {
  background-image: radial-gradient(
    circle at 0.375em 0.375em,
    rgba(0, 0, 0, 0) 0,
    rgba(0, 0, 0, 0.05) 1em
  );
  left: 1.625em;
}

.toggle-switch:hover {
}

.toggle-switch:hover::before {
}
</style>
