function extract(
  pattern: RegExp,
  text: string,
  index: number = 0
): string | null {
  const match = text.match(pattern);
  return match ? match[index] : null;
}

function extractAll(pattern: RegExp, text: string): RegExpExecArray[] {
  const matches: RegExpExecArray[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
}

export const getShopData = async (text: string) => {
  try {
    const shopName = extract(patterns.boutiqueName, text, 1);
    if (!shopName) {
      throw new Error("Boutique name not found");
    }

    const shopSubscribers = extract(patterns.abonnes, text, 1);
    if (!shopSubscribers) {
      throw new Error("Shop subscribers not found");
    }

    const shopData = {
      name: shopName,
      subscribers: shopSubscribers,
    };
    return shopData;
  } catch (error) {
    console.error("Error extracting shop data:", error);
    return null;
  }
};

export const getSellData = async (text: string) => {
  try {
    const uniqueSales = new Set();
    const ventes = [];

    const sellData = extractAll(patterns.realSales, text);
    if (sellData) {
      sellData.forEach((match) => {
        const vente = {
          article: match[1],
          prix: parseFloat(match[2].replace(",", ".")),
          date: match[3],
          marque: match[1].split(",")[0].trim(),
        };

        const saleKey = `${vente.article
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim()}|${vente.prix.toFixed(2)}|${vente.date
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim()}`;

        if (!uniqueSales.has(saleKey)) {
          uniqueSales.add(saleKey);
          ventes.push(vente);
        }
      });
    }

    return ventes;
  } catch (error) {
    console.error("Error extracting sell data:", error);
    return null;
  }
};
