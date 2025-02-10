<template>
  <section class="profile-card__wrapper">
    <div class="profile-card" :class="{ right, rounded, small }">
      <div class="profile-card__image-wrapper">
        <div class="profile-card__image">
          <span class="profile-card__avatar">
            <p>{{ userStore.user.firstname[0] }}</p>
          </span>
        </div>
      </div>

      <div v-if="!avatarOnly" class="profile-card__info">
        <p class="profile-card__name item-text">
          {{ userStore.user.firstname }} {{ userStore.user.lastname }}
        </p>
        <p class="profile-card__email item-text">
          {{ userStore.user.email }}
        </p>
      </div>
    </div>

    <!-- <div class="icon__wrapper">
      <Icon name="arrowDown01" />
    </div> -->
  </section>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/UserStore";
import Icon from "../Icon.vue";
const userStore = useUserStore();

const props = defineProps({
  right: Boolean,
  avatarOnly: Boolean,
  rounded: Boolean,
  small: Boolean,
});
</script>

<style scoped lang="scss">
.profile-card__wrapper {
  display: flex;
  height: 100%;
  width: 100%;

  .profile-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 16px;
    border-radius: 0.5rem;
    background-color: var(--color-bg);
    transition: transform 0.3s ease-out, background-color 0.15s ease-out;
    width: 100%;
    &.right {
      flex-direction: row-reverse;
      .profile-card__info {
        text-align: right;
      }
    }
    &.rounded {
      .profile-card__image {
        border-radius: 50%;
      }
    }
    &.small {
      padding: 4px 8px;
      gap: 8px;
    }

    &:hover {
      cursor: pointer;
      background-color: var(--color-border);
    }
    &__image-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      aspect-ratio: 1;
      border-radius: 5px;
      flex-shrink: 0;
      background-color: var(--color-primary);
      transition: width 0.3s ease-out, height 0.3s ease-out,
        padding 0.3s ease-out;
      .sidebar.closed & {
        transition: width 0.3s ease-out, height 0.3s ease-out,
          padding 0.3s ease-out;
        padding: 0;
        width: 25px;
        height: 25px;
      }
    }
    &__avatar {
      font-size: 0.8rem;
      color: white;
      font-weight: 700;
    }
    &__info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    &__name {
      font-size: clamp(0.2rem, 0.8rem, 1rem);
      font-weight: bold;
      text-overflow: ellipsis;
      text-wrap: nowrap;
      overflow: hidden;
      transition: opacity 0.2s ease;
      .sidebar.closed & {
        opacity: 0;
      }
    }
    &__email {
      font-size: clamp(0.2rem, 0.6rem, 0.875rem);
      text-overflow: ellipsis;
      text-wrap: nowrap;
      overflow: hidden;
      color: #666;
      transition: opacity 0.2s ease;
      .sidebar.closed & {
        opacity: 0;
      }
    }
  }
  .icon__wrapper {
    display: flex;
    height: 100%;
    align-items: center;
    .icon {
      width: 20px;
      height: 20px;
      stroke: var(--color-text);
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
