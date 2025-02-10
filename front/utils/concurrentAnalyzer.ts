import { concurrentPatterns, concurrentRules } from './concurrentPatterns';

interface BoutiqueInfo {
    nom: string;
    pays: string;
    ville: string;
    abonnes: number;
    note: number;
    articles: number;
    evaluations: number;
    localisation: {
        pays: string;
        ville: string;
    };
}

interface Article {
    prix: number;
    marque: string;
    date_vente: Date;
}

interface Commentaire {
    auteur: string;
    date: string;
    contenu: string;
    langue: string;
    dateRelative?: string;
    timestamp?: number;
}

interface Vente {
    date: Date;
    pays: string;
    prix: number;
}

interface VentesStats {
    ventesParMois: number;
    ventesParAn: number;
}

interface AnalyseVentes {
    totalVentes: number;
    ventesParPays: { [key: string]: number };
    pourcentagesParPays: { [key: string]: number };
    ventesCommentees: number;
    ventesNonCommentees: number;
    commentaires?: Commentaire[];
    prixMoyen?: number;
    chiffreAffaires?: number;
    top5Marques?: MarqueStats[];
}

interface ScoringData {
    subscribers: number;
    rating: number;
    totalSales: number;
    monthlySales: number;
    internationalSales: number;
    brandsCount: number;
}

interface MarqueStats {
    marque: string;
    nombre: number;
    pourcentage: number;
}

interface AnalyzeResults {
    boutique: BoutiqueInfo;
    articles: Article[];
    commentaires: Commentaire[];
    analyseVentes: AnalyseVentes;
    prixMoyen: number;
    chiffreAffaires: number;
    statsTemporelles: {
        commandesParMois: number;
        caParMois: number;
        commandesParJour: number;
        caParJour: number;
    };
    scoringData: ScoringData;
    top5Marques: MarqueStats[];
}

class ConcurrentAnalyzer {
    private patterns: typeof concurrentPatterns;
    private rules: typeof concurrentRules;

    constructor() {
        this.patterns = concurrentPatterns;
        this.rules = concurrentRules;
    }

    async analyze(text: string): Promise<AnalyzeResults> {
        try {
            // Extraire les informations de la boutique
            const boutique = this._extractBoutiqueInfo(text);

            // Extraire les articles et commentaires
            const articles = this._extractArticles(text);
            const commentaires = this._extractCommentaires(text);

            // Analyser les ventes
            const analyseVentes = this._analyseVentes(commentaires, boutique.evaluations, articles);

            // Calculer le nombre de pays avec des ventes significatives
            const paysAvecVentes = Object.entries(analyseVentes.ventesParPays || {})
                .filter(([_, ventes]) => ventes > 0)
                .length;

            // Compter les marques uniques
            const marques = new Set(articles.map(a => a.marque).filter(m => m && m !== 'Marque non spécifiée'));

            // Préparer les données de scoring
            const scoringData: ScoringData = {
                subscribers: parseInt(boutique.abonnes.toString()) || 0,
                rating: parseFloat(boutique.note.toString()) || 0,
                totalSales: analyseVentes.totalVentes || 0,
                monthlySales: Math.round((analyseVentes.totalVentes || 0) / 12),
                internationalSales: paysAvecVentes,
                brandsCount: marques.size
            };

            // Retourner toutes les données
            return {
                boutique,
                articles,
                commentaires,
                analyseVentes,
                prixMoyen: this.rules.analyse.prixMoyen(articles),
                chiffreAffaires: analyseVentes.totalVentes * this.rules.analyse.prixMoyen(articles),
                statsTemporelles: this.rules.analyse.analyseStatistiquesTemporelles(
                    analyseVentes.totalVentes,
                    analyseVentes.totalVentes * this.rules.analyse.prixMoyen(articles)
                ),
                scoringData,
                top5Marques: this._calculerTop5Marques(articles)
            };

        } catch (error) {
            throw error;
        }
    }

    private _extractBoutiqueInfo(text: string): BoutiqueInfo {
        // Extraire les informations brutes
        const info: BoutiqueInfo = {
            nom: (text.match(this.patterns.boutique.nom) || [])[1] || 'Inconnu',
            pays: (text.match(this.patterns.boutique.pays) || [])[1] || 'Inconnu',
            ville: (text.match(this.patterns.boutique.ville) || [])[1] || 'Inconnue',
            abonnes: parseInt((text.match(this.patterns.boutique.abonnes) || [])[1]) || 0,
            note: parseFloat((text.match(this.patterns.boutique.note) || [])[1]) || 0,
            articles: parseInt((text.match(this.patterns.boutique.articles) || [])[1]) || 0,
            evaluations: parseInt((text.match(this.patterns.boutique.evaluations) || [])[1]) || 0,
            localisation: {
                pays: '',
                ville: ''
            }
        };

        // Ajouter la localisation
        info.localisation = {
            pays: info.pays,
            ville: info.ville
        };

        return info;
    }

    private _extractArticles(text: string): Article[] {
        const articles: Article[] = [];
        let match: RegExpExecArray | null;

        // Créer une copie du pattern pour éviter les problèmes avec lastIndex
        const pattern = new RegExp(this.patterns.article.pattern, 'g');
        
        while ((match = pattern.exec(text)) !== null) {
            const article: Article = {
                prix: this.rules.validation.prix(match[this.patterns.article.structure.prix]),
                marque: match[this.patterns.article.structure.marque],
                date_vente: new Date()
            };
            articles.push(article);
        }

        return articles;
    }

    private _extractCommentaires(text: string): Commentaire[] {
        const commentaires: Commentaire[] = [];
        let match: RegExpExecArray | null;

        // Créer une copie du pattern pour éviter les problèmes avec lastIndex
        const pattern = new RegExp(this.patterns.commentaire.pattern, 'g');
        
        while ((match = pattern.exec(text)) !== null) {
            const commentaire: Commentaire = {
                auteur: match[this.patterns.commentaire.structure.auteur],
                date: match[this.patterns.commentaire.structure.date],
                contenu: match[this.patterns.commentaire.structure.contenu].trim(),
                langue: this.rules.validation.langue(match[this.patterns.commentaire.structure.contenu].trim())
            };
            commentaires.push(commentaire);
        }

        return this.rules.analyse.fraicheurCommentaires(commentaires);
    }

    private _extractVentes(text: string): Vente[] {
        const ventes: Vente[] = [];
        const pattern = new RegExp(this.patterns.vente.pattern);
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(text)) !== null) {
            try {
                const dateStr = match[this.patterns.vente.structure.date];
                const prixStr = match[this.patterns.vente.structure.prix];
                const pays = match[this.patterns.vente.structure.pays];

                // Convertir la date
                const date = this.rules.validation.date(dateStr);
                
                // Convertir le prix en nombre
                const prix = parseFloat(prixStr.replace(',', '.'));

                if (date && !isNaN(prix)) {
                    ventes.push({
                        date: date,
                        pays: pays || 'France', // Par défaut France si non spécifié
                        prix: prix
                    });
                }
            } catch (error) {
                console.error('Erreur lors du traitement d\'une vente:', error);
                continue;
            }
        }

        return ventes;
    }

    private _calculateVentesStats(ventes: Vente[]): VentesStats {
        const stats: VentesStats = {
            ventesParMois: 0,
            ventesParAn: 0
        };

        // Calculer les ventes par mois et par an
        const ventesParMois: { [key: number]: number } = {};
        const ventesParAn: { [key: number]: number } = {};

        ventes.forEach(vente => {
            const date = new Date(vente.date);
            const mois = date.getMonth() + 1;
            const an = date.getFullYear();

            if (!ventesParMois[mois]) ventesParMois[mois] = 0;
            if (!ventesParAn[an]) ventesParAn[an] = 0;

            ventesParMois[mois]++;
            ventesParAn[an]++;
        });

        stats.ventesParMois = Math.max(...Object.values(ventesParMois));
        stats.ventesParAn = Math.max(...Object.values(ventesParAn));

        return stats;
    }

    private _countInternationalSales(ventes: Vente[]): number {
        // Compter le nombre de pays différents dans les ventes
        const pays = new Set(ventes.map(vente => vente.pays).filter(Boolean));
        return pays.size;
    }

    private _extractMarques(text: string): string[] {
        const marques = new Set<string>();
        const marqueMatches = text.match(this.patterns.marque);
        
        if (marqueMatches) {
            marqueMatches.forEach(match => {
                const marque = match.trim();
                if (marque) marques.add(marque);
            });
        }

        return Array.from(marques);
    }

    private _analyseVentes(commentaires: Commentaire[], evaluations: number, articles: Article[]): AnalyseVentes {
        // Analyser les ventes
        const analyseVentes = this.rules.analyse.analyseVentes(commentaires, evaluations);

        // Calculer le prix moyen et le chiffre d'affaires
        const prixMoyen = this.rules.analyse.prixMoyen(articles);
        const chiffreAffaires = analyseVentes.totalVentes * prixMoyen;

        // Formater les dates des commentaires
        const commentairesAvecDates = commentaires.map(comment => ({
            ...comment,
            date: new Date(comment.date).toISOString()
        }));

        // Trier les commentaires par date
        const commentairesTriees = commentairesAvecDates.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        return {
            ...analyseVentes,
            commentaires: commentairesTriees,
            prixMoyen,
            chiffreAffaires,
            top5Marques: this._calculerTop5Marques(articles)
        };
    }

    private _calculerTop5Marques(articles: Article[]): MarqueStats[] {
        // Compter les occurrences de chaque marque
        const compteur = new Map<string, number>();
        articles.forEach(article => {
            const count = compteur.get(article.marque) || 0;
            compteur.set(article.marque, count + 1);
        });

        // Convertir en tableau et trier par nombre d'occurrences
        const stats: MarqueStats[] = Array.from(compteur.entries()).map(([marque, nombre]) => ({
            marque,
            nombre,
            pourcentage: (nombre / articles.length) * 100
        }));

        // Trier par nombre décroissant et prendre les 5 premiers
        return stats
            .sort((a, b) => b.nombre - a.nombre)
            .slice(0, 5);
    }
}

export const concurrentAnalyzer = new ConcurrentAnalyzer();
