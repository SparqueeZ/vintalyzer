<template>
  <transition name="appear">
    <div
      v-if="isVisible"
      class="context-menu"
      ref="menuRef"
      @mousedown.stop
      @click.stop
    >
      <ul class="menu-list">
        <li
          v-for="(category, index) in menu"
          :key="index"
          class="menu-category"
        >
          <div v-if="index !== 0" class="separator"></div>
          <ul class="option-list">
            <li
              v-for="(option, optIndex) in category.options"
              :key="optIndex"
              class="menu-option"
              @click="handleOptionClick(option)"
            >
              <div
                class="menu-content"
                :class="option.color === 'red' ? 'red' : ''"
              >
                <Icon
                  :name="
                    typeof option.icon === 'function'
                      ? option.icon(currentOrder)
                      : option.icon
                  "
                />
                <p>
                  {{
                    typeof option.label === "function"
                      ? option.label(currentOrder)
                      : option.label
                  }}
                </p>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface MenuOption {
  icon: string | ((order: any) => string);
  label: string | ((order: any) => string);
  action?: (order: any) => void;
  children?: MenuOption[];
  category: string;
  color?: string;
}

interface MenuCategory {
  category: string;
  categoryIcon: string;
  options: MenuOption[];
}

const props = withDefaults(
  defineProps<{
    menu: MenuCategory[];
    isVisible: boolean;
    targetElement?: HTMLElement | null;
    position?: "right" | "left" | "bottom" | "top";
    currentOrder?: any;
  }>(),
  {
    position: "bottom",
    currentOrder: null,
  }
);

const emit = defineEmits<{
  (e: "option-selected", option: MenuOption): void;
  (e: "close-menu"): void;
}>();

const menuRef = ref<HTMLElement | null>(null);

const handleOptionClick = (option: MenuOption) => {
  if (option.action && props.currentOrder) {
    option.action(props.currentOrder);
  }
  emit("option-selected", option);
  emit("close-menu");
};

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit("close-menu");
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<style scoped lang="scss">
.appear-enter-active,
.appear-leave-active {
  transition: opacity 0.2s ease-out;
}

.appear-enter-from,
.appear-leave-to {
  opacity: 0;
}

.context-menu {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
  min-width: 180px;
  width: fit-content;
  z-index: 1000;
  padding: 4px;
  .menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
    .menu-category {
      .separator {
        height: 1px;
        background-color: var(--color-border);
        margin: 4px 0;
      }
      .option-list {
        list-style: none;
        margin: 0;
        padding: 0;
        .menu-option {
          padding: 8px 12px;
          cursor: pointer;
          position: relative;
          border-radius: 4px;
          &:hover {
            background-color: var(--color-bg-tertiary);
          }
          .menu-content {
            display: flex;
            align-items: center;
            gap: 8px;
            &.red {
              .icon {
                stroke: var(--color-red);
              }
              p {
                color: var(--color-red);
              }
            }
            .icon {
              width: 16px;
              height: 16px;
              fill: none;
              stroke: var(--color-text-subtitle);
            }
            p {
              font-size: 0.9rem;
              text-wrap: nowrap;
            }
          }
        }
      }
    }
  }
}
</style>
