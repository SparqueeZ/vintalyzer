<template>
  <footer class="sidebar-inside-footer">
    <slot></slot>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped lanbg="scss">
.sidebar-inside-footer {
  padding: 14px 0;
  width: 100%;
  .item-text {
    color: red;
    text-wrap: nowrap;
    font-size: 0.875rem;
    transition: opacity 0.2s ease, visibility 0.2s ease;

    .sidebar.closed & {
      opacity: 0;
    }
    &:hover {
      background-color: var(--color-hover-bg);
      color: var(--color-hover-text);

      .icon {
        stroke: var(--color-hover-text);
        fill: none;
      }
    }
  }
}
</style>
