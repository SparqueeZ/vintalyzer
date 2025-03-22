<template>
  <article class="summary" :class="{ splitThree, splitFour }">
    <div class="header-wrapper">
      <div class="title-wrapper">
        <div class="icon-wrapper">
          <Icon :name="content?.icon"></Icon>
        </div>
        <h2 class="title">{{ content?.title }}</h2>
      </div>
      <div class="link-btn-wrapper">
        <defaultButton
          v-if="content?.func"
          text="Accéder"
          iconLeft="linkSquare01"
          transparent
          fit
          @click="content?.func"
        />
      </div>
    </div>

    <div class="informations">
      <div class="top">
        <p class="shop-name">@{{ rivalStore.shop.name }}</p>
      </div>
      <div class="bottom">
        <div class="location-wrapper">
          <Icon name="location01" />
          <p class="location">{{ rivalStore.shop.location }}</p>
        </div>
        <div class="subscribers-wrapper">
          <p class="subscribers">
            {{ rivalStore.shop.followers }}
            <span class="subtitle">abonnés</span>
          </p>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import Icon from "./Icon.vue";
const rivalStore = useRivalStore();
const saleStore = useSaleStore();
import defaultButton from "./Form/Buttons/defaultButton.vue";
const props = defineProps<{
  content?: {
    title: string;
    value?: string;
    icon: string;
    positive?: string;
    negative?: string;
    func?: () => void;
  };
  splitThree?: boolean;
  splitFour?: boolean;
  loading?: boolean;
}>();

console.log(props.content);

const displayedValue = ref(0);
let animationFrameId: number | null = null;
const animation = ref(true);

const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

const animateCounter = (target: number, duration: number = 1000) => {
  if (displayedValue.value === target) return;

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  const startValue = displayedValue.value;
  const startTime = performance.now();
  const endTime = startTime + duration;

  const updateCounter = (currentTime: number) => {
    if (currentTime >= endTime) {
      displayedValue.value = target;
      animationFrameId = null;
      return;
    }

    const progress = (currentTime - startTime) / duration;
    const easedProgress = easeOutQuart(progress);
    displayedValue.value = Math.round(
      startValue + (target - startValue) * easedProgress
    );

    animationFrameId = requestAnimationFrame(updateCounter);
  };

  animationFrameId = requestAnimationFrame(updateCounter);
};

const updateValue = (target: number) => {
  if (animation.value) {
    animateCounter(target);
  } else {
    displayedValue.value = target;
  }
};

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});

watch(
  () => props.content?.value,
  (newValue) => {
    if (newValue) {
      updateValue(parseInt(newValue));
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.summary {
  padding: 16px 16px 12px 16px;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;
  width: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media only screen and (min-width: 1224px) {
    // min-width: 45%;
    min-width: 400px;
  }
  @media only screen and (min-width: 1824px) {
    min-width: 600px;
  }

  .header-wrapper {
    display: flex;
    justify-content: space-between;

    .title-wrapper {
      display: flex;
      gap: 8px;
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
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text);
      }
    }
  }

  .informations {
    display: flex;
    flex-direction: column;
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      .shop-name {
        font-size: 1rem;
        color: var(--color-text-subtitle);
      }
    }
    .bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      .location-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
        .icon {
          width: 20px;
          height: 20px;
          stroke: var(--color-text);
          fill: none;
        }
        .location {
          font-size: 1rem;
          color: var(--color-text-subtitle);
        }
      }
      .subscribers-wrapper {
        display: flex;
        .subscribers {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-text);
          .subtitle {
            font-size: 0.9rem;
            color: var(--color-text-subtitle);
          }
        }
      }
    }
  }

  .value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-text);
  }

  &.splitThree {
    min-width: 30%;
  }
  &.splitFour {
    width: 22%;
  }
}
</style>
