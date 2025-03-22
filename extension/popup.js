document.addEventListener("DOMContentLoaded", () => {
  const saveTokenBtn = document.getElementById("saveToken");
  const analyzeBtn = document.getElementById("analyzeShop");
  const sendSavedDataBtn = document.getElementById("sendSavedData");

  // Variable pour déterminer si les données doivent être envoyées au backend ou sauvegardées localement
  const shouldSave = false; // true pour envoyer au backend, false pour sauvegarder localement

  // // Récupérer le token depuis localStorage du dashboard et le sauvegarder
  // saveTokenBtn.addEventListener("click", () => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     chrome.scripting.executeScript(
  //       {
  //         target: { tabId: tabs[0].id },
  //         function: () => localStorage.getItem("ext_token"),
  //       },
  //       (results) => {
  //         if (results && results[0].result) {
  //           const token = results[0].result;
  //           chrome.storage.local.set({ ext_token: token }, () => {
  //             alert("Token enregistré !");
  //             analyzeBtn.disabled = false; // Activer le bouton analyse
  //           });
  //         } else {
  //           alert(
  //             "Impossible de récupérer le token. Assurez-vous d'être sur le dashboard."
  //           );
  //         }
  //       }
  //     );
  //   });
  // });

  // // Vérifier si un token est déjà stocké pour activer le bouton
  // chrome.storage.local.get("ext_token", (data) => {
  //   if (data.ext_token) {
  //     analyzeBtn.disabled = false;
  //   }
  // });

  // Fonction pour envoyer les données au backend
  analyzeBtn.addEventListener("click", () => {
    const status = document.getElementById("status");
    const logs = document.getElementById("logs");
    let evaluationsContent = [];

    chrome.storage.local.get("ext_token", async (data) => {
      const status = document.getElementById("status");
      const logs = document.getElementById("logs");
      let evaluationsContent = [];

      // Fonction pour télécharger un fichier JSON
      function downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }

      try {
        status.innerHTML =
          '<span class="loading">🔄</span> Analyse de la boutique en cours...';
        status.className = "";
        logs.innerHTML = "";

        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        // Vérifier qu'on est sur une page Vinted
        if (!tab.url.includes("vinted.fr")) {
          throw new Error("Cette page n'est pas sur Vinted");
        }

        // 1. Faire défiler jusqu'en bas de la page des articles
        status.innerHTML =
          '<span class="loading">🔄</span> Chargement de tous les articles...';
        const scrollComplete = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: async () => {
            let lastHeight = document.body.scrollHeight;
            const MAX_CHARS = 15000;

            while (true) {
              // Vérifier le nombre de caractères actuels
              const currentText = document.body.innerText;
              if (currentText.length >= MAX_CHARS) {
                console.log("Limite de 15000 caractères atteinte");
                return { stopped: true, chars: currentText.length };
              }

              // Faire défiler jusqu'en bas
              window.scrollTo(0, document.body.scrollHeight);

              // Attendre que le contenu se charge
              await new Promise((resolve) => setTimeout(resolve, 1000));

              // Vérifier si on a atteint le bas
              const newHeight = document.body.scrollHeight;
              if (newHeight === lastHeight) {
                return {
                  stopped: false,
                  chars: document.body.innerText.length,
                };
              }
              lastHeight = newHeight;
            }
          },
        });

        if (!scrollComplete[0]?.result) {
          throw new Error("Erreur lors du défilement de la page");
        }

        // 2. Récupérer les informations du profil et des articles
        const contentResult = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const profileSection = document.querySelector("main");
            let profileText = "";

            if (profileSection) {
              const tempProfile = profileSection.cloneNode(true);
              const elementsToRemove = tempProfile.querySelectorAll(
                '.feed-grid, [class*="feed-grid"], [class*="catalog"], [class*="button"], script, style'
              );
              elementsToRemove.forEach((el) => el.remove());

              profileText = tempProfile.innerText
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line && !line.includes("Modifier mon profil"))
                .join("\n");

              const endIndex = profileText.indexOf("articles");
              if (endIndex !== -1) {
                profileText = profileText.substring(0, endIndex + 8);
              }
            }

            // Extract shop ratings
            const globalRating = document
              .querySelector(".rating-score-huge-text")
              ?.textContent.trim();
            const evaluationsCount = document
              .querySelector(
                '[data-testid="rating-button"] .web_ui__Text__body'
              )
              ?.textContent.trim()
              .match(/\d+/)?.[0];

            // Récupérer les articles
            const articles = Array.from(
              document.querySelectorAll(
                '[data-testid="grid-item"], [class*="feed-grid"] [class*="item-card"], .feed-grid__item'
              )
            );
            const articlesData = [];

            for (const article of articles) {
              try {
                const titleElement = article.querySelector(
                  '[data-testid*="description-title"], [class*="title"]'
                );
                const priceElement = article.querySelector(
                  '[data-testid*="price-text"], [class*="price"]:not([class*="protection"])'
                );
                const priceWithProtectionElement = article.querySelector(
                  'span.web_ui__Text__subtitle[class*="clickable"]'
                );
                const likesElement = article.querySelector(
                  '[data-testid*="--favourite"] span.web_ui__Text__caption'
                );

                const brand = titleElement?.textContent.trim() || "Inconnu";
                const price = priceElement
                  ? parseFloat(
                      priceElement.textContent
                        .trim()
                        .replace("€", "")
                        .replace(",", ".")
                    )
                  : 0;
                const priceWithProtection = priceWithProtectionElement
                  ? parseFloat(
                      priceWithProtectionElement.textContent
                        .trim()
                        .replace("€", "")
                        .replace(",", ".")
                    )
                  : price;
                const protectionFee =
                  priceWithProtection > price
                    ? parseFloat((priceWithProtection - price).toFixed(2))
                    : 0;
                const likes = likesElement
                  ? parseInt(likesElement.textContent.trim())
                  : 0;

                articlesData.push({
                  brand,
                  price,
                  priceWithProtection,
                  protectionFee,
                  likes,
                });
              } catch (e) {
                console.error("Erreur sur un article:", e);
              }
            }

            // Informations boutique
            const shopName = document
              .querySelector('[data-testid="profile-username"]')
              ?.textContent.trim();
            const location = document
              .querySelector('[data-testid="profile-location-info--content"]')
              ?.textContent.trim();
            const followers = document
              .querySelector('a[href*="/followers"]')
              ?.textContent.trim();
            const shopUrl = window.location.href;

            return {
              profile: profileText,
              articles: articlesData,
              shop: {
                name: shopName,
                location: location,
                followers: followers,
                url: shopUrl,
                globalRatings: {
                  count: evaluationsCount || "N/A",
                  rating: globalRating || "N/A",
                },
              },
            };
          },
        });

        if (!contentResult[0]?.result) {
          throw new Error("Impossible de copier le contenu");
        }

        const { profile, articles, shop } = contentResult[0].result;

        // Créer l'objet shopData initial
        const shopData = { articles, shop, evaluations: [] };

        status.textContent =
          "✅ Analyse terminée ! Chargement des évaluations...";

        // 3. Cliquer sur le lien "Évaluations"
        const clickEvaluationsResult = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const evaluationsLink = Array.from(
              document.querySelectorAll("*")
            ).find((el) => el.textContent.trim() === "Évaluations");
            if (evaluationsLink) {
              evaluationsLink.click();
              return true;
            }
            return false;
          },
        });

        if (!clickEvaluationsResult[0]?.result) {
          throw new Error('Impossible de trouver le lien "Évaluations"');
        }

        // Attendre que la page des évaluations charge
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Extraire les informations d'évaluation globales
        const ratingsInfo = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const globalRating = document
              .querySelector(".rating-score-huge-text")
              ?.textContent.trim();
            const evaluationsCount = document
              .querySelector(
                ".web_ui__Text__text.web_ui__Text__body.web_ui__Text__left"
              )
              ?.textContent.trim()
              .replace(/[()]/g, "");
            const memberRatingsCount = document
              .querySelector(
                ".web_ui__Text__text.web_ui__Text__body.web_ui__Text__left.web_ui__Text__bold"
              )
              ?.textContent.match(/\((\d+)\)/)?.[1];
            const autoRatingsCount = document
              .querySelectorAll(
                ".web_ui__Text__text.web_ui__Text__body.web_ui__Text__left.web_ui__Text__bold"
              )[1]
              ?.textContent.match(/\((\d+)\)/)?.[1];

            // Nouveaux sélecteurs pour les ratings
            const ratings = Array.from(
              document.querySelectorAll(
                ".web_ui__Cell__cell.web_ui__Cell__narrow .web_ui__Cell__image .u-flexbox span.web_ui__Text__text"
              )
            ).map((el) => el.textContent.trim());

            const memberRating = ratings[0] || "N/A";
            const autoRating = ratings[1] || "N/A";

            return {
              globalRatings: {
                count: evaluationsCount || "N/A",
                rating: globalRating || "N/A",
              },
              memberRatings: {
                count: memberRatingsCount,
                rating: memberRating,
              },
              autoRatings: {
                count: autoRatingsCount,
                rating: autoRating,
              },
            };
          },
        });

        if (!ratingsInfo[0]?.result) {
          throw new Error(
            "Impossible de récupérer les informations d'évaluation"
          );
        }

        // Mettre à jour l'objet shopData avec les nouvelles informations
        Object.assign(shopData.shop, ratingsInfo[0].result);

        const MAX_COMMENTS = 0; // Limite maximale de commentaires (0 pour illimité)

        // 4. Récupérer les évaluations
        const evaluationsContent = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: async (MAX_COMMENTS) => {
            const sleep = (ms) =>
              new Promise((resolve) => setTimeout(resolve, ms));
            let lastHeight = 0;
            let newHeight = document.body.scrollHeight;
            const comments = [];

            // Boucle de défilement jusqu'à ce que toutes les évaluations soient chargées ou que la limite soit atteinte
            while (
              newHeight > lastHeight &&
              (MAX_COMMENTS === 0 || comments.length < MAX_COMMENTS)
            ) {
              lastHeight = newHeight;
              window.scrollTo(0, document.body.scrollHeight);
              await sleep(1000); // Attendre que le contenu charge
              newHeight = document.body.scrollHeight;

              // Extraction des évaluations
              const newComments = Array.from(
                document.querySelectorAll('[data-testid="feedback-item"]')
              )
                .slice(
                  comments.length,
                  MAX_COMMENTS === 0 ? undefined : MAX_COMMENTS
                ) // Limiter les nouveaux commentaires si MAX_COMMENTS > 0
                .map((comment) => {
                  const memberName = comment
                    .querySelector('[data-testid="feedback-item--title"] a')
                    ?.textContent.trim();
                  const rating = comment
                    .querySelector(".web_ui__Rating__rating")
                    ?.getAttribute("aria-label")
                    .match(/(\d+(\.\d+)?)/)?.[0];
                  const content =
                    comment
                      .querySelector(
                        "span.web_ui__Text__text.web_ui__Text__body.web_ui__Text__left"
                      )
                      ?.textContent.trim() || "Pas de contenu";
                  const date = comment
                    .querySelector(
                      '[data-testid="feedback-item--subtitle"] span'
                    )
                    ?.getAttribute("title");

                  return {
                    memberName,
                    rating,
                    content,
                    date,
                  };
                });

              comments.push(...newComments);
            }

            return MAX_COMMENTS === 0
              ? comments
              : comments.slice(0, MAX_COMMENTS); // Retourner uniquement jusqu'à la limite si MAX_COMMENTS > 0
          },
          args: [MAX_COMMENTS],
        });

        if (!evaluationsContent[0]?.result) {
          throw new Error("Impossible de copier le contenu des évaluations");
        }

        const evaluations = evaluationsContent[0].result;
        downloadJSON(evaluations, "evaluations.json");

        // Mettre à jour les évaluations dans shopData
        shopData.evaluations = evaluations;

        if (shouldSave && ext_token) {
          // Envoyer les données au backend
          fetch("http://localhost:3001/api/ext/data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ext_token: data.ext_token,
              shopData: shopData,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
              }
              return response.text();
            })
            .then((responseText) => {
              console.log("Réponse brute du serveur:", responseText);
              // alert("Analyse envoyée !");
            })
            .catch((error) => {
              console.error("Erreur lors de l'envoi:", error);
              alert("Erreur lors de l'analyse.");
            });
        } else {
          // Sauvegarder les données dans le stockage Chrome
          chrome.storage.local.set({ shop_data: shopData }, () => {});
        }

        status.textContent = "✅ Terminé !";
        status.className = "success";
      } catch (error) {
        status.textContent = "❌ " + error.message;
        status.className = "error";
        addLog("Erreur : " + error.message);
      }
    });
  });

  // Gestionnaire pour envoyer les données sauvegardées localement
  sendSavedDataBtn.addEventListener("click", () => {
    chrome.storage.local.get("shop_data", (data) => {
      if (!data.shop_data) {
        alert("Aucune donnée sauvegardée trouvée.");
        return;
      }
      // Envoyer le message vers l'onglet actif (le content script le relayera vers la page)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "EXTENSION_DONNEES",
            data: data.shop_data,
          });
        }
      });
    });
  });
});
