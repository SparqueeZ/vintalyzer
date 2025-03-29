<template>
  <div
    v-if="isVisible"
    class="context-menu"
    :style="computedPosition"
    ref="menuRef"
    @mousedown.stop
  >
    <ul class="menu-list">
      <li
        v-for="(option, index) in options"
        :key="index"
        class="menu-item"
        @mouseenter="handleSubMenu(index)"
        @click="handleClick(option, $event)"
      >
        <div class="menu-content">
          <Icon :name="option.icon" />
          <span>{{ option.label }}</span>
        </div>

        <defaultContext
          v-if="option.children && activeSubmenu === index"
          :options="option.children"
          :isVisible="isVisible"
          :x="submenuX"
          :y="submenuY"
          @option-selected="$emit('option-selected', $event)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface MenuOption {
  icon: string;
  label: string;
  action?: () => void;
  children?: MenuOption[];
}

const props = defineProps<{
  options: MenuOption[];
  x?: number;
  y?: number;
  isVisible: boolean;
  targetElement?: HTMLElement | null;
  position?: "right" | "left" | "bottom" | "top";
}>();

const emit = defineEmits(["option-selected", "close-menu"]);
const menuRef = ref<HTMLElement | null>(null);

const activeSubmenu = ref<number | null>(null);
const submenuX = ref(0);
const submenuY = ref(0);

const handleSubMenu = (index: number) => {
  activeSubmenu.value = index;
  // Position le sous-menu à droite de l'élément parent
  submenuX.value = props.x ?? +200; // largeur approximative du menu
  submenuY.value = props.y ?? +index * 30; // hauteur approximative de chaque item
};

const handleClick = (option: MenuOption, event: Event) => {
  event.stopPropagation();
  if (!option.children) {
    if (option.action) {
      option.action();
    }
    emit("option-selected", option);
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit("close-menu");
  }
};

const computedPosition = computed(() => {
  if (props.x !== undefined && props.y !== undefined) {
    return { top: `${props.y}px`, left: `${props.x}px` };
  }

  if (props.targetElement && props.position) {
    const rect = props.targetElement.getBoundingClientRect();

    switch (props.position) {
      case "right":
        return {
          top: `${rect.top}px`,
          left: `${rect.right + 5}px`,
        };
      case "left":
        return {
          top: `${rect.top}px`,
          left: `${rect.left - 200}px`,
        };
      case "bottom":
        return {
          top: `${rect.bottom + 5}px`,
          left: `${rect.left}px`,
        };
      case "top":
        return {
          top: `${rect.top - 5}px`,
          left: `${rect.left}px`,
        };
    }
  }

  return { top: "0px", left: "0px" };
});

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
  min-width: 180px;
  z-index: 1000;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  position: relative;
}

.menu-item:hover {
  background-color: var(--color-bg-tertiary);
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 8px;
  .icon {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: var(--color-text);
  }
}

.submenu-indicator {
  margin-left: auto;
}

i {
  width: 20px;
  text-align: center;
}
</style>
