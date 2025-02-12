// Liste des pays reconnus
const paysReconnus = [
    'France',
    'Espagne',
    'Italie',
    'Allemagne',
    'Belgique',
    'Pays-Bas',
    'Portugal',
    'Royaume-Uni',
    'Suisse',
    'Luxembourg'
].join('|');

// Patterns et règles pour l'analyse des concurrents
export const concurrentPatterns = {
    // Informations de la boutique
    boutique: {
        // Capture le nom en excluant les chiffres à la fin suivis de "évaluations"
        nom: /([A-Za-z0-9_]+?)(?:\d+)?\s*évaluations/,
        pays: new RegExp(`À propos :(?:[^,]*,\\s*)?\\s*(${paysReconnus})(?:C|$)`),
        abonnes: /(\d+)\nAbonné/,
        note: /\n(\d\.\d)\n/,
        articles: /(\d+) articles/,
        evaluations: /\((\d+)\)\nÉvaluations/
    },

    // Pattern pour les ventes
    vente: {
        pattern: /(\d{2}\/\d{2}\/\d{4})\n([^:]+): ([\d,]+) €/g,
        structure: {
            date: 1,      // Premier groupe
            pays: 2,      // Deuxième groupe
            montant: 3    // Troisième groupe
        }
    },

    // Pattern pour un article complet
    article: {
        pattern: /marque : (.*?), prix : (\d+,\d{2})/g,
        structure: {
            marque: 1,  // Premier groupe : la marque (ex: H&M)
            prix: 2     // Deuxième groupe : le prix (ex: 6,00)
        }
    },

    // Pattern pour les commentaires
    commentaire: {
        pattern: /([a-zA-Z0-9_]+)\nil y a (.*?)\n(.*?)\n/g,
        structure: {
            auteur: 1,     // Premier groupe : nom d'utilisateur
            date: 2,       // Deuxième groupe : nombre (semaines/mois)
            contenu: 3     // Troisième groupe : le commentaire
        }
    },

    // Mots-clés pour la détection des langues
    langues: {
        francais: [
            'merci beaucoup', 'très satisfait', 'colis bien reçu', 'conforme à', 
            'envoi soigné', 'recommande vivement', 'nickel', 'impeccable',
            'ravie', 'super vendeur', 'très belle', 'parfaitement', 'génial',
            'rapidement reçu', 'très contente', 'excellent état', 'trop bien',
            'je recommande', 'emballage soigné', 'livraison rapide', 'parfait',
            'super', 'rien à dire', 'bien emballé', 'rapide', 'conforme',
            'reçu', 'colis', 'vendeur', 'vendeuse', 'envoi', 'merci', 'top',
            'satisfait', 'contente', 'belle', 'bien', 'très', 'excellent'
        ],
        anglais: [
            'thank you', 'perfect', 'well packed', 'great seller',
            'fast shipping', 'excellent condition', 'very satisfied',
            'everything perfect', 'good communication', 'highly recommend',
            'arrived safely', 'very happy', 'awesome', 'great service',
            'thanks', 'received', 'good', 'nice', 'great', 'excellent',
            'perfect condition', 'quick delivery', 'well', 'very good',
            'satisfied', 'happy', 'amazing', 'wonderful', 'best', 'love',
            'super', 'exactly as described', 'fast', 'safe', 'recommended',
            'everything', 'arrived', 'item', 'seller', 'shipping', 'packed',
            'quick', 'fast', 'good', 'nice', 'ty', 'thx'
        ],
        espagnol: [
            'gracias', 'perfecto', 'muy bien', 'excelente vendedor',
            'envío rápido', 'todo perfecto', 'muy satisfecho',
            'bien embalado', 'recomiendo', 'encanto', 'genial',
            'muchas gracias', 'muy contento', 'vendedor excelente',
            'todo bien', 'bien', 'muy', 'bueno', 'excelente',
            'perfecto estado', 'rápido', 'buen', 'súper', 'estupendo',
            'gracias por', 'todo', 'llegó', 'recibido', 'vendedor',
            'envío', 'embalaje', 'satisfecho', 'contento', 'mil gracias'
        ],
        italien: [
            'grazie mille', 'tutto perfetto', 'ottimo venditore', 
            'spedizione veloce', 'bellissimo oggetto', 'consigliato vivamente',
            'arrivato velocemente', 'ottima comunicazione', 'molto soddisfatta',
            'perfettamente imballato', 'venditore serio', 'grazie davvero',
            'tutto ok', 'perfetto', 'ottimo', 'bellissimo', 'veloce',
            'grazie', 'bene', 'molto', 'buono', 'eccellente', 'consigliato',
            'spedizione', 'venditore', 'pacco', 'ricevuto', 'arrivato'
        ],
        allemand: [
            'vielen dank', 'alles bestens', 'schnelle lieferung', 
            'gerne wieder', 'sehr zufrieden', 'super verpackt',
            'empfehlenswert', 'danke schön', 'toll verpackt',
            'sehr schnell', 'perfekt wie beschrieben', 'wirklich toll',
            'danke', 'super', 'gut', 'sehr gut', 'perfekt', 'schnell',
            'bestens', 'toll', 'prima', 'ausgezeichnet', 'wunderbar',
            'alles gut', 'gerne', 'wieder', 'empfehlen', 'zufrieden',
            'paket', 'verkäufer', 'artikel', 'erhalten', 'angekommen'
        ],
        neerlandais: [
            'bedankt', 'perfect', 'goed verpakt', 'snelle levering',
            'helemaal goed', 'zeer tevreden', 'prima', 'uitstekend',
            'top', 'geweldig', 'super', 'netjes', 'mooi', 'goed',
            'snel', 'verzending', 'verkoper', 'ontvangen', 'precies',
            'zoals beschreven', 'dank', 'fijn', 'leuk'
        ]
    }
};

export const concurrentRules = {
    // Règles de validation et de transformation
    validation: {
        prix: (prix: string) => {
            return parseFloat(prix.replace(',', '.'));
        },
        note: (note: string) => {
            const noteNum = parseFloat(note);
            return noteNum >= 0 && noteNum <= 5 ? noteNum : null;
        },
        articles: (nombre: string) => {
            return parseInt(nombre, 10);
        },
        // Fonction pour convertir les dates relatives en dates réelles
        date: (dateRelative: string) => {
            if (!dateRelative) return new Date();

            const now = new Date('2025-01-04T04:16:04+01:00'); // Date fixe pour la cohérence
            
            // Gérer d'abord les minutes et les heures
            const matchMinutesHeures = dateRelative.match(/(\d+)\s+(minute|heure)/);
            if (matchMinutesHeures) {
                const [, nombre, unite] = matchMinutesHeures;
                const nombreInt = parseInt(nombre);
                const date = new Date(now);
                
                if (unite === 'minute') {
                    date.setMinutes(date.getMinutes() - nombreInt);
                } else if (unite === 'heure') {
                    date.setHours(date.getHours() - nombreInt);
                }
                return date;
            }

            // Gérer ensuite les jours, semaines, mois, années
            const match = dateRelative.match(/(\d+)\s+(jour|semaine|mois|an)/);
            if (!match) return now;

            const [, nombre, unite] = match;
            const nombreInt = parseInt(nombre);
            const date = new Date(now);
            
            switch(unite) {
                case 'jour':
                    date.setDate(date.getDate() - nombreInt);
                    break;
                case 'semaine':
                    date.setDate(date.getDate() - (nombreInt * 7));
                    break;
                case 'mois':
                    date.setMonth(date.getMonth() - nombreInt);
                    break;
                case 'an':
                    date.setFullYear(date.getFullYear() - nombreInt);
                    break;
            }

            return date;
        },
        // Fonction améliorée pour détecter la langue
        langue: (texte: string) => {
            if (!texte) return 'francais';
            
            texte = texte.toLowerCase();
            let scores: { [key: string]: number } = {
                francais: 0,
                anglais: 0,
                espagnol: 0,
                italien: 0,
                allemand: 0,
                neerlandais: 0
            };
            
            // Calculer un score pour chaque langue
            for (const [langue, expressions] of Object.entries(concurrentPatterns.langues)) {
                for (const expr of expressions) {
                    if (texte.includes(expr.toLowerCase())) {
                        // Score de base basé sur la longueur
                        let score = expr.length;
                        
                        // Bonus si l'expression est au début du texte
                        if (texte.indexOf(expr.toLowerCase()) < texte.length / 2) {
                            score *= 1.2;
                        }
                        
                        // Léger bonus pour les expressions longues
                        if (expr.length > 10) {
                            score *= 1.1;
                        }
                        
                        // Léger malus pour les mots très courts, mais pas trop pénalisant
                        if (expr.length < 4) {
                            score *= 0.9;
                        }
                        
                        scores[langue] += score;
                    }
                }
            }
            
            // Trouver la langue avec le score le plus élevé
            let maxScore = 0;
            let langueDetectee = 'francais'; // Par défaut
            
            for (const [langue, score] of Object.entries(scores)) {
                if (score > maxScore) {
                    maxScore = score;
                    langueDetectee = langue;
                }
            }
            
            // Seuil plus bas pour la détection
            return maxScore > 1 ? langueDetectee : 'francais';
        }
    },

    // Règles d'analyse des données
    analyse: {
        // Calculer le prix moyen des articles avec des ajustements pour plus de précision
        prixMoyen: (articles: any[]) => {
            if (!articles.length) return 0;
            
            // Trier les prix par ordre croissant
            const prix = articles.map(a => a.prix).sort((a, b) => a - b);
            
            // Calculer Q1 (25%) et Q3 (75%) pour détecter les outliers
            const q1Index = Math.floor(prix.length * 0.25);
            const q3Index = Math.floor(prix.length * 0.75);
            const q1 = prix[q1Index];
            const q3 = prix[q3Index];
            const iqr = q3 - q1;
            
            // Définir les limites pour les outliers (1.5 * IQR)
            const lowerBound = q1 - (1.5 * iqr);
            const upperBound = q3 + (1.5 * iqr);
            
            // Filtrer les prix en excluant les outliers
            const prixFiltres = prix.filter(p => p >= lowerBound && p <= upperBound);
            
            // Calculer la médiane des prix filtrés
            const medianIndex = Math.floor(prixFiltres.length / 2);
            let prixMedian;
            if (prixFiltres.length % 2 === 0) {
                prixMedian = (prixFiltres[medianIndex - 1] + prixFiltres[medianIndex]) / 2;
            } else {
                prixMedian = prixFiltres[medianIndex];
            }
            
            // Calculer la moyenne des prix filtrés
            const moyenne = prixFiltres.reduce((sum, p) => sum + p, 0) / prixFiltres.length;
            
            // Utiliser une moyenne pondérée entre la médiane (60%) et la moyenne (40%)
            let prixFinal = (prixMedian * 0.6) + (moyenne * 0.4);
            
            // Appliquer une réduction progressive selon le nombre d'articles
            // Plus il y a d'articles, plus on réduit le prix moyen
            const reductionFactors = [
                { seuil: 50, reduction: 0.95 },   // -5% si plus de 50 articles
                { seuil: 100, reduction: 0.93 },  // -7% si plus de 100 articles
                { seuil: 200, reduction: 0.90 },  // -10% si plus de 200 articles
                { seuil: 500, reduction: 0.85 }   // -15% si plus de 500 articles
            ];
            
            // Trouver le facteur de réduction approprié
            const factor = reductionFactors
                .reverse()
                .find(f => articles.length >= f.seuil)?.reduction || 1;
            
            prixFinal *= factor;
            
            return Math.round(prixFinal * 100) / 100; // Arrondir à 2 décimales
        },

        // Identifier les marques les plus fréquentes
        marquesFrequentes: (articles: any[]) => {
            const marques: { [key: string]: number } = {};
            articles.forEach(article => {
                marques[article.marque] = (marques[article.marque] || 0) + 1;
            });
            return Object.entries(marques)
                .sort(([,a], [,b]) => b - a)
                .reduce((obj, [key, value]) => ({
                    ...obj,
                    [key]: value
                }), {});
        },

        // Analyser les commentaires et les ventes
        analyseVentes: (commentaires: any[], totalEvaluations: number) => {
            // Statistiques par pays
            const venteParPays: { [key: string]: number } = {
                'France': 0,
                'Italie': 0,
                'Allemagne': 0,
                'Espagne': 0,
                'Pays anglophones': 0
            };

            // Analyser chaque commentaire
            commentaires.forEach(com => {
                const langue = concurrentRules.validation.langue(com.contenu);
                switch(langue) {
                    case 'italien':
                        venteParPays['Italie']++;
                        break;
                    case 'allemand':
                        venteParPays['Allemagne']++;
                        break;
                    case 'espagnol':
                        venteParPays['Espagne']++;
                        break;
                    case 'anglais':
                        venteParPays['Pays anglophones']++;
                        break;
                    default:
                        venteParPays['France']++;
                }
            });

            // Calculer les pourcentages (exclure la France)
            const ventesInternationales = Object.entries(venteParPays)
                .filter(([pays]) => pays !== 'France')
                .reduce((acc, [_, count]) => acc + count, 0);

            const pourcentages: { [key: string]: number } = {};
            for (const [pays, nombre] of Object.entries(venteParPays)) {
                if (pays !== 'France') {
                    pourcentages[pays] = ventesInternationales > 0 ? (nombre / ventesInternationales) * 100 : 0;
                }
            }

            return {
                totalVentes: totalEvaluations,
                ventesParPays: venteParPays,
                pourcentagesParPays: pourcentages,
                ventesCommentees: commentaires.length,
                ventesNonCommentees: totalEvaluations - commentaires.length
            };
        },

        // Analyser la fraîcheur des commentaires
        fraicheurCommentaires: (commentaires: any[]) => {
            return commentaires.map(com => ({
                ...com,
                dateRelative: com.date,
                date: concurrentRules.validation.date(com.date).toISOString(),
                timestamp: concurrentRules.validation.date(com.date).getTime(),
                langue: concurrentRules.validation.langue(com.contenu)
            }));
        },

        // Analyser les statistiques temporelles
        analyseStatistiquesTemporelles(totalVentes: number, chiffreAffaires: number, dateCreation: Date | null = null) {
            // Utiliser une période de 12 mois par défaut
            const nombreMois = 12;
            const nombreJours = 365;
            
            // Calculer les statistiques
            const commandesParMois = totalVentes / nombreMois;
            const caParMois = chiffreAffaires / nombreMois;
            const commandesParJour = totalVentes / nombreJours;
            const caParJour = chiffreAffaires / nombreJours;
            
            return {
                commandesParMois: Number(commandesParMois.toFixed(1)),
                caParMois: Number(caParMois.toFixed(2)),
                commandesParJour: Number(commandesParJour.toFixed(1)),
                caParJour: Number(caParJour.toFixed(2))
            };
        }
    }
};
