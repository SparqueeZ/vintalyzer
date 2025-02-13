// Patterns pour la détection des langues
export const languagePatterns = {
    italian: {
        // Liste des mots italiens
        words: new RegExp(`\\b(${[
            // Salutations et remerciements
            'grazie', 'ciao', 'arrivederci',
            // Adjectifs positifs
            'perfetto', 'bellissimo', 'ottimo', 'gentile', 'bello', 'fantastico', 'meraviglioso', 'stupendo', 'eccellente',
            'veloce', 'preciso', 'impeccabile', 'cortese', 'professionale',
            // Adverbes
            'purtroppo', 'davvero', 'comunque', 'allora', 'proprio', 'infatti', 'quindi', 'veramente', 'certamente',
            'sicuramente', 'facilmente', 'ovviamente', 'naturalmente', 'praticamente', 'semplicemente', 'assolutamente',
            'finalmente', 'solamente', 'specialmente', 'ugualmente',
            // Commerce et transactions
            'pacco', 'spedizione', 'venditore', 'arrivato', 'velocissimo', 'oggetto', 'acquisto', 'vendita', 'acquirente',
            'compratore', 'cliente', 'servizio', 'prodotto', 'articolo', 'merce', 'negozio', 'bottega',
            // États et qualités
            'disponibile', 'affidabile', 'conveniente', 'eccezionale', 'straordinario', 'magnifico', 'splendido', 'delizioso',
            'soddisfatto', 'contento', 'ricevuto'
        ].join('|')})\\b`, 'i'),
        country: "Italie"
    },
    spanish: {
        // Liste des mots espagnols
        words: new RegExp(`\\b(${[
            // Salutations et remerciements
            'gracias', 'hola', 'adios',
            // Adjectifs positifs
            'perfecto', 'hermoso', 'excelente', 'amable', 'encantado', 'bueno', 'estupendo', 'fenomenal', 'maravilloso',
            'fantastico', 'magnifico', 'impecable', 'nuevo', 'profesional', 'puntual', 'fiable', 'seguro',
            // Adverbes
            'verdaderamente', 'además', 'aunque', 'mientras', 'desde', 'hasta', 'según', 'todavía', 'absolutamente',
            'ciertamente', 'definitivamente', 'especialmente', 'exactamente', 'fácilmente', 'finalmente', 'igualmente',
            'naturalmente', 'obviamente', 'perfectamente', 'posiblemente', 'prácticamente', 'precisamente', 'rápidamente',
            'realmente', 'seguramente', 'simplemente', 'solamente', 'totalmente', 'únicamente',
            // Commerce et transactions
            'vendedor[ae]', 'envío', 'paquete', 'llegó', 'descripción', 'calidad', 'estado', 'embalaje', 'recibido',
            'servicio', 'atención', 'comprador[ae]', 'cliente', 'producto', 'artículo', 'mercancía', 'tienda', 'comercio',
            // États et qualités
            'disponible', 'confiable', 'encantad[oa]', 'atent[oa]'
        ].join('|')})\\b`, 'i'),
        country: "Espagne"
    },
    german: {
        // Liste des mots allemands (uniquement les plus spécifiques)
        words: new RegExp(`\\b(${[
            // Mots spécifiques allemands
            'danke schön', 'vielen dank', 'guten tag', 'auf wiedersehen',
            'verkäufer(?:in)?', 'käufer(?:in)?', 'kunde(?:in)?',
            'sehr geehrte[r]?', 'liebe[r]?', 'freundliche',
            // Adjectifs typiquement allemands
            'wunderbar', 'ausgezeichnet', 'bestens', 'einwandfrei', 'tadellos',
            'prima', 'spitze', 'klasse', 'toll', 'gerne',
            // Mots composés allemands
            'dankeschön', 'lieblings', 'traumhaft',
            'blitzschnell', 'superschnell',
            // Commerce spécifique
            'versand', 'lieferung', 'paket', 'ware',
            'verkauf', 'einkauf', 'geschäft',
            // Expressions typiques
            'alles gut', 'alles bestens', 'alles klar',
            'sehr zufrieden', 'gerne wieder',
            'wie beschrieben', 'wie neu'
        ].join('|')})\\b`, 'i'),
        country: "Allemagne"
    },
    english: {
        // Liste des mots anglais
        words: new RegExp(`\\b(${[
            // Salutations et remerciements
            'thanks', 'hello', 'bye', 'cheers', 'mate',
            // Adjectifs positifs
            'perfect', 'wonderful', 'excellent', 'friendly', 'nice', 'good', 'great', 'amazing', 'awesome', 'brilliant',
            'fantastic', 'satisfied', 'happy', 'pleased', 'delighted', 'helpful', 'reliable', 'prompt', 'quick', 'fast',
            'smooth', 'responsive', 'efficient', 'outstanding', 'impressive',
            // Adverbes
            'definitely', 'actually', 'anyway', 'though', 'quite', 'rather', 'pretty', 'absolutely', 'certainly',
            'clearly', 'completely', 'easily', 'especially', 'exactly', 'finally', 'naturally', 'obviously',
            'perfectly', 'possibly', 'precisely', 'probably', 'properly', 'quickly', 'really', 'simply', 'surely',
            'totally', 'truly', 'usually',
            // Commerce et transactions
            'seller', 'package', 'arrived', 'shipping', 'received', 'delivery', 'packaging', 'packed', 'item',
            'product', 'mint', 'transaction', 'dealing', 'buyer', 'customer', 'client', 'merchandise', 'goods',
            'shop', 'store',
            // États et qualités
            'available', 'dependable', 'exceptional', 'extraordinary', 'magnificent', 'splendid', 'delightful',
            'superb', 'genuine', 'described', 'condition', 'quality', 'service', 'professional'
        ].join('|')})\\b`, 'i'),
        country: "Royaume-Uni"
    }
};
