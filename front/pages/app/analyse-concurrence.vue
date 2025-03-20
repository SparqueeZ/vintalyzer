<script setup>
import { ref, onMounted } from "vue";

function fetchShopData() {
  console.log("Rechargement des données...");
}

const rivalStore = useRivalStore();

onMounted(() => {
  window.addEventListener("message", (event) => {
    // Vérifiez event.origin si nécessaire pour plus de sécurité
    if (event.data && event.data.type === "EXTENSION_DONNEES") {
      console.log("Données reçues :", event.data.data);
      rivalStore.setShopData(event.data.data);
    }
  });
});
</script>

<template>
  <div>
    <h1>Données de la boutique</h1>
    <pre v-if="rivalStore.shop">
        {{ rivalStore.shop }}
    </pre>
    <p v-else>Aucune donnée disponible.</p>
    <button @click="fetchShopData">Recharger</button>
  </div>
</template>
