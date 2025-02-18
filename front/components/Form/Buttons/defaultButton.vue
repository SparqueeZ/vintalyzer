<template>
  <div
    class="button-container"
    :class="{
      disabled,
      invalid,
      privateInvalid,
      cta,
      small,
      loading,
      fit,
      smallIcon,
      iconOnly,
    }"
    @click="disabled ? null : $emit('click')"
  >
    <nuxt-link to="" v-if="link">
      <button>{{ text }}</button>
    </nuxt-link>
    <customButton v-else :parentProps="props">
      <div v-if="iconLeft" class="icon-container">
        <Icon :name="iconLeft" />
      </div>
      {{ text }}
      <div v-if="iconRight" class="icon-container">
        <Icon :name="iconRight" />
      </div>
    </customButton>
  </div>
</template>

<script setup lang="ts">
import customButton from "~/components/Form/Buttons/customButton.vue";
import Icon from "~/components/Icon.vue";
const props = defineProps({
  text: String,
  type: String,
  link: String,
  onClick: Function,
  iconOnly: Boolean,
  icon: String,
  iconLeft: String,
  iconRight: String,
  cta: Boolean,
  invalid: Boolean,
  disabled: Boolean,
  small: Boolean,
  smallText: Boolean,
  smallIcon: Boolean,
  clear: Boolean,
  hoverPrimary: Boolean,
  fit: Boolean,
  loading: Boolean,
});

const emit = defineEmits(["click"]);

const privateInvalid = ref(false);
</script>

<style scoped lang="scss">
@keyframes spinning {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.button-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  gap: 6px;
  &.fit {
    width: fit-content;
  }

  .icon-container {
    .icon {
      display: flex;
      width: 20px;
      height: 20px;
      stroke: var(--color-text);
      fill: none;
    }
    &.loading {
      animation: spinning 1s linear infinite;
    }
  }
  &.loading {
    .icon-container {
      animation: spinning 1s linear infinite;
    }
  }
  &.small {
    padding: 4px;
  }
  &.smallIcon {
    .icon-container {
      .icon {
        width: 18px;
        height: 18px;
      }
    }
  }
}
</style>
