chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveToken") {
    chrome.storage.local.set({ ext_token: message.token }, () => {
      console.log("Token enregistré:", message.token);
    });
  } else if (message.action === "getToken") {
    chrome.storage.local.get("ext_token", (data) => {
      sendResponse({ token: data.ext_token });
    });
    return true; // Permet d'utiliser sendResponse de manière asynchrone
  }
});

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.action === "getShopData") {
      chrome.storage.local.get("shop_data", (data) => {
        sendResponse({ shopData: data.shop_data || null });
      });
      return true; // Indique que la réponse est asynchrone
    }
  }
);
