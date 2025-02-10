<template>
  <aside class="sidebar-floating">
    <section
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
        Toggle
      </button>
      <slot></slot>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  hoverOpen: Boolean,
  buttonOpen: Boolean,
  open: Boolean,
});

const sidebar = ref();
const showButton = ref(false);
let hideButtonTimeout: ReturnType<typeof setTimeout>;

const toggleSidebar = () => {
  if (!props.open) {
    const sidebar = document.querySelector(".sidebar");
    sidebar?.classList.toggle("closed");
  }
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

// Ensure sidebar is open if the open prop is true
watch(
  () => props.open,
  (newVal) => {
    const sidebar = document.querySelector(".sidebar");
    if (newVal) {
      sidebar?.classList.remove("closed");
    } else {
      sidebar?.classList.add("closed");
    }
  }
);
</script>

<style scoped lang="scss">
.sidebar-floating {
  padding: 10px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-bg);

  .sidebar {
    width: 250px;
    height: 100%;
    position: relative;
    top: 0;
    left: 0;
    z-index: 100;
    padding: 0 20px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    flex-shrink: 0;
    background-color: var(--color-sidebar-bg);
    border-radius: 10px;
    transition: width 0.15s ease-out, padding 0.15s ease-out;

    button {
      right: 0px;
      top: 50%;
      position: absolute;
      z-index: 99;
      color: var(--color-text);
      opacity: 0;
      transition: opacity 0.15s ease-out, right 0.15s ease-out;

      &.show {
        right: -70px;
        opacity: 1;
      }
    }

    &.closed {
      width: 60px;
      padding: 0 10px;
    }
  }
}
</style>
