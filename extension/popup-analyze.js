// Gestionnaire pour le bouton d'analyse
document.getElementById('analyzeButton').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const content = document.getElementById('content');
    const logs = document.getElementById('logs');
    let fullText = ''; // Changé de const à let

    try {
        status.innerHTML = '<span class="loading">🔄</span> Analyse de la boutique en cours...';
        status.className = '';
        content.style.display = 'none';
        logs.innerHTML = '';

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Vérifier qu'on est sur une page Vinted
        if (!tab.url.includes('vinted.fr')) {
            throw new Error('Cette page n\'est pas sur Vinted');
        }

        // 1. Faire défiler jusqu'en bas
        status.innerHTML = '<span class="loading">🔄</span> Chargement de tous les articles...';
        
        const scrollComplete = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async () => {
                let lastHeight = document.body.scrollHeight;
                const MAX_CHARS = 15000;
                
                while (true) {
                    // Vérifier le nombre de caractères actuels
                    const currentText = document.body.innerText;
                    if (currentText.length >= MAX_CHARS) {
                        console.log('Limite de 15000 caractères atteinte');
                        return { 
                            stopped: true, 
                            chars: currentText.length 
                        };
                    }

                    // Faire défiler jusqu'en bas
                    window.scrollTo(0, document.body.scrollHeight);
                    
                    // Attendre que le contenu se charge
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Vérifier si on a atteint le bas
                    const newHeight = document.body.scrollHeight;
                    if (newHeight === lastHeight) {
                        return { 
                            stopped: false, 
                            chars: document.body.innerText.length 
                        };
                    }
                    lastHeight = newHeight;
                }
            }
        });

        if (!scrollComplete[0]?.result) {
            throw new Error('Erreur lors du défilement de la page');
        }

        // 2. Copier tout le contenu
        const contentResult = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Récupérer le texte brut du profil
                const profileSection = document.querySelector('main');
                let profileText = '';
                
                if (profileSection) {
                    // Créer une copie pour manipuler sans affecter la page
                    const tempProfile = profileSection.cloneNode(true);
                    
                    // Supprimer les éléments qu'on ne veut pas inclure
                    const elementsToRemove = tempProfile.querySelectorAll(
                        '.feed-grid, [class*="feed-grid"], [class*="catalog"], [class*="button"], script, style'
                    );
                    elementsToRemove.forEach(el => el.remove());
                    
                    // Extraire le texte et nettoyer
                    profileText = tempProfile.innerText
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line && !line.includes('Modifier mon profil'))
                        .join('\n');
                    
                    // Ne garder que jusqu'à "articles"
                    const endIndex = profileText.indexOf('articles');
                    if (endIndex !== -1) {
                        profileText = profileText.substring(0, endIndex + 8);
                    }
                }

                // Trouver tous les articles
                const articles = Array.from(document.querySelectorAll('[data-testid="item-card"], [class*="feed-grid"] [class*="item-card"], .feed-grid__item'));
                const articlesData = [];

                for (const article of articles) {
                    try {
                        // Récupérer la marque (titre)
                        const titleElement = article.querySelector('[class*="title"], [data-testid*="title"]');
                        if (!titleElement) continue;
                        const marque = titleElement.textContent.trim();

                        // Récupérer le prix
                        const priceElement = article.querySelector('[class*="price"]:not([class*="protection"]), [data-testid*="price"]');
                        if (!priceElement) continue;
                        const prix = priceElement.textContent.trim();

                        // Format : "marque : prix"
                        articlesData.push(`marque : ${marque}, prix : ${prix}`);
                    } catch (e) {
                        console.error('Erreur sur un article:', e);
                    }
                }

                return {
                    profile: profileText,
                    articles: articlesData.join('\n')
                };
            }
        });

        if (!contentResult[0]?.result) {
            throw new Error('Impossible de copier le contenu');
        }

        // Afficher le contenu
        const { profile, articles } = contentResult[0].result;
        fullText = `=== PROFIL ===\n${profile}\n\n=== ARTICLES ===\n${articles}`;
        const charCount = fullText.length;
        const stoppedEarly = scrollComplete[0].result.stopped;
        
        fullText += `\n\n=== ANALYSE DE LA BOUTIQUE ===\n` +
                  `Nombre de caractères : ${charCount.toLocaleString()}\n` +
                  (stoppedEarly ? '(Arrêté à 15000 caractères)\n' : '') +
                  `\n`;
        
        content.style.display = 'block';
        content.textContent = fullText;
        await navigator.clipboard.writeText(fullText);

        status.textContent = '✅ Analyse terminée ! Chargement des évaluations...';
        
        // Cliquer sur le lien Évaluations
        const clickResult = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Chercher tous les éléments qui pourraient être des onglets
                const allElements = document.querySelectorAll('*');
                for (const el of allElements) {
                    // Si le texte est exactement "Évaluations"
                    if (el.textContent.trim() === 'Évaluations') {
                        console.log('Élément trouvé:', el);
                        // Remonter jusqu'à trouver un élément cliquable
                        let current = el;
                        while (current && current !== document.body) {
                            if (current.tagName === 'A' || current.tagName === 'BUTTON' || 
                                current.onclick || current.getAttribute('role') === 'button' ||
                                current.className.includes('button') || current.className.includes('tab')) {
                                current.click();
                                return true;
                            }
                            current = current.parentElement;
                        }
                        // Si on trouve le texte mais pas d'élément cliquable, cliquer directement
                        el.click();
                        return true;
                    }
                }
                return false;
            }
        });

        if (!clickResult[0]?.result) {
            throw new Error('Impossible de trouver le lien Évaluations');
        }

        // Attendre que la page des évaluations charge
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Faire défiler la page des évaluations
        status.innerHTML = '<span class="loading">🔄</span> Chargement des évaluations...';
        const scrollEvaluations = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async () => {
                let lastHeight = document.body.scrollHeight;
                let attempts = 0;
                const maxAttempts = 50; // Pour éviter une boucle infinie
                
                while (attempts < maxAttempts) {
                    // Faire défiler jusqu'en bas
                    window.scrollTo(0, document.body.scrollHeight);
                    
                    // Attendre que le contenu se charge
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Vérifier si on a atteint le bas
                    const newHeight = document.body.scrollHeight;
                    if (newHeight === lastHeight) {
                        attempts++;
                        if (attempts >= 3) { // 3 tentatives sans changement = on est au bas
                            break;
                        }
                    } else {
                        attempts = 0; // Réinitialiser si la hauteur change
                        lastHeight = newHeight;
                    }
                }
                
                // Remonter en haut
                window.scrollTo(0, 0);
                return true;
            }
        });

        // Copier le contenu des évaluations
        const evaluationsContent = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText
        });

        if (evaluationsContent[0]?.result) {
            // Ajouter les évaluations au texte existant
            fullText += '\n\n=== ÉVALUATIONS ===\n' + evaluationsContent[0].result;
            content.textContent = fullText;
            await navigator.clipboard.writeText(fullText);
        }

        status.textContent = '✅ Terminé !';
        status.className = 'success';

    } catch (error) {
        status.textContent = '❌ ' + error.message;
        status.className = 'error';
        addLog('Erreur : ' + error.message);
    }
});
