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
    <fixedContext
      :menu="menuOptions"
      :target-element="selectedButton"
      @option-selected="handleOptionSelected"
      :is-visible="isVisible"
      @close-menu="emit('close-menu')"
      :class="position"
      :current-order="currentOrder"
    />
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
import fixedContext from "~/components/ContextMenu/fixedContext.vue";
import customButton from "~/components/Form/Buttons/customButton.vue";
import Icon from "~/components/Icon.vue";

export interface MenuOption {
  icon: string | ((order: any) => string);
  label: string | ((order: any) => string);
  action?: () => void | ((order: any) => void);
  children?: MenuOption[];
  category: string;
  color?: string;
}

export interface MenuCategory {
  category: string;
  categoryIcon: string;
  options: MenuOption[];
}

const props = withDefaults(
  defineProps<{
    text?: string;
    type?: string;
    link?: string;
    linkBlank?: string;
    onClick?: () => void;
    iconOnly?: boolean;
    icon?: string;
    iconLeft?: string;
    iconRight?: string;
    cta?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    small?: boolean;
    smallText?: boolean;
    smallIcon?: boolean;
    clear?: boolean;
    hoverPrimary?: boolean;
    fit?: boolean;
    loading?: boolean;
    transparent?: boolean;
    reverseTextColors?: boolean;
    tooltip?: string;
    green?: boolean;
    red?: boolean;
    orange?: boolean;
    menuOptions: MenuCategory[];
    selectedButton?: HTMLElement | null;
    isVisible?: boolean;
    position?: string;
    currentOrder?: any;
  }>(),
  {
    isVisible: false,
    position: "bottom",
    currentOrder: null,
  }
);

const emit = defineEmits(["click", "close-menu", "option-selected"]);

const privateInvalid = ref(false);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit("click", event);
  }
};

const handleOptionSelected = (option: any) => {
  console.log("option selected", option);
  emit("close-menu");
  emit("option-selected", option);
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
  .context-menu {
    position: absolute;
    top: 0;
    &.left {
      right: 105%;
    }
    &.right {
      left: 105%;
    }
  }
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
