<template>
  <Transition name="toast">
    <div v-if="isVisible" class="toast" :class="color">
      <div class="toast-content">
        <Icon :name="icon" size="20" />
        <span class="toast-text">{{ text }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps({
  color: {
    type: String,
    default: "primary",
    validator: (value: string) =>
      ["primary", "success", "warning", "error"].includes(value),
  },
  icon: {
    type: String,
    default: "mdi:information",
  },
  text: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 5000,
  },
});

const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
});
</script>

<style scoped lang="scss">
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 18px;
  border-radius: 8px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &.primary {
    background-color: #3498db;
    color: white;
  }

  &.success {
    background-color: #2ecc71;
    color: white;
  }

  &.warning {
    background-color: #f1c40f;
    color: #2c3e50;
  }

  &.error {
    background-color: var(--color-red);
    color: white;
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  .icon {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: var(--color-text);
  }
}

.toast-text {
  font-size: 14px;
  font-weight: 500;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
