chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "EXTENSION_DONNEES") {
    // Relayer le message vers la page
    window.postMessage(message, "*");
  }
});
