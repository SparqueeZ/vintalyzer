// Par exemple, dans un plugin client (plugins/extension-message.client.js)
export default defineNuxtPlugin(() => {
  if (process.client) {
    window.addEventListener("message", (event) => {
      // Vous pouvez vérifier event.origin ici si nécessaire pour la sécurité
      if (event.data && event.data.type === "EXTENSION_DONNEES") {
        console.log("Données reçues de l'extension :", event.data.data);
        // Traitement des données, par exemple mise à jour d'un store
      }
    });
  }
});
