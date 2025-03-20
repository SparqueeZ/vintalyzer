<template>
  <transition name="load" mode="out-in">
    <article v-if="saleStore.shop?.name" class="shop-wrapper" key="content">
      <div class="title-wrapper">
        <div class="icon-wrapper">
          <Icon name="store"></Icon>
        </div>
        <p class="title">Boutique</p>
      </div>
      <div class="displayname">@{{ saleStore.shop.name }}</div>
      <div class="informations">
        <div class="email">
          <Icon name="mail01"></Icon>
          <p>{{ saleStore.shop.email }}</p>
        </div>
        <div class="location">
          <Icon name="location01"></Icon>
          <div class="text">
            <p>{{ saleStore.shop.location.city }},</p>
            <p>
              {{ saleStore.shop.location.country }}
            </p>
          </div>
        </div>
      </div>
      <div class="subscribers">
        <p>
          <span class="amount">{{ displayedSubscribers }}</span>
          abonnés
        </p>
      </div>
    </article>
    <article v-else class="shop-wrapper loading" key="skeleton">
      <div class="title-wrapper">
        <div class="icon-wrapper">
          <Icon name="store"></Icon>
        </div>
        <p class="title">Boutique</p>
      </div>
      <div class="displayname">
        <div class="loading-text"></div>
      </div>
      <div class="informations">
        <div class="email">
          <Icon name="mail01"></Icon>
          <div class="loading-text"></div>
        </div>
        <div class="location">
          <Icon name="location01"></Icon>
          <div class="text">
            <div class="loading-text"></div>
          </div>
        </div>
      </div>
      <div class="subscribers">
        <div class="loading-text"></div>
      </div>
    </article>
  </transition>
</template>

<script setup lang="ts">
const saleStore = useSaleStore();
const displayedSubscribers = ref(0);
let animationFrameId: number | null = null;
const animation = ref(true);

const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

const animateCounter = (target: number, duration: number = 1000) => {
  if (displayedSubscribers.value === target) return;

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  const startValue = displayedSubscribers.value;
  const startTime = performance.now();
  const endTime = startTime + duration;

  const updateCounter = (currentTime: number) => {
    if (currentTime >= endTime) {
      displayedSubscribers.value = target;
      animationFrameId = null;
      return;
    }

    const progress = (currentTime - startTime) / duration;
    const easedProgress = easeOutQuart(progress);
    displayedSubscribers.value = Math.round(
      startValue + (target - startValue) * easedProgress
    );

    animationFrameId = requestAnimationFrame(updateCounter);
  };

  animationFrameId = requestAnimationFrame(updateCounter);
};

const updateSubscribers = (target: number) => {
  if (animation.value) {
    animateCounter(target);
  } else {
    displayedSubscribers.value = target;
  }
};

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});

watchEffect(() => {
  if (saleStore.shop?.subscribers) {
    updateSubscribers(saleStore.shop.subscribers);
  }
});
</script>

<style scoped lang="scss">
.load-enter-active,
.load-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.load-enter-from,
.load-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes loading {
  to {
    background-position: left;
  }
}

.loading-text {
  width: 100%;
  height: 100%;
  min-height: 20px;
  border-radius: 0.5rem;
  background: linear-gradient(
      90deg,
      var(--color-bg-tertiary) 40%,
      #525877,
      var(--color-bg-tertiary) 70%
    )
    right / 300% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

.shop-wrapper {
  padding: 16px;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;
  width: fit-content;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .title-wrapper {
    display: flex;
    gap: 16px;
    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-bg-tertiary);
      height: 35px;
      width: 35px;
      border-radius: 5px;
      border: var(--color-border) solid 1px;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 25px;
        stroke: var(--color-primary);
        fill: none;
      }
    }
    .title {
      font-size: 1.3rem;
      font-weight: bold;
      color: var(--color-text);
    }
  }
  .displayname {
    width: 100%;
    margin-top: -12px;
    font-size: 1.1rem;
    color: var(--color-text-subtitle);
  }
  .informations {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    .email {
      display: flex;
      gap: 8px;
      color: var(--color-text-subtitle);
      font-size: 0.9rem;
      width: 100%;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        stroke: var(--color-text);
        fill: none;
      }
    }
    .location {
      display: flex;
      gap: 8px;
      color: var(--color-text-subtitle);
      font-size: 0.9rem;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        stroke: var(--color-text);
        fill: none;
      }
      .text {
        width: 100%;
      }
    }
  }
  .subscribers {
    color: var(--color-text-subtitle);
    .amount {
      font-size: 2rem;
      font-weight: bold;
      color: var(--color-text);
    }
  }
}
</style>
