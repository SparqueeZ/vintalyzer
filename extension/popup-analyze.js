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
            func: () => document.body.innerText
        });

        if (!contentResult[0]?.result) {
            throw new Error('Impossible de copier le contenu');
        }

        // Afficher le contenu
        const extractedText = contentResult[0].result;
        const charCount = extractedText.length;
        const stoppedEarly = scrollComplete[0].result.stopped;
        
        fullText = `=== ANALYSE DE LA BOUTIQUE ===\n` +
                  `Nombre de caractères : ${charCount.toLocaleString()}\n` +
                  (stoppedEarly ? '(Arrêté à 15000 caractères)\n' : '') +
                  `\n${extractedText}`;
        
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
