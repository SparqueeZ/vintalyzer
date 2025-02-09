document.addEventListener('DOMContentLoaded', function() {
    const scanButton = document.getElementById('scanButton');
    const status = document.getElementById('status');
    const content = document.getElementById('content');
    const logs = document.getElementById('logs');
    let fullText = '';

    // Fonction pour ajouter un log
    function addLog(message) {
        const logLine = document.createElement('div');
        logLine.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
        logs.appendChild(logLine);
        logs.scrollTop = logs.scrollHeight; // Auto-scroll vers le bas
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    scanButton.addEventListener('click', async () => {
        try {
            status.innerHTML = '<span class="loading">🔄</span> Scan du profil et des articles en cours...';
            status.className = '';
            content.style.display = 'none';
            logs.innerHTML = ''; // Réinitialiser les logs

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Première étape : Profil et Articles
            const dressingResult = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: async () => {
                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }

                    // Nouvelle étape : Cliquer sur le bouton "Vendus"
                    const vendusButton = Array.from(document.querySelectorAll('button')).find(button => 
                        button.textContent.trim().toLowerCase() === 'vendus');
                    if (vendusButton) {
                        vendusButton.click();
                        await sleep(2000); // Attendre le chargement des articles vendus
                    }

                    // Récupérer le texte brut du profil
                    const mainContent = document.querySelector('main');
                    let profileText = '';
                    if (mainContent) {
                        // Créer une copie pour ne pas affecter la page
                        const tempMain = mainContent.cloneNode(true);
                        
                        // Retirer les éléments qu'on ne veut pas
                        const elementsToRemove = tempMain.querySelectorAll('.feed-grid, [class*="feed-grid"], [class*="catalog"], [class*="button"], script, style');
                        elementsToRemove.forEach(el => el.remove());
                        
                        // Récupérer le texte et le nettoyer
                        profileText = tempMain.innerText
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line && !line.includes('Modifier mon profil'))
                            .join('\n');

                        // Ne garder que jusqu'à "articles"
                        const endIndex = profileText.indexOf('articles');
                        if (endIndex !== -1) {
                            profileText = profileText.substring(0, endIndex + 'articles'.length);
                        }
                    }

                    // Scroll jusqu'en bas pour charger tous les articles
                    let lastHeight = 0;
                    let newHeight = document.documentElement.scrollHeight;
                    let attempts = 0;
                    let sameHeightCount = 0;

                    while (attempts < 50 && sameHeightCount < 3) {
                        lastHeight = newHeight;
                        window.scrollTo(0, lastHeight + window.innerHeight);
                        await sleep(800);
                        newHeight = document.documentElement.scrollHeight;
                        
                        if (lastHeight === newHeight) {
                            sameHeightCount++;
                        } else {
                            sameHeightCount = 0;
                        }
                        attempts++;
                    }

                    // Remonter en haut
                    window.scrollTo(0, 0);
                    await sleep(1000);

                    // Trouver tous les articles
                    const articles = Array.from(document.querySelectorAll('[data-testid="item-card"], [class*="feed-grid"] [class*="item-card"], .feed-grid__item'));
                    const articlesData = [];
                    const processedUrls = new Set();

                    for (const article of articles) {
                        try {
                            const link = article.querySelector('a[href*="/items/"], [class*="item-link"]');
                            if (!link) continue;
                            const url = link.href;
                            if (processedUrls.has(url)) continue;
                            processedUrls.add(url);

                            // Récupérer le texte brut de l'article pour les vues
                            const rawText = article.innerText;
                            const viewsMatch = rawText.match(/(\d+)\s*vues?/);
                            const views = viewsMatch ? viewsMatch[0] : '';

                            // Extraire les autres informations
                            const info = {
                                title: '',
                                isSold: false,
                                price: ''
                            };

                            info.title = link.getAttribute('title') || link.textContent.trim();
                            if (!info.title) {
                                const titleElement = article.querySelector('[class*="title"], [data-testid*="title"]');
                                if (titleElement) {
                                    info.title = titleElement.textContent.trim();
                                }
                            }
                            if (!info.title) continue;

                            info.isSold = article.textContent.toLowerCase().includes('vendu') || 
                                        article.querySelector('.status-label--sold, [data-testid*="sold"]') !== null;

                            const priceElement = article.querySelector('[class*="price"]:not([class*="protection"]), [data-testid*="price"]');
                            if (priceElement) {
                                info.price = priceElement.textContent.trim();
                            }

                            // Construire le texte final en incluant les vues
                            let formattedText = `${info.title}, ${info.price}\n`;
                            if (info.isSold) formattedText += 'Vendu\n';
                            if (views) formattedText += views + '\n';

                            articlesData.push(formattedText.trim());
                        } catch (e) {
                            console.error('Erreur sur un article:', e);
                        }
                    }

                    return profileText + '\n\n=== ARTICLES ===\n\n' + articlesData.join('\n\n');
                }
            });

            if (dressingResult && dressingResult[0] && dressingResult[0].result) {
                fullText = dressingResult[0].result;
                
                // Copier et afficher le résultat de la première étape
                await navigator.clipboard.writeText(fullText);
                content.textContent = fullText;
                content.style.display = 'block';
                status.textContent = '✅ Dressing scanné ! Passage aux évaluations...';
                status.className = 'success';

                // Deuxième étape : Évaluations
                await sleep(2000);
                status.innerHTML = '<span class="loading">🔄</span> Scan des évaluations en cours...';

                const evaluationsResult = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: async () => {
                        function sleep(ms) {
                            return new Promise(resolve => setTimeout(resolve, ms));
                        }

                        // Cliquer sur l'onglet évaluations (entre Dressing et Statistiques)
                        const evaluationsTab = Array.from(document.querySelectorAll('[class*="tabs"] button, [role="tab"]')).find(button => 
                            button.textContent.toLowerCase().includes('évaluation'));
                        
                        if (!evaluationsTab) {
                            console.log('Boutons disponibles:', Array.from(document.querySelectorAll('button')).map(b => b.textContent));
                            return '';
                        }
                        
                        evaluationsTab.click();
                        await sleep(2000);

                        // Scroll jusqu'en bas
                        let lastHeight = 0;
                        let newHeight = document.documentElement.scrollHeight;
                        let attempts = 0;
                        let sameHeightCount = 0;

                        while (attempts < 50 && sameHeightCount < 3) {
                            lastHeight = newHeight;
                            window.scrollTo(0, lastHeight + window.innerHeight);
                            await sleep(800);
                            newHeight = document.documentElement.scrollHeight;
                            
                            if (lastHeight === newHeight) {
                                sameHeightCount++;
                            } else {
                                sameHeightCount = 0;
                            }
                            attempts++;
                        }

                        await sleep(1000); // Attendre que tout soit bien chargé

                        // Sélectionner tout le texte (Ctrl+A)
                        document.body.focus();
                        document.execCommand('selectAll');
                        
                        // Récupérer le texte sélectionné
                        const selection = window.getSelection();
                        const evaluationsText = selection.toString();
                        
                        // Désélectionner
                        selection.removeAllRanges();

                        // Retourner sur l'onglet dressing
                        const dressingTab = Array.from(document.querySelectorAll('[class*="tabs"] button, [role="tab"]')).find(button => 
                            button.textContent.toLowerCase().includes('dressing'));
                        if (dressingTab) {
                            dressingTab.click();
                            await sleep(2000);
                        }

                        return evaluationsText;
                    }
                });

                if (evaluationsResult && evaluationsResult[0] && evaluationsResult[0].result) {
                    fullText += '\n\n=== EVALUATIONS ===\n\n' + evaluationsResult[0].result;
                    
                    // Copier et afficher le résultat intermédiaire
                    await navigator.clipboard.writeText(fullText);
                    content.textContent = fullText;

                    // Troisième étape : Porte-monnaie
                    status.innerHTML = '<span class="loading">🔄</span> Accès au porte-monnaie en cours...';
                    await sleep(2000);

                    // 1. Cliquer sur le bouton rond de profil en haut à droite
                    const profileResult = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            // Chercher le bouton de profil en haut à droite
                            const findProfileButton = () => {
                                // Chercher dans le header/nav
                                const header = document.querySelector('header, nav');
                                if (header) {
                                    // Chercher les boutons ronds avec image dans le header
                                    const buttons = header.querySelectorAll('button, div[role="button"]');
                                    for (const button of buttons) {
                                        // Vérifier si le bouton contient une image
                                        if (button.querySelector('img')) {
                                            return button;
                                        }
                                    }
                                }

                                // Autres tentatives si la première méthode échoue
                                return document.querySelector('button[data-testid*="menu"]') || // Chercher par data-testid
                                       document.querySelector('button:has(img[alt*="avatar"])') || // Chercher un bouton avec une image avatar
                                       document.querySelector('header button:has(img)'); // N'importe quel bouton avec image dans le header
                            };

                            const profileButton = findProfileButton();
                            console.log('Bouton profil trouvé:', profileButton);
                            
                            if (profileButton) {
                                profileButton.click();
                                return { success: true, message: 'Bouton profil trouvé et cliqué' };
                            }
                            return { success: false, message: 'Bouton profil non trouvé' };
                        }
                    });

                    if (!profileResult[0]?.result?.success) {
                        throw new Error('Impossible de trouver le bouton profil');
                    }
                    status.textContent = '✅ Bouton profil trouvé !';
                    addLog('Bouton profil trouvé, chargement du menu...');
                    
                    // Attendre que le menu s'ouvre
                    await sleep(1000);

                    // 2. Cliquer sur "Mon porte-monnaie"
                    status.innerHTML = '<span class="loading">🔄</span> Recherche du lien porte-monnaie...';
                    const walletResult = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            const findWalletLink = () => {
                                const links = Array.from(document.querySelectorAll('a, button, div[role="button"]'));
                                for (const link of links) {
                                    const text = link.textContent.toLowerCase().trim();
                                    if (text.includes('porte-monnaie') || text.includes('porte monnaie') || text.includes('wallet')) {
                                        return link;
                                    }
                                }
                                return null;
                            };

                            const walletLink = findWalletLink();
                            if (walletLink) {
                                walletLink.click();
                                return { success: true, message: 'Lien porte-monnaie trouvé et cliqué' };
                            }
                            return { success: false, message: 'Lien porte-monnaie non trouvé' };
                        }
                    });

                    if (!walletResult[0]?.result?.success) {
                        throw new Error('Impossible de trouver le lien du porte-monnaie');
                    }
                    status.textContent = '✅ Lien porte-monnaie trouvé !';
                    addLog('Lien porte-monnaie trouvé, chargement de la page...');
                    
                    // Attendre que la page du porte-monnaie charge
                    await sleep(2000);

                    // 3. Cliquer sur "Historique"
                    status.innerHTML = '<span class="loading">🔄</span> Recherche de l\'historique...';
                    const historyResult = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            // Cliquer sur l'onglet historique de plusieurs façons
                            const historyLink = 
                                // 1. Chercher un lien direct
                                document.querySelector('a[href*="historique"]') ||
                                // 2. Chercher un bouton avec le texte exact
                                Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === 'Historique') ||
                                // 3. Chercher un lien avec le texte exact
                                Array.from(document.querySelectorAll('a')).find(el => el.textContent.trim() === 'Historique') ||
                                // 4. Chercher un élément avec role="tab" et le texte
                                Array.from(document.querySelectorAll('[role="tab"]')).find(el => el.textContent.trim() === 'Historique') ||
                                // 5. Chercher n'importe quel élément cliquable
                                Array.from(document.querySelectorAll('a, button, [role="button"]')).find(el => el.textContent.trim() === 'Historique');

                            if (historyLink) {
                                historyLink.click();
                                return { success: true, message: 'Lien historique trouvé et cliqué' };
                            }

                            return { success: false, message: 'Lien historique non trouvé' };
                        }
                    });

                    if (!historyResult[0]?.result?.success) {
                        throw new Error('Impossible de trouver le lien historique');
                    }
                    status.textContent = '✅ Historique trouvé !';
                    addLog('Historique trouvé, chargement de la page...');
                    
                    // Attendre que la page historique charge
                    await sleep(2000);

                    // Analyser tous les mois disponibles
                    status.innerHTML = '<span class="loading">🔄</span> Analyse des mois disponibles...';
                    const availableMonths = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            // Trouver tous les liens d'historique
                            const historyLinks = Array.from(document.querySelectorAll('a')).filter(link => {
                                return link.href.includes('wallet/history/') && 
                                       /\d{4}\/\d{1,2}$/.test(link.href) && // Vérifie que ça finit par ANNÉE/MOIS
                                       !link.href.includes('#'); // Évite les ancres
                            });
                            
                            // Extraire les années et mois des URLs
                            const months = historyLinks.map(link => {
                                const match = link.href.match(/history\/(\d{4})\/(\d{1,2})/);
                                if (match) {
                                    const result = {
                                        year: parseInt(match[1]),
                                        month: parseInt(match[2]),
                                        href: link.href,
                                        text: link.textContent.trim()
                                    };
                                    console.log('Mois trouvé:', result);
                                    return result;
                                }
                                return null;
                            }).filter(m => m !== null);

                            console.log('Nombre de mois trouvés:', months.length);

                            // Trier par année décroissante puis mois décroissant
                            return months.sort((a, b) => {
                                if (a.year !== b.year) return b.year - a.year;
                                return b.month - a.month;
                            });
                        }
                    });

                    const months = availableMonths[0]?.result || [];
                    addLog(`${months.length} mois trouvés`);
                    months.forEach(m => addLog(`- ${m.text} ${m.year}`));

                    if (months.length === 0) {
                        throw new Error('Aucun mois trouvé');
                    }

                    // Parcourir chaque mois
                    for (const monthData of months) {
                        status.innerHTML = `<span class="loading">🔄</span> Traitement de ${monthData.text} ${monthData.year}...`;
                        addLog(`Traitement de ${monthData.text} ${monthData.year}...`);
                        
                        // Cliquer sur le mois
                        const clickResult = await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: (monthData) => {
                                // Chercher le lien exact
                                const monthLinks = Array.from(document.querySelectorAll('a')).filter(a => 
                                    a.href === monthData.href || 
                                    a.href.endsWith(monthData.href.split('wallet/history/')[1])
                                );
                                console.log('Liens trouvés pour', monthData.text, ':', monthLinks);
                                
                                if (monthLinks.length > 0) {
                                    monthLinks[0].click();
                                    return { success: true };
                                }
                                return { success: false };
                            },
                            args: [monthData]
                        });

                        if (!clickResult[0]?.result?.success) {
                            addLog(`⚠️ Impossible de cliquer sur ${monthData.text} ${monthData.year}`);
                            continue;
                        }

                        addLog(`Clic sur ${monthData.text} réussi, chargement...`);
                        await sleep(2000);

                        // Copier le contenu
                        const pageContent = await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: () => document.body.innerText
                        });

                        if (pageContent && pageContent[0]?.result) {
                            fullText += `\n\n=== TRANSACTIONS ${monthData.text.toUpperCase()} ${monthData.year} ===\n${pageContent[0].result}`;
                            content.style.display = 'block';
                            content.textContent = fullText;
                            await navigator.clipboard.writeText(fullText);
                            addLog(`✅ Contenu copié pour ${monthData.text}`);
                        }
                    }

                    status.textContent = '✅ Tous les mois ont été traités !';
                    status.className = 'success';
                }
            } else {
                throw new Error('Aucun contenu trouvé');
            }
        } catch (error) {
            console.error('Erreur complète:', error);
            status.textContent = '❌ Erreur : ' + error.message;
            status.className = 'error';
        }
    });
});
