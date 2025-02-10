<template>
  <aside
    v-bind="sidebar"
    class="sidebar"
    :class="hoverOpen || open ? '' : 'closed'"
    @mouseover="openSidebar"
    @mouseout="closeSidebar"
  >
    <button
      v-if="buttonOpen"
      :class="{ show: hoverOpen || showButton }"
      @click="toggleSidebar()"
    >
      <Icon
        name="rightArrowCircle"
        :class="open ? 'rightArrowCircle' : 'leftArrowCircle'"
      />
    </button>
    <slot></slot>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Icon from "../Icon.vue";

const props = defineProps({
  hoverOpen: Boolean,
  buttonOpen: Boolean,
  open: Boolean,
});

const open = ref(false);
const sidebar = ref();
const showButton = ref(false);
let hideButtonTimeout: ReturnType<typeof setTimeout>;

const toggleSidebar = () => {
  const sidebar = document.querySelector(".sidebar");
  sidebar?.classList.toggle("closed");
  open.value = !open.value;
};

const openSidebar = () => {
  if (!props.open) {
    const sidebar = document.querySelector(".sidebar");
    if (props.hoverOpen && sidebar) {
      sidebar?.classList.remove("closed");
    }
    if (props.buttonOpen) {
      clearTimeout(hideButtonTimeout);
      showButton.value = true;
    }
  }
};

const closeSidebar = () => {
  if (!props.open) {
    const sidebar = document.querySelector(".sidebar");
    if (props.hoverOpen) {
      sidebar?.classList.add("closed");
    }
    if (props.buttonOpen) {
      hideButtonTimeout = setTimeout(() => {
        showButton.value = false;
      }, 500);
    }
  }
};
</script>

<style scoped lang="scss">
.sidebar {
  width: 250px;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
  z-index: 100;
  padding: 0 20px;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex-shrink: 0;
  background-color: var(--color-sidebar-bg);
  transition: width 0.15s ease-out, padding 0.15s ease-out;

  button {
    right: 0px;
    top: 50%;
    position: absolute;
    z-index: 99;
    color: var(--color-text);
    opacity: 0;
    transition: opacity 0.15s ease-out, right 0.15s ease-out;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      display: flex;
      width: 1.3rem;
      height: 1.3rem;
      fill: var(--color-bg);
      stroke: var(--color-text);
      transition: transform 0.3s ease-out, scale 0.15s ease-out;
      &.leftArrowCircle {
        transform: rotate(180deg);
      }
      &.rightArrowCircle {
        transform: rotate(0deg);
      }
    }
    &:hover {
      .icon {
        scale: 1.1;
      }
    }

    &.show {
      right: -50px;
      opacity: 1;
    }
  }

  &.closed {
    width: 60px;
    padding: 0 10px 0 10px;
  }
}
</style>
