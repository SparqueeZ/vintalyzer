<!-- pages/test-parser.vue -->
<template>
  <div class="parser-container">
    <div class="title-wrapper">
      <div class="icon-wrapper">
        <Icon name="settings"></Icon>
      </div>
      <h1 class="title">Analyse de profile</h1>
    </div>

    <textarea
      v-model="inputText"
      class="textarea-custom"
      placeholder="Collez votre texte récupéré depuis l'extension ici..."
    ></textarea>

    <div v-if="errorMessage" class="error-message">
      <Icon name="alertCircle" />
      <span>{{ errorMessage }}</span>
    </div>

    <div class="button-container">
      <defaultButton
        text="Analyser le texte"
        iconLeft="settings"
        :loading="isLoading"
        cta
        :disabled="!inputText.trim() || isLoading"
        @click="analyze"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDataStore } from "~/stores/dataStore";
import { useSaleStore } from "~/stores/saleStore";
import { useConcurrentStore } from "~/stores/concurrentStore";
import { launchAnalysis } from "~/utils/v2/analyzerEngine";
import defaultButton from "~/components/Form/Buttons/defaultButton.vue";

const store = useDataStore();
const saleStore = useSaleStore();
const concurrentStore = useConcurrentStore();
const inputText = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const analyze = async () => {
  try {
    errorMessage.value = ""; // Clear previous errors
    isLoading.value = true;

    const data = await launchAnalysis(inputText.value);

    // Store data in the sale store
    saleStore.shop = data.shop;
    saleStore.coments = data.comments;
    saleStore.sales = data.sales;
    saleStore.expenses = data.expenses;
    saleStore.statistics = data.statistics;

    // Send data to backend
    const response = await saleStore.loadSalesToBackend();
    console.log("Back-end response:", response);

    // If we get here, the request was successful
    // Reload the page to reflect the new data
    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);

    // Display appropriate error message based on error type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage.value = `Erreur serveur: ${
        error.response.data?.message ||
        error.response.statusText ||
        "Une erreur est survenue"
      }`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage.value =
        "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.";
    } else {
      // Something happened in setting up the request or processing the data
      errorMessage.value =
        error.message ||
        "Erreur lors de l'analyse du texte. Vérifiez le format du texte et réessayez.";
    }
  } finally {
    isLoading.value = false;
  }
};

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>

<style scoped lang="scss">
.parser-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.title-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 1.5rem;

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-tertiary);
    height: 40px;
    width: 40px;
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

.textarea-custom {
  width: 100%;
  height: 16rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  background-color: transparent;
  border: var(--color-border) solid 1px;
  color: var(--color-text);
  resize: none;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-red);
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: var(--color-bg-red, rgba(255, 0, 0, 0.1));

  .icon {
    width: 20px;
    height: 20px;
    stroke: var(--color-red);
  }

  span {
    font-size: 0.9rem;
  }
}

.button-container {
  display: flex;
  justify-content: flex-end;
  width: fit-content;
  margin-left: auto;
}
</style>
