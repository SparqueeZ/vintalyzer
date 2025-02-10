<template>
  <div
    class="button-container"
    :class="{
      disabled,
      invalid,
      privateInvalid,
      cta,
      active: privateActive || active,
    }"
    @click="disabled ? null : changeActiveState()"
  >
    <nuxt-link to="" v-if="link">
      <button>{{ text }}</button>
    </nuxt-link>
    <customButton v-else :parentProps="props" :active="privateActive">
      <div v-if="iconLeft" class="icon-container">
        <Icon :name="iconLeft" />
      </div>
      {{ text }}
      <div v-if="iconRight" class="icon-container">
        <Icon :name="iconRight" />
      </div>
    </customButton>
  </div>
</template>

<script setup lang="ts">
import customButton from "~/components/Form/Buttons/customButton.vue";
import Icon from "~/components/Icon.vue";
const props = defineProps({
  text: String,
  type: String,
  link: String,
  onClick: Function,
  icon: String,
  iconLeft: String,
  iconRight: String,
  cta: Boolean,
  invalid: Boolean,
  disabled: Boolean,
  active: Boolean,
});

const privateActive = ref(props.active || false);

const changeActiveState = () => {
  privateActive.value = !privateActive.value;
  if (privateActive.value) {
    emit("active");
  } else {
    emit("inactive");
  }
};

const emit = defineEmits(["active", "inactive", "click"]);

const privateInvalid = ref(false);
</script>

<style scoped lang="scss">
.button-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  width: 100%;
  height: fit-content;
  gap: 6px;

  .icon-container {
    .icon {
      display: flex;
      width: 20px;
      height: 20px;
      stroke: var(--color-text);
      fill: none;
    }
  }
}
</style>
