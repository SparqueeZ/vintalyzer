export const patterns = {
    // Pour extraire le nom de la boutique
    boutiqueName: /^([^@]+)@[^\n]+/,
    
    // Pour extraire le nombre d'abonnés
    abonnes: /(\d+)Abonnés/,

    // Pour extraire les statistiques de vente (nom article, marque optionnelle, prix, vues)
    venteStats: /^(?!=== ARTICLES ===)([^,]+?)(?:, marque: ([^,]+?))?(?:, état:.*?, |, état:.*?taille:.*?, )(\d+,\d{2}) €.*?\nVendu\n(\d+) vues$/gm,

    // Pour extraire les sections de transactions
    transactionSection: /=== TRANSACTIONS ([a-zÀ-ÿ]+ \d{4}) ===([\s\S]*?)(?=\n=== TRANSACTIONS|$)/gm,

    // Pour extraire la localisation
    localisation: /À propos :([^,]+),([^v]+)/,

    // Pour extraire les commentaires
    comments: /^([^\n]+)\nil y a [^\n]+\n([^\n]+?)(?:\n\n(?:ambiancestickers|Répondre|Modifier|Supprimer|Traduire))/gm,

    // Pour extraire les ventes réelles avec dates et détails complets
    realSales: /(?:Vente|Paiements[ \u00A0]de[ \u00A0]Vinted)\n([^\n]+)\n([0-9,]+)[ \u00A0]€\n(\d{1,2} [a-zÀ-ÿ]+ \d{4})/gm,

    // Pour extraire les dépenses de vitrine
    vitrine: /Commande Dressing en vitrine\n(-[0-9,]+)[ \u00A0]€\n(\d{1,2} [a-zÀ-ÿ]+ \d{4})/gm,

    // Pour extraire les dépenses de boost
    boost: /Commande d'un Boost\n(?:1 article\n)?(-[0-9,]+)[ \u00A0]€\n(\d{1,2} [a-zÀ-ÿ]+ \d{4})/gm,

    // Pour extraire les achats
    achats: /Achat\n([^\n]+)\n(-[0-9,]+)[ \u00A0]€\n(\d{1,2} [a-zÀ-ÿ]+ \d{4})/gm
}

export const extractors = {
    extract: (pattern: RegExp, str: string, group = 1): string | null => {
        // Créer une nouvelle instance du pattern
        const regex = new RegExp(pattern.source, pattern.flags);
        const match = regex.exec(str);
        return match ? match[group] : null;
    },

    extractAll: (pattern: RegExp, str: string): RegExpExecArray[] => {
        const matches: RegExpExecArray[] = [];
        // Créer une nouvelle instance du pattern
        const regex = new RegExp(pattern.source, pattern.flags);
        let match;
        while ((match = regex.exec(str)) !== null) {
            matches.push(match);
        }
        return matches;
    }
}