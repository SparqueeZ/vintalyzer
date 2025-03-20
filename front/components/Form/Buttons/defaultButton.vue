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
      transparent,
      green,
      orange,
      red,
    }"
    @click="handleClick"
  >
    <div v-if="tooltip" class="tooltip-wrapper">
      <p class="tooltip">{{ tooltip }}</p>
    </div>
    <nuxt-link :to="link && !disabled" v-if="link">
      <customButton :parentProps="props">
        <div v-if="iconLeft" class="icon-container">
          <Icon :name="iconLeft" />
        </div>
        {{ text }}
        <div v-if="iconRight" class="icon-container">
          <Icon :name="iconRight" />
        </div>
      </customButton>
    </nuxt-link>
    <a
      v-if="linkBlank && !disabled"
      :href="linkBlank"
      target="_blank"
      rel="noopener noreferrer"
    >
      <customButton :parentProps="props">
        <div v-if="iconLeft" class="icon-container">
          <Icon :name="iconLeft" />
        </div>
        {{ text }}
        <div v-if="iconRight" class="icon-container">
          <Icon :name="iconRight" />
        </div>
      </customButton>
    </a>
    <customButton v-if="!link && !linkBlank && !disabled" :parentProps="props">
      <div v-if="iconLeft" class="icon-container">
        <Icon :name="iconLeft" />
      </div>
      {{ text }}
      <div v-if="iconRight" class="icon-container">
        <Icon :name="iconRight" />
      </div>
    </customButton>
    <customButton v-if="disabled" :parentProps="props">
      <div v-if="iconLeft" class="icon-container">
        <Icon :name="iconLeft" />
      </div>
      {{ text }}
      <div v-if="iconRight" class="icon-container">
        <Icon :name="iconRight" />
      </div>
    </customButton>
  </div>
  <slot name="events" />
</template>

<script setup lang="ts">
import customButton from "~/components/Form/Buttons/customButton.vue";
import Icon from "~/components/Icon.vue";
const props = defineProps({
  text: String,
  type: String,
  link: String,
  linkBlank: String,
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
  transparent: Boolean,
  reverseTextColors: Boolean,
  tooltip: String,
  green: Boolean,
  red: Boolean,
  orange: Boolean,
});

const emit = defineEmits(["click"]);

const privateInvalid = ref(false);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit("click", event);
  }
};
</script>

<style scoped lang="scss">
@keyframes spinning {
  0% {
    transform: rotate(0deg);
  }
  30% {
    transform: rotate(40deg);
  }
  70% {
    transform: rotate(320deg);
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
  position: relative;
  align-items: center;
  &.fit {
    width: fit-content;
  }
  &:hover {
    cursor: pointer;
    .tooltip-wrapper {
      visibility: visible;
      opacity: 100%;
    }
  }

  .tooltip-wrapper {
    display: block;
    visibility: hidden;
    justify-content: center;
    top: -35px;
    width: fit-content;
    position: absolute;
    padding: 2px 8px;
    border-radius: 0.5rem;
    background-color: var(--color-secondary-bg);
    opacity: 0;
    transition: opacity 0.3s ease-out;
    .tooltip {
      color: var(--color-text);
      border-radius: 0.5rem;
      z-index: 10000;
      text-wrap: nowrap;
    }
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
      animation: spinning 0.5s linear infinite;
    }
  }
  &.loading {
    .icon-container {
      animation: spinning 0.5s linear infinite;
    }
  }

  &.smallIcon {
    .icon-container {
      .icon {
        width: 18px;
        height: 18px;
      }
    }
  }
  &.cta {
    .icon {
      stroke: var(--color-btn-primary-text);
    }
  }
}
</style>
