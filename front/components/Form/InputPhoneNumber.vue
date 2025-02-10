<template>
  <div
    class="input-container"
    :class="{ disabled, invalid: invalid || errorMessage }"
    ref="dropdownContainer"
  >
    <label for="input" class="input-label">{{ label }}</label>
    <div
      class="input shadow-sm"
      :class="invalid || errorMessage ? 'invalid' : ''"
    >
      <div v-if="icon" class="icon-slot">
        <Icon :name="icon" />
      </div>

      <div class="dropdown">
        <div
          class="selected-option"
          @click="toggleDropdown"
          :class="{ open: isDropdownOpen }"
        >
          <div v-if="selectedCountry" class="selected-option-content">
            <img
              v-if="flagSelect"
              :src="getFlagUrl(selectedCountry.cca2)"
              alt="{{ selectedCountry.name }}"
              class="option-image"
            />
            <p v-if="initials" class="option-initials">
              {{ selectedCountry.cca2 }}
            </p>
          </div>
          <Icon name="arrowDown01" :class="{ open: isDropdownOpen }" />
        </div>

        <transition name="dropdown-animation">
          <div v-if="isDropdownOpen" class="dropdown-menu" @click.stop>
            <input
              v-model="searchQuery"
              class="dropdown-search"
              type="text"
              placeholder="Rechercher un pays"
              @input="filterCountries"
            />
            <ul class="options-list" ref="optionsList">
              <li
                v-for="(country, index) in filteredCountries"
                :key="country.cca2"
                :class="{
                  'option-item': true,
                  focused: index === focusedIndex,
                  selected: selectedCountry?.cca2 === country.cca2,
                }"
                @click="selectCountry(country)"
                @mouseover="focusedIndex = index"
                @mouseleave="focusedIndex = null"
              >
                <img
                  v-if="flagList"
                  :src="getFlagUrl(country.cca2)"
                  :alt="country.name"
                  class="option-image"
                />
                <div class="option-text">
                  <p class="text">{{ country.name }}</p>
                  <p class="option-secondary">({{ country.dialCode }})</p>
                </div>
              </li>
            </ul>
          </div>
        </transition>
      </div>

      <input
        :id="id"
        v-model="phoneNumber"
        type="tel"
        :placeholder="placeholder"
        class="text"
        @input="handleInput"
      />
      <slot name="events" />

      <transition name="fade">
        <Icon
          class="clearBtn"
          v-if="clearBtn && phoneNumber"
          name="cancel01"
          @click="clearInput"
        />
      </transition>
    </div>
    <div class="input-messages">
      <div class="important-messages">
        <transition-group name="fade">
          <p v-if="!errorMessage" class="important-message hint">{{ hint }}</p>
          <div v-else class="important-message errorMessage">
            <Icon v-if="errorIcon" :name="errorIcon" />
            <p class="error">{{ errorMessage }}</p>
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
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import countries from "world-countries";
import Icon from "@/components/Icon.vue";

const props = defineProps({
  id: String,
  value: String,
  placeholder: String,
  label: String,
  hint: String,
  errorMessage: String,
  errorIcon: String,
  disabled: Boolean,
  clearBtn: Boolean,
  name: String,
  icon: String,
  invalid: Boolean,
  errorIcon: String,
  flagSelect: Boolean,
  flagList: Boolean,
  initials: Boolean,
  maxChars: Number,
});

const emit = defineEmits(["update:value"]);

// Transformation des données des pays pour inclure les drapeaux, codes, et formats
const countriesData = countries.map((country) => ({
  name: country.translations.fra?.common || country.name.common,
  cca2: country.cca2,
  dialCode: `+${country.idd.root?.replace("+", "") || ""}${
    country.idd.suffixes?.[0] || ""
  }`.trim(),
}));

const selectedCountry = ref(countriesData[0]);
const phoneNumber = ref(props.value || "");
const isDropdownOpen = ref(false);
const searchQuery = ref("");
const focusedIndex = ref(null);

const toggleDropdown = async () => {
  if (!props.disabled) {
    isDropdownOpen.value = !isDropdownOpen.value;
  }

  if (isDropdownOpen.value) {
    focusedIndex.value = countriesData.findIndex(
      (country) => country.cca2 === selectedCountry.value.cca2
    );
    await nextTick();
    scrollToFocusedOption();
  } else {
    focusedIndex.value = null;
  }
};

const selectCountry = (country) => {
  selectedCountry.value = country;
  isDropdownOpen.value = false;
  searchQuery.value = "";
  phoneNumber.value = country.dialCode;
  emit("update:value", phoneNumber.value);
};

const handleInput = () => {
  if (props.disabled) {
    phoneNumber.value = props.value;
    return;
  }
  formatPhoneNumber();
  emit("update:value", phoneNumber.value);
};

const clearInput = () => {
  phoneNumber.value = selectedCountry.value.dialCode;
  emit("update:value", phoneNumber.value);
};

const getFlagUrl = (cca2) =>
  `https://purecatamphetamine.github.io/country-flag-icons/3x2/${cca2}.svg`;

const filterCountries = () => {
  return countriesData.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
};

const filteredCountries = computed(() => filterCountries());

const formatPhoneNumber = () => {
  const rawNumber = phoneNumber.value
    .replace(selectedCountry.value.dialCode, "")
    .trim();
  const format = selectedCountry.value.format;

  if (format) {
    const formattedNumber = rawNumber
      .replace(/\D/g, "")
      .match(/(\d{2})?/g)
      .filter(Boolean)
      .join(" ");
    phoneNumber.value = `${selectedCountry.value.dialCode} ${formattedNumber}`;
  } else {
    phoneNumber.value = `${selectedCountry.value.dialCode} ${rawNumber}`;
  }
};

const scrollToFocusedOption = () => {
  const optionsList = document.querySelector(".options-list");
  if (focusedIndex.value !== null && optionsList) {
    const focusedOption = optionsList.children[focusedIndex.value];
    if (focusedOption) {
      focusedOption.scrollIntoView({ block: "nearest" });
    }
  }
};

const handleClickOutside = (event) => {
  if (!isDropdownOpen.value) return;

  const dropdown = document.querySelector(".dropdown");
  if (dropdown && !dropdown.contains(event.target)) {
    isDropdownOpen.value = false;
    focusedIndex.value = null;
  }
};

// Gestion des événements globaux
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Synchronisation du focus et du défilement
watch(focusedIndex, scrollToFocusedOption);
watch(
  () => props.value,
  (newValue) => {
    phoneNumber.value = newValue || "";
  }
);
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
  gap: 6px;
  .icon-slot {
    display: flex;
    align-items: center;
    gap: 8px;
    max-height: 46px;

    .icon {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--color-text-secondary);
      transition: opacity 0.1s ease-out, transform 0.2s ease-out,
        stroke 0.2s ease-out;
      cursor: pointer;

      &.clearBtn {
        &:hover {
          stroke: var(--color-text);
        }
      }

      &.fade-enter-from,
      &.fade-leave-to {
        opacity: 0;
        transform: translateX(35px);
      }
    }
  }
  .input-label {
    font-size: 0.9rem;
    color: var(--color-text);
    cursor: text;
  }
  .input {
    display: flex;
    gap: 8px;
    padding: 0 14px 0 0;
    background-color: var(--color-bg);
    border-radius: 7px;
    border: 1px solid var(--color-border);
    transition: 0.3s ease border-color, 0.3s ease box-shadow,
      0.3s ease-out background-color;
    position: relative;
    white-space: nowrap;
    .icon-slot {
      display: flex;
      align-items: center;
      gap: 8px;
      max-height: 46px;

      .icon {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: var(--color-text-secondary);
        transition: opacity 0.1s ease-out, transform 0.2s ease-out,
          stroke 0.2s ease-out;
        cursor: pointer;

        &.clearBtn {
          &:hover {
            stroke: var(--color-text);
          }
        }

        &.fade-enter-from,
        &.fade-leave-to {
          opacity: 0;
          transform: translateX(35px);
        }
      }
    }
    &:focus-within {
      box-shadow: 0 0 1px 3px var(--color-shadow-accent);
      border: 1px solid var(--color-accent);
    }
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
    .dropdown {
      position: relative;
      display: flex;
      align-items: center;
      flex-shrink: 0;

      .selected-option {
        height: 100%;
        width: 100%;
        display: flex;
        position: relative;
        align-items: center;
        justify-content: space-between;
        gap: 4px;
        background-color: var(--color-bg);
        border: 1px solid transparent;
        border-right: 1px solid var(--color-border);
        transition: 0.3s ease background-color;
        cursor: pointer;
        border-radius: 7px 0 0 7px;
        background-color: transparent;
        padding: 0 0 0 14px;
        .selected-option-content {
          display: flex;
          align-items: center;
          overflow: hidden;
          gap: 4px;

          .option-image {
            width: 20px;
            height: 20px;
            user-select: none;
            transition: 0.3s ease filter;
          }

          .option-initials {
            transition: 0.3s ease-out color;
          }

          .text {
            user-select: none;
            text-overflow: ellipsis;
            width: 100%;
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
          background-color: var(--color-secondary-bg);
        }
      }
    }
    .text {
      width: 100%;
      outline: none;
      color: var(--color-text);
      background-color: transparent;
      padding: 10px 0;
    }
  }

  &.disabled {
    .input {
      background-color: var(--color-secondary-bg);
      .dropdown {
        .option-initials {
          color: var(--color-text-secondary);
        }
        .option-image {
          filter: grayscale(100%);
        }
      }
    }
    pointer-events: none;
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

.dropdown-menu {
  scroll-behavior: smooth;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  min-width: 200px;
  background-color: var(--color-bg);
  border-radius: 4px;
  border: 1px solid var(--color-border);
  overflow-y: auto;
  z-index: 1000;
  .dropdown-search {
    width: 100%;
    padding: 8px;
    border: none;
    background-color: var(--color-bg);
    outline: none;
    border-bottom: 1px solid var(--color-border);
  }
  .options-list {
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg);
    border-radius: 4px;
    max-height: 132px;
    overflow-y: auto;
    gap: 4px;
    z-index: 1000;
    width: 100%;
    padding: 10px;

    .option-item {
      white-space: nowrap;
      display: flex;
      align-items: center;
      padding: 3px 5px;
      cursor: pointer;
      border-radius: 5px;
      width: 100%;
      height: auto;
      gap: 10px;
      transition: background-color 0.2s;
      &:hover,
      &.focused,
      &.selected {
        background-color: var(--color-secondary-bg);
      }
      .option-text {
        display: flex;
        justify-content: space-between;
        width: 100%;
        max-width: 138px;
        .text {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          padding: 0;
        }

        .option-secondary {
          color: var(--color-text-secondary);
          font-size: 0.8rem;
        }
      }
      .option-image {
        width: 20px;
        height: 20px;
      }
    }
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
