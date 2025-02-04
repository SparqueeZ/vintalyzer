import { patterns, extractors } from './regexPatterns';
import { languagePatterns, exclusionPatterns } from './languagePatterns';

const transformers = {
    parsePrice(priceStr: string): number {
        return parseFloat(priceStr.replace(',', '.'));
    },
    formatDate(dateStr: string): string {
        if (/^\d{1,2} \w+ 2024$/.test(dateStr)) {
            return dateStr;
        }
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
};

export class VintedAnalyzer {
    private text: string;
    private result: any;

    constructor(text: string) {
        this.text = text;
        this.result = {
            boutique: {
                nom: '',
                username: '',
                localisation: {
                    ville: '',
                    pays: ''
                },
                contact: {
                    email: '',
                    telephone: ''
                },
                entreprise: {
                    numero: '',
                    rcs: {
                        numero: '',
                        ville: ''
                    }
                },
                stats: {
                    abonnes: 0,
                    articlesActifs: 0,
                    note: 0,
                    ventesParPays: {
                        italie: 0,
                        espagne: 0,
                        allemagne: 0,
                        republiqueTcheque: 0,
                        lituanie: 0,
                        paysBas: 0,
                        royaumeUni: 0
                    }
                }
            },
            marketing: {
                boosts: [],
                dressingVitrine: []
            },
            finances: {
                transferts: [],
                soldeActuel: 0
            },
            ventes: [],
            ventes_stat: [],
            depenses: []
        };
    }

    analyze() {
        try {
            console.group('🎯 ANALYSE DE VOTRE BOUTIQUE VINTED');
            console.log('📅 Date de l\'analyse:', new Date().toLocaleString());
            console.log('📝 Longueur du texte:', this.text.length.toLocaleString(), 'caractères');
            console.log('');
            
            this._extractBoutiqueInfo();
            this._extractVentes();
            this._extractMarketing();
            this._extractFinances();
            this._extractDepenses();

            // Calculs des totaux
            const totalVentes = this.result.ventes.length;
            const chiffreAffaires = this.result.ventes.reduce((sum, v) => sum + v.prix, 0);
            const prixMoyen = chiffreAffaires / totalVentes;
            const totalDepenses = this.result.depenses.reduce((sum, d) => sum + d.montant, 0);
            const beneficeNet = chiffreAffaires - totalDepenses;

            console.group('📊 RÉSUMÉ DE L\'ANALYSE');

            console.group('🏪 Informations Boutique');
            console.log('👤 Nom:', this.result.boutique.nom);
            console.log('🔖 Username:', this.result.boutique.username);
            console.log('📍 Localisation:', this.result.boutique.localisation);
            console.log('📱 Contact:', this.result.boutique.contact);
            console.log('⭐ Note:', '★'.repeat(Math.round(this.result.boutique.note)), `(${this.result.boutique.note}/5)`);
            console.log('👥 Abonnés:', this.result.boutique.abonnes?.toLocaleString() || 0);
            console.log('👕 Articles en vente:', this.result.boutique.articles?.toLocaleString() || 0);
            console.groupEnd();

            console.group('💰 Ventes');
            console.log('📈 Statistiques globales:');
            console.log('   • Nombre total de ventes:', totalVentes.toLocaleString());
            console.log('   • Chiffre d\'affaires:', chiffreAffaires.toFixed(2) + '€');
            console.log('   • Prix moyen de vente:', prixMoyen.toFixed(2) + '€');
            
            if (this.result.ventes.length > 0) {
                console.log('\n🔄 Dernières ventes:');
                this.result.ventes.slice(-5).forEach((vente, index) => {
                    console.log(`   ${index + 1}. ${vente.nom} - ${vente.prix.toFixed(2)}€ (${vente.date})`);
                });
            }
            console.groupEnd();

            console.group('📢 Marketing');
            console.log('🚀 Boosts:');
            console.log('   • Total utilisés:', this.result.marketing.boosts.length);
            if (this.result.marketing.boosts.length > 0) {
                console.log('   • Derniers boosts:');
                this.result.marketing.boosts.slice(-3).forEach((boost, index) => {
                    console.log(`     ${index + 1}. ${boost.article} - ${boost.montant.toFixed(2)}€ (${boost.date})`);
                });
            }

            console.log('\n🎪 Dressing en vitrine:');
            console.log('   • Articles en vitrine:', this.result.marketing.dressingVitrine.length);
            if (this.result.marketing.dressingVitrine.length > 0) {
                console.log('   • Articles actuels:');
                this.result.marketing.dressingVitrine.slice(-3).forEach((article, index) => {
                    console.log(`     ${index + 1}. ${article.nom} - ${article.prix.toFixed(2)}€ (${article.date})`);
                });
            }
            console.groupEnd();

            console.group('💶 Finances');
            console.log('💳 Solde actuel:', this.result.finances.soldeActuel.toFixed(2) + '€');
            console.log('🏦 Transferts:');
            console.log('   • Nombre total:', this.result.finances.transferts.length);
            if (this.result.finances.transferts.length > 0) {
                console.log('   • Derniers transferts:');
                this.result.finances.transferts.slice(-3).forEach((transfert, index) => {
                    console.log(`     ${index + 1}. ${transfert.montant.toFixed(2)}€ (${transfert.date})`);
                });
            }
            console.groupEnd();

            console.group('📋 RÉSUMÉ GLOBAL');
            console.log('💰 Chiffre d\'affaires total:', chiffreAffaires.toFixed(2) + '€');
            console.log('💸 Total des dépenses:', totalDepenses.toFixed(2) + '€');
            console.log('📈 Bénéfice net:', beneficeNet.toFixed(2) + '€');
            console.log('🎯 Taux de marge:', ((beneficeNet / chiffreAffaires) * 100).toFixed(1) + '%');
            console.groupEnd();

            console.groupEnd(); // Fin du résumé
            console.groupEnd(); // Fin de l'analyse

            return this.result;
        } catch (error) {
            console.error('❌ Erreur lors de l\'analyse:', error);
            throw error;
        }
    }

    private _extractBoutiqueInfo() {
        console.group('📊 Extraction info boutique');
        
        const boutiqueInfo = {
            username: extractors.extract(patterns.username, this.text) || '',
            nom: extractors.extract(patterns.nom, this.text) || '',
            localisation: this._extractLocalization(),
            email: extractors.extract(patterns.email, this.text) || '',
            telephone: extractors.extract(patterns.telephone, this.text) || '',
        };

        this.result.boutique.username = boutiqueInfo.username;
        this.result.boutique.nom = boutiqueInfo.nom;
        this.result.boutique.localisation = boutiqueInfo.localisation;
        this.result.boutique.contact.email = boutiqueInfo.email;
        this.result.boutique.contact.telephone = boutiqueInfo.telephone;

        const rcsMatch = this.text.match(patterns.rcs);
        if (rcsMatch) {
            this.result.boutique.entreprise.rcs.numero = rcsMatch[1];
            this.result.boutique.entreprise.rcs.ville = rcsMatch[2].trim();
        }

        this.result.boutique.stats.abonnes = parseInt(extractors.extract(patterns.abonnes, this.text) || '0');
        this.result.boutique.stats.articlesActifs = parseInt(extractors.extract(patterns.articlesActifs, this.text) || '0');

        const note = extractors.extract(patterns.note, this.text);
        if (note) {
            this.result.boutique.stats.note = parseFloat(note);
        }

        const commentaires = [];
        let match;
        while ((match = patterns.commentaire.exec(this.text)) !== null) {
            commentaires.push(match[1]);
        }

        const ventesParPays = this._analyserLanguesCommentaires(commentaires);
        this.result.boutique.stats.ventesParPays = ventesParPays;

        console.log('Info boutique extraites:', this.result.boutique);
        console.groupEnd();
    }

    private _extractLocalization() {
        const match = this.text.match(patterns.localisation);
        if (match && match[1] && match[2]) {
            return {
                ville: match[1].trim(),
                pays: match[2].trim()
            };
        }
        return {
            ville: '',
            pays: ''
        };
    }

    private _analyserLanguesCommentaires(commentaires: string[]) {
        console.group('🔍 Analyse des commentaires par pays');
        
        const ventesParPays = {
            italie: 0,
            espagne: 0,
            allemagne: 0,
            republiqueTcheque: 0,
            lituanie: 0,
            paysBas: 0,
            royaumeUni: 0
        };

        commentaires.forEach((commentaire, index) => {
            console.group(`Analyse du commentaire #${index + 1}`);
            console.log('Commentaire:', commentaire);
            
            if (commentaire.includes("Évaluation automatique")) {
                console.log('⏭️ Évaluation automatique ignorée');
                console.groupEnd();
                return;
            }
            
            let matchCount: { [key: string]: number } = {};
            
            Object.entries(languagePatterns).forEach(([pays, { pattern }]) => {
                const matches = (commentaire.match(pattern) || []).length;
                if (matches > 0) {
                    matchCount[pays] = matches;
                }
            });

            if (Object.keys(matchCount).length > 0) {
                const [langueDetectee] = Object.entries(matchCount)
                    .sort(([,a], [,b]) => b - a)[0];

                if (langueDetectee === 'anglais') {
                    if (exclusionPatterns.anglais.test(commentaire)) {
                        ventesParPays.paysBas++;
                        console.log('✅ Détecté: Pays-Bas');
                    } else {
                        ventesParPays.royaumeUni++;
                        console.log('✅ Détecté: Royaume-Uni');
                    }
                } else if (langueDetectee in ventesParPays) {
                    ventesParPays[langueDetectee as keyof typeof ventesParPays]++;
                    console.log(`✅ Détecté: ${langueDetectee}`);
                }
            } else {
                console.log('❌ Aucun pays détecté');
            }
            
            console.groupEnd();
        });

        console.log('📊 Résumé des ventes par pays:', ventesParPays);
        console.groupEnd();
        
        return ventesParPays;
    }

    private _extractVentes() {
        console.group('💰 Extraction des ventes');
        
        // 1. Extraction des ventes confirmées (pour CA)
        const ventesMatches = extractors.extractAll(patterns.venteAvecDate, this.text);
        console.log('📊 Ventes confirmées trouvées:', ventesMatches.length);
        ventesMatches.forEach((match, i) => {
            console.log(`Match ${i + 1}:`, {
                full: match[0],
                nom: match[1],
                prix: match[2],
                date: match[3]
            });
        });

        this.result.ventes = ventesMatches.map(match => ({
            nom: match[1].trim(),
            prix: transformers.parsePrice(match[2]),
            date: transformers.formatDate(match[3])
        }));

        // 2. Extraction des stats de vente
        console.group('🔍 Débogage extraction stats');
        console.log('Pattern venteStat:', patterns.venteStat);
        
        // Recherche d'un exemple de texte qui pourrait correspondre
        const texteSample = this.text.slice(0, 1000);
        console.log('Échantillon de texte à analyser:', texteSample);
        
        const ventesStatMatches = extractors.extractAll(patterns.venteStat, this.text);
        console.log('📈 Stats de ventes trouvées:', ventesStatMatches.length);
        
        if (ventesStatMatches.length > 0) {
            console.log('Premier match trouvé:', ventesStatMatches[0]);
        } else {
            console.log('❌ Aucun match trouvé pour les stats');
            // Recherche de motifs similaires
            const simpleVuesPattern = /(\d+)\s*vues/g;
            const vuesMatches = this.text.match(simpleVuesPattern);
            console.log('Nombre de "vues" trouvées avec pattern simple:', vuesMatches ? vuesMatches.length : 0);
            if (vuesMatches) {
                console.log('Exemples de matches "vues":', vuesMatches.slice(0, 3));
            }
        }
        console.groupEnd();

        this.result.ventes_stat = ventesStatMatches.map(match => ({
            nom: match[1].trim(),
            prix: transformers.parsePrice(match[2]),
            marque: match[3].trim(),
            vues: match[4],
            favoris: match[5]
        }));

        // Résumé comparatif des deux types de ventes
        console.group('🔄 Comparaison des deux types de ventes');
        console.log('1. Ventes confirmées (transactions réelles):', {
            nombre: this.result.ventes.length,
            caracteristiques: [
                'Prix de vente réel',
                'Date de vente',
                'Nom de l\'article'
            ],
            exemple: this.result.ventes[0] || 'Aucune vente'
        });

        console.log('2. Articles avec statistiques:', {
            nombre: this.result.ventes_stat.length,
            caracteristiques: [
                'Prix affiché',
                'Marque',
                'Nombre de vues',
                'Nombre de favoris',
                'Nom de l\'article'
            ],
            exemple: this.result.ventes_stat[0] || 'Aucune stat'
        });

        // Analyse du chevauchement
        const articlesCommuns = this.result.ventes.filter(vente => 
            this.result.ventes_stat.some(stat => stat.nom === vente.nom)
        );

        console.log('Analyse du chevauchement:', {
            ventesAvecStats: articlesCommuns.length,
            pourcentageVentesAvecStats: ((articlesCommuns.length / this.result.ventes.length) * 100).toFixed(2) + '%',
            ventesUniques: this.result.ventes.length - articlesCommuns.length,
            statsUniques: this.result.ventes_stat.length - articlesCommuns.length
        });
        console.groupEnd();

        // Afficher les résumés
        console.group('📅 Ventes réelles (transactions validées)');
        console.log('Nombre total de ventes:', this.result.ventes.length);
        if (this.result.ventes.length > 0) {
            console.table(this.result.ventes);
            const totalCA = this.result.ventes.reduce((sum, v) => sum + v.prix, 0);
            console.log('Chiffre d\'affaires total:', totalCA.toFixed(2) + '€');
            console.log('Prix moyen de vente:', (totalCA / this.result.ventes.length).toFixed(2) + '€');

            // Analyse des ventes par marque
            const ventesParMarque = this.result.ventes.reduce((acc: any, vente) => {
                // Chercher la marque dans les stats de vente
                const statArticle = this.result.ventes_stat.find(stat => stat.nom === vente.nom);
                const marque = statArticle ? statArticle.marque : 'Non spécifié';
                
                if (!acc[marque]) {
                    acc[marque] = {
                        nombreVentes: 0,
                        totalCA: 0,
                        ventes: [],
                        vues: 0,
                        favoris: 0
                    };
                }
                
                acc[marque].nombreVentes++;
                acc[marque].totalCA += vente.prix;
                acc[marque].ventes.push(vente);
                
                if (statArticle) {
                    acc[marque].vues += parseInt(statArticle.vues);
                    acc[marque].favoris += parseInt(statArticle.favoris);
                }
                
                return acc;
            }, {});

            console.group('📊 Analyse des ventes par marque');
            Object.entries(ventesParMarque).forEach(([marque, stats]: [string, any]) => {
                console.log(`\n${marque}:`, {
                    nombreVentes: stats.nombreVentes,
                    chiffreAffaires: stats.totalCA.toFixed(2) + '€',
                    prixMoyenVente: (stats.totalCA / stats.nombreVentes).toFixed(2) + '€',
                    vuesMoyennes: stats.vues > 0 ? (stats.vues / stats.nombreVentes).toFixed(1) : 'N/A',
                    favorisMoyens: stats.favoris > 0 ? (stats.favoris / stats.nombreVentes).toFixed(1) : 'N/A',
                    tauxConversion: stats.vues > 0 ? ((stats.favoris / stats.vues) * 100).toFixed(2) + '%' : 'N/A'
                });
                
                console.group('Détail des ventes');
                console.table(stats.ventes.map((v: any) => ({
                    nom: v.nom,
                    prix: v.prix.toFixed(2) + '€',
                    date: v.date
                })));
                console.groupEnd();
            });
            console.groupEnd();

            // Top 5 marques par CA
            console.log('\nTop 5 marques par chiffre d\'affaires:');
            console.table(
                Object.entries(ventesParMarque)
                    .map(([marque, stats]: [string, any]) => ({
                        marque,
                        nombreVentes: stats.nombreVentes,
                        chiffreAffaires: stats.totalCA.toFixed(2) + '€',
                        prixMoyenVente: (stats.totalCA / stats.nombreVentes).toFixed(2) + '€',
                        tauxConversion: stats.vues > 0 ? ((stats.favoris / stats.vues) * 100).toFixed(2) + '%' : 'N/A'
                    }))
                    .sort((a: any, b: any) => parseFloat(b.chiffreAffaires) - parseFloat(a.chiffreAffaires))
                    .slice(0, 5)
            );
        }
        console.groupEnd();

        console.group('📊 Statistiques des articles par marque');
        console.log('Nombre total d\'articles avec stats:', this.result.ventes_stat.length);
        
        // Regrouper par marque
        const statsParMarque = this.result.ventes_stat.reduce((acc: any, article) => {
            const marque = article.marque || 'Non spécifié';
            if (!acc[marque]) {
                acc[marque] = {
                    nombreArticles: 0,
                    totalPrix: 0,
                    totalVues: 0,
                    totalFavoris: 0,
                    articles: []
                };
            }
            acc[marque].nombreArticles++;
            acc[marque].totalPrix += article.prix;
            acc[marque].totalVues += parseInt(article.vues);
            acc[marque].totalFavoris += parseInt(article.favoris);
            acc[marque].articles.push(article);
            return acc;
        }, {});

        // Afficher les stats pour chaque marque
        Object.entries(statsParMarque).forEach(([marque, stats]: [string, any]) => {
            console.log(`\n🏷️ ${marque}:`, {
                nombreArticles: stats.nombreArticles,
                prixTotal: stats.totalPrix.toFixed(2) + '€',
                prixMoyen: (stats.totalPrix / stats.nombreArticles).toFixed(2) + '€',
                vuesTotal: stats.totalVues,
                vuesMoyennes: (stats.totalVues / stats.nombreArticles).toFixed(1),
                favorisTotal: stats.totalFavoris,
                favorisMoyens: (stats.totalFavoris / stats.nombreArticles).toFixed(1),
                tauxEngagement: ((stats.totalFavoris / stats.totalVues) * 100).toFixed(2) + '%'
            });

            console.group('📝 Détail des articles');
            console.table(stats.articles.map((a: any) => ({
                nom: a.nom,
                prix: a.prix.toFixed(2) + '€',
                vues: a.vues,
                favoris: a.favoris
            })));
            console.groupEnd();
        });

        // Top 5 marques par vues
        console.log('\n🔝 Top 5 marques par vues:');
        console.table(
            Object.entries(statsParMarque)
                .map(([marque, stats]: [string, any]) => ({
                    marque,
                    nombreArticles: stats.nombreArticles,
                    vuesTotal: stats.totalVues,
                    vuesMoyennes: (stats.totalVues / stats.nombreArticles).toFixed(1),
                    tauxEngagement: ((stats.totalFavoris / stats.totalVues) * 100).toFixed(2) + '%'
                }))
                .sort((a: any, b: any) => b.vuesTotal - a.vuesTotal)
                .slice(0, 5)
        );

        // Top 5 marques par taux d'engagement
        console.log('\n💫 Top 5 marques par taux d\'engagement:');
        console.table(
            Object.entries(statsParMarque)
                .map(([marque, stats]: [string, any]) => ({
                    marque,
                    nombreArticles: stats.nombreArticles,
                    favorisTotal: stats.totalFavoris,
                    vuesTotal: stats.totalVues,
                    tauxEngagement: ((stats.totalFavoris / stats.totalVues) * 100).toFixed(2) + '%'
                }))
                .sort((a: any, b: any) => parseFloat(b.tauxEngagement) - parseFloat(a.tauxEngagement))
                .slice(0, 5)
        );

        console.groupEnd();

        console.groupEnd(); // Fin de l'extraction des ventes
    }

    private _extractMarketing() {
        console.group('📢 Extraction marketing');
        
        // Extraction des boosts
        const boostMatches = extractors.extractAll(patterns.boost, this.text);
        this.result.marketing.boosts = boostMatches.map(match => ({
            article: 'Boost', // On ajoute un nom d'article par défaut
            date: transformers.formatDate(match[1]),
            montant: transformers.parsePrice(match[2])
        }));

        // Extraction de la vitrine
        const vitrineMatches = extractors.extractAll(patterns.vitrine, this.text);
        this.result.marketing.dressingVitrine = vitrineMatches.map(match => ({
            nom: 'Dressing en vitrine', // On ajoute un nom par défaut
            prix: transformers.parsePrice(match[2]),
            date: transformers.formatDate(match[1])
        }));

        console.log('Marketing extrait:', {
            boosts: this.result.marketing.boosts,
            vitrine: this.result.marketing.dressingVitrine
        });
        console.groupEnd();

        return this.result.marketing;
    }

    private _extractFinances() {
        console.group('💶 Extraction finances');
        
        const transfertMatches = extractors.extractAll(patterns.transfert, this.text);
        this.result.finances.transferts = transfertMatches.map(match => ({
            date: transformers.formatDate(match[1]),
            montant: transformers.parsePrice(match[2])
        }));

        const soldeMatch = extractors.extract(patterns.solde, this.text);
        if (soldeMatch) {
            this.result.finances.soldeActuel = transformers.parsePrice(soldeMatch);
        }

        console.log('Nombre de transferts:', this.result.finances.transferts.length);
        console.log('Solde actuel:', this.result.finances.soldeActuel.toFixed(2) + ' €');
        console.groupEnd();
    }

    private _extractDepenses() {
        console.group('💸 Extraction des dépenses');
        
        const depenses = [];
        
        const boostMatches = extractors.extractAll(patterns.boost, this.text);
        boostMatches.forEach(match => {
            depenses.push({
                type: 'boost',
                date: transformers.formatDate(match[1]),
                montant: transformers.parsePrice(match[2])
            });
        });
        
        const vitrineMatches = extractors.extractAll(patterns.vitrine, this.text);
        vitrineMatches.forEach(match => {
            depenses.push({
                type: 'vitrine',
                date: transformers.formatDate(match[1]),
                montant: transformers.parsePrice(match[2])
            });
        });
        
        this.result.depenses = depenses;

        console.log('Nombre total de dépenses:', depenses.length);
        if (depenses.length > 0) {
            const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
            console.log('Total des dépenses:', totalDepenses.toFixed(2) + ' €');
        }
        console.groupEnd();
    }
}
