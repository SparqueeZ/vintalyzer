<template>
  <section class="sidebar-content">
    <div class="sidebar-menu" v-for="m in topMenus" :key="m.id">
      <p class="title">{{ m.title }}</p>
      <section class="menu-items">
        <NuxtLink
          class="item"
          v-for="i in m.items"
          :key="i.id"
          :to="i.to"
          @click="handleClick(i)"
        >
          <Icon :name="i.icon" />
          <p class="item-text">{{ i.title }}</p>
        </NuxtLink>
      </section>
    </div>
    <div class="sidebar-menu bottom" v-for="m in bottomMenus" :key="m.id">
      <p class="title">{{ m.title }}</p>
      <section class="menu-items">
        <NuxtLink
          class="item"
          v-for="i in m.items"
          :key="i.id"
          :to="i.to"
          @click.native="handleClick(i)"
        >
          <Icon :name="i.icon" />
          <p class="item-text">{{ i.title }}</p>
        </NuxtLink>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  menus: Menu[];
}>();

interface Menu {
  id: number;
  title: string;
  items: MenuItem[];
  position: string;
}

interface MenuItem {
  id: number;
  title: string;
  icon: string;
  to: string;
  access: boolean;
  func?: () => void;
}

const filteredMenus = computed(() => {
  return props.menus.filter((menu) => {
    if (menu.items) {
      menu.items = menu.items.filter((item) => item.access);
    }
    return menu.items.length > 0;
  });
});

const topMenus = computed(() =>
  filteredMenus.value.filter((menu) => menu.position !== "bottom")
);
const bottomMenus = computed(() =>
  filteredMenus.value.filter((menu) => menu.position === "bottom")
);

const handleClick = (item: MenuItem) => {
  if (item.func) {
    item.func();
  }
};
</script>

<style scoped lang="scss">
.sidebar-content {
  width: 100%;
  height: 100%;
  margin-top: 32px;
  overflow-y: auto;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  overflow: hidden;

  .sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .title {
      text-transform: uppercase;
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      font-weight: bold;
      transition: all 0.2s ease;
      height: 18px;

      .sidebar.closed & {
        opacity: 0;
        height: 0;
      }
    }

    .menu-items {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 7px 10px;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.2s ease, color 0.2s ease;

        .icon {
          display: flex;
          align-self: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          stroke: var(--color-text);
          fill: none;
          transition: stroke 0.2s ease;
        }

        .item-text {
          text-wrap: nowrap;
          font-size: 0.875rem;
          transition: opacity 0.2s ease, visibility 0.2s ease;

          .sidebar.closed & {
            opacity: 0;
          }
        }

        &:hover {
          background-color: var(--color-hover-bg);
          color: var(--color-hover-text);

          .icon {
            stroke: var(--color-hover-text);
            fill: none;
          }
        }
        &.router-link-exact-active {
          background-color: var(--color-hover-bg);
          color: var(--color-hover-text);
          .icon {
            stroke: var(--color-primary);
            fill: none;
          }
        }
      }
    }
  }

  .sidebar-menu.bottom {
    margin-top: auto;
  }
}
</style>
