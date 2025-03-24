<template>
  <article class="summary" :class="{ splitThree, splitFour }">
    <div class="title-wrapper">
      <div class="icon-wrapper">
        <Icon :name="content.icon"></Icon>
      </div>
      <h2 class="title">{{ content.title }}</h2>
    </div>

    <div class="informations">
      <div class="value">
        <p v-if="content.value1">{{ content.value1.title }}</p>
        <p v-if="content.value1">{{ content.value1.value }}</p>
      </div>
      <div class="value">
        <p v-if="content.value2">{{ content.value2.title }}</p>
        <p v-if="content.value2">{{ content.value2.value }}</p>
      </div>
      <div class="value">
        <p v-if="content.value3">{{ content.value3.title }}</p>
        <p v-if="content.value3">{{ content.value3.value }}</p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
const saleStore = useSaleStore();
import defaultButton from "../Form/Buttons/defaultButton.vue";
const props = defineProps<{
  content: {
    title: string;
    value?: string;
    icon: string;
    positive?: string;
    negative?: string;
    subtitle?: string;
    value1?: {
      title: string;
      value: string;
    };
    value2?: {
      title: string;
      value: string;
    };
    value3?: {
      title: string;
      value: string;
    };
    evaluation?: {
      rating: string;
      reviews: string;
    };
    func?: () => void;
  };
  splitThree?: boolean;
  splitFour?: boolean;
  loading?: boolean;
}>();

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
  () => props.content.value,
  (newValue) => {
    if (newValue) {
      updateValue(parseInt(newValue));
    }
  },
  { immediate: true }
);

const stars = computed(() => {
  if (!props.content.evaluation) return [];
  const rating = parseFloat(props.content.evaluation.rating);
  return Array(5)
    .fill(0)
    .map((_, index) => {
      const starValue = rating - index;
      if (starValue >= 0.75) return 1;
      if (starValue >= 0.25) return 0.5;
      return 0;
    });
});
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
  gap: 8px;

  @media only screen and (min-width: 1224px) {
    // min-width: 45%;
  }
  @media only screen and (min-width: 1824px) {
    min-width: 300px;
  }

  .title-wrapper {
    display: flex;
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

  .informations {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    .metric-wrapper {
      display: flex;
      align-items: center;
      border-radius: 5px;
      height: fit-content;
      padding: 0 8px 0 4px;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        stroke: var(--color-primary);
        fill: none;
      }
      .percentage {
        font-size: 1.1rem;
        color: var(--color-text);
      }
      &.positive {
        background-color: var(--color-bg-green);
        border: 1px solid var(--color-green);
        .icon {
          stroke: var(--color-green);
          transform: rotate(45deg);
        }
        .percentage {
          font-size: 0.9rem;
          color: var(--color-green);
        }
      }
      &.negative {
        background-color: var(--color-bg-red);
        border: 1px solid var(--color-red);
        .icon {
          stroke: var(--color-red);
          transform: rotate(135deg);
        }
        .percentage {
          font-size: 0.9rem;
          color: var(--color-red);
        }
      }
    }
    .evaluations-wrapper {
      display: flex;
      align-items: center;
      gap: 4px;
      .rating-stars {
        display: flex;
        gap: 4px;
        .star-wrapper {
          position: relative;
          width: 20px;
          height: 20px;

          .icon {
            width: 20px;
            height: 20px;
            stroke: var(--color-primary);
            fill: none;
            position: absolute;
            top: 0;
            left: 0;

            &.star-base {
              &.filled {
                fill: var(--color-primary);
              }
              &.empty {
                fill: none;
              }
            }

            &.star-overlay {
              clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
              fill: var(--color-primary);
            }
          }
        }
      }
      .rating-wrapper {
        display: flex;
        gap: 4px;
        align-items: flex-end;
        .ratings {
          font-weight: bold;
          font-size: 2rem;
        }
        .reviews {
          font-size: 1rem;
          color: var(--color-text-subtitle);
          align-items: center;
          margin-bottom: 8px;
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
