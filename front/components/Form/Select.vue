<template>
  <div
    class="dropdown input-container"
    :class="{
      disabled,
      privateInvalid,
      invalid: errorMessage || privateErrorMessage || invalid,
    }"
  >
    <label for="input" class="input-label">{{ label }}</label>

    <div
      class="selected-option input"
      tabindex="0"
      @click="toggleDropdown"
      @keydown="handleKeydown"
    >
      <div v-if="selectedOption" class="selected-option-content">
        <img
          :src="`http://purecatamphetamine.github.io/country-flag-icons/3x2/${selectedOption.value2}.svg`"
          alt="{{ selectedOption.name }}"
          class="option-image"
        />
        <span class="text">{{ selectedOption.name }}</span>
      </div>
      <div v-else class="selected-option-content">
        <span class="text">Sélectionnez une option</span>
      </div>
      <Icon name="arrowDown01" :class="isOpen ? 'open' : ''" />

      <transition name="dropdown-animation">
        <div v-if="isOpen" class="dropdown-container" :class="{ search }">
          <div v-if="search" class="search-container" @click.stop>
            <span class="search-input-container">
              <Icon name="search" />
              <input
                type="text"
                v-model="searchQuery"
                class="search-input"
                placeholder="Rechercher..."
                @keydown.stop
            /></span>
          </div>
          <ul class="options-list" ref="optionsList">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              :class="{
                'option-item': true,
                focused: index === focusedIndex,
                selected: selectedOption && selectedOption.name === option.name,
              }"
              @click="selectOption(option)"
              @mouseover="focusedIndex = index"
              @mouseleave="focusedIndex = null"
              ref="optionItem"
            >
              <div class="option-infos">
                <img
                  :src="`http://purecatamphetamine.github.io/country-flag-icons/3x2/${option.value2}.svg`"
                  alt="{{ option.name }}"
                  class="option-image"
                />
                <div class="option-text">
                  <span>{{ option.name }}</span>
                </div>
              </div>
              <Icon
                name="tick01"
                v-if="
                  selectedOption &&
                  selectedOption.name === option.name &&
                  tickIcon
                "
              />
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <div class="input-messages">
      <div class="important-messages">
        <transition-group name="fade">
          <p
            v-if="!errorMessage && !privateErrorMessage"
            class="important-message hint"
          >
            {{ hint }}
          </p>
          <div v-else class="important-message errorMessage">
            <Icon v-if="errorIcon" :name="errorIcon" />
            <p class="error">
              {{ errorMessage ? errorMessage : privateErrorMessage }}
            </p>
          </div>
        </transition-group>
      </div>

      <p
        v-if="maxChars"
        class="informations-mesages input-information"
        :class="shakeMaxCharsVar ? 'shake' : ''"
      >
        {{ inputValue.length }} / {{ maxChars?.toString() }}
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  defineProps,
  watch,
  nextTick,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import Icon from "../Icon.vue";

const props = defineProps({
  icon: String,
  label: String,
  invalid: Boolean,
  hint: String,
  errorMessage: String,
  errorIcon: String,
  disabled: Boolean,
  clearBtn: Boolean,
  maxChars: Number,
  value: String,
  placeholder: String,
  type: String,
  liveValidation: Boolean,
  tickIcon: Boolean,
  search: Boolean,
  options: {
    type: Array,
    required: true,
    validator(value) {
      return value.every(
        (option) => "name" in option && "value1" in option && "value2" in option
      );
    },
  },
});

const isOpen = ref(false);
const selectedOption = ref(null);
const focusedIndex = ref(null);
const optionsList = ref(null);
const optionItem = ref(null);
const searchQuery = ref("");
const privateInvalid = ref(props.invalid || false);
const privateErrorMessage = ref(props.errorMessage || false);

const toggleDropdown = async () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value && selectedOption.value) {
    focusedIndex.value = props.options.findIndex(
      (option) => option.name === selectedOption.value.name
    );
    await nextTick();
    scrollToFocusedOption();
  } else if (!isOpen.value) {
    focusedIndex.value = null;
  }
};

const selectOption = (option) => {
  selectedOption.value = option;
  focusedIndex.value = null;
};

const handleKeydown = (event) => {
  if (
    (event.key === "Enter" && !focusedIndex.value) ||
    (event.key === " " && !searchQuery.value)
  ) {
    event.preventDefault();
    toggleDropdown();
  } else if (event.key === "ArrowDown" && isOpen.value) {
    console.log("down");
    event.preventDefault();
    focusedIndex.value =
      focusedIndex.value === null
        ? 0
        : (focusedIndex.value + 1) % props.options.length;
    console.log(focusedIndex.value);
  } else if (event.key === "ArrowUp" && isOpen.value) {
    event.preventDefault();
    focusedIndex.value =
      focusedIndex.value === null
        ? props.options.length - 1
        : (focusedIndex.value - 1 + props.options.length) %
          props.options.length;
    console.log(focusedIndex.value);
  } else if (
    event.key === "Enter" &&
    isOpen.value &&
    focusedIndex.value !== null
  ) {
    event.preventDefault();
    console.log(props.options[focusedIndex.value]);
    selectOption(props.options[focusedIndex.value]);
    toggleDropdown();
  }
};

const scrollToFocusedOption = () => {
  if (focusedIndex.value !== null && optionsList.value) {
    const focusedOption = optionsList.value.children[focusedIndex.value];
    if (focusedOption) {
      focusedOption.scrollIntoView({ block: "nearest" });
    }
  }
};

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options;
  }
  return props.options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleClickOutside = (event) => {
  if (
    optionsList.value &&
    !optionsList.value.contains(event.target) &&
    !event.target.closest(".selected-option")
  ) {
    isOpen.value = false;
    focusedIndex.value = null;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

watch(focusedIndex, scrollToFocusedOption);
</script>

<style scoped lang="scss">
@keyframes dropdown-fade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes dropdown-hide {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.input-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  max-width: 350px;
  width: 100%;
  gap: 6px;

  .input-label {
    font-size: 0.9rem;
    color: var(--color-text);
    cursor: text;
  }

  .selected-option {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 14px;
    background-color: var(--color-bg);
    border-radius: 7px;
    border: 1px solid var(--color-border);
    transition: 0.3s ease border-color, 0.3s ease box-shadow;
    cursor: pointer;
    .selected-option-content {
      display: flex;
      align-items: center;

      .option-image {
        width: 20px;
        height: 20px;
        margin-right: 10px;
        user-select: none;
      }

      .text {
        user-select: none;
      }
    }
    .icon {
      display: flex;
      width: 20px;
      height: 20px;
      stroke: var(--color-text-secondary);
      fill: none;
      user-select: none;
      transition: 0.3s ease all;
      &.open {
        transform: rotateX(180deg);
      }
    }

    &:focus-within,
    &:focus,
    &:hover {
      box-shadow: 0 0 1px 3px var(--color-shadow-accent);
      border: 1px solid var(--color-accent);
    }
    &.invalid {
      // box-shadow: 0 0 1px 3px var(--color-shadow-error);
      border: 1px solid var(--color-border-error);

      &:focus-within {
        box-shadow: 0 0 1px 3px var(--color-shadow-error);
        border: 1px solid var(--color-border-error);
      }
      &:hover {
        box-shadow: 0 0 1px 3px var(--color-shadow-error);
        border: 1px solid var(--color-border-error);
      }
    }
  }

  &.invalid {
    .input {
      border: 1px solid var(--color-border-error);
      &:focus-within {
        box-shadow: 0 0 1px 3px var(--color-shadow-error);
        border: 1px solid var(--color-border-error);
      }
      &:hover {
        box-shadow: 0 0 1px 3px var(--color-shadow-error);
        border: 1px solid var(--color-border-error);
      }
    }
  }
  &.disabled {
    .input {
      background-color: var(--color-secondary-bg);
    }
    pointer-events: none;
    // opacity: 0.8;
  }

  .input-messages {
    display: flex;
    justify-content: space-between;
    .important-messages {
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
      width: 100%;

      .important-message {
        &.fade-enter-active,
        &.fade-leave-active {
          transition: opacity 0.1s ease-out, transform 0.1s ease-out;
        }
        &.fade-enter-from,
        &.fade-leave-to {
          opacity: 0;
          transform: translateY(-10px);
        }
      }

      .hint {
        position: absolute;
        font-size: 0.775rem;
        letter-spacing: 0.2px;
        color: var(--color-text-subtitle);
      }

      .errorMessage {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 8px;
        .icon {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: var(--color-text-error);
        }
        .error {
          font-size: 1rem;
          color: var(--color-text-error);
        }
      }
    }
    .informations-mesages {
      display: flex;
      gap: 4px;
      color: var(--color-text-subtitle);
      font-size: 0.775rem;
      transition: color 0.1s ease-out;
      &.shake {
        color: var(--color-text-error);
        animation: shake 0.5s;
      }
    }
  }
}

.dropdown-container {
  scroll-behavior: smooth;
  position: absolute;
  top: 120%;
  left: 0;
  width: 100%;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  border-radius: 4px;
  overflow-y: auto;
  z-index: 1000;
  .search-container {
    position: sticky;
    padding: 10px;
    .search-input-container {
      display: flex;
      align-items: center;
      padding: 0 5px;
      border-radius: 4px;
      border: 1px solid var(--color-border);
    }
    .icon {
      display: flex;
      width: 18px;
      height: 18px;
      stroke: var(--color-text-secondary);
    }
    .search-input {
      width: 100%;
      padding: 4px;
      outline: none;
      background-color: transparent;
    }
  }
  .options-list {
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg);
    border-radius: 4px;
    max-height: 132px;
    //   max-height: 200px;
    overflow-y: auto;
    gap: 4px;
    z-index: 1000;
    padding: 10px;
    //   animation: dropdown-fade 0.3s ease-out;

    .option-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
      cursor: pointer;
      border-radius: 5px;
      transition: background-color 0.2s;

      .option-infos {
        display: flex;
        align-items: center;

        .option-image {
          width: 20px;
          height: 20px;
          margin-right: 10px;
        }
      }

      .icon {
        display: flex;
        width: 20px;
        height: 20px;
        stroke: var(--color-text-secondary);
      }

      &:hover,
      &.focused,
      &.selected {
        background-color: var(--color-secondary-bg);
      }
    }
  }
  &.search {
    max-height: 200px;
  }
}

.dropdown-animation-enter-active,
.dropdown-animation-leave-active {
  transition: all 0.2s ease;
}

.dropdown-animation-enter-from,
.dropdown-animation-leave-to {
  opacity: 0;
}

.dropdown-animation-enter-to,
.dropdown-animation-leave-from {
  opacity: 1;
}

.option-text span {
  display: block;
}

.dropdown-icon {
  margin-left: 10px;
}
</style>
