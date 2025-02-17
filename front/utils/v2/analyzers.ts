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

function detectLanguage(text: string): string | null {
  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.words.test(text.toLowerCase())) {
      return pattern.lang ? pattern.lang : "unknown";
    }
  }
  return "unknown";
}

const getBrand = (article: string) => {
  const brandList = [
    "yamaha",
    "thunderdome",
    "bmw",
    "fox",
    "mercedes",
    "ktm",
    "audi",
    "honda",
  ];
  const brand = brandList.find((brand) =>
    article.toLowerCase().includes(brand)
  );
  return brand;
};

const brands = [];

export const getScanDate = (date: string) => {
  const scanDate = new Date(date);
  return scanDate;
};

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

    const shopLocation = {
      ville: extract(patterns.localisation, text, 1)?.trim(),
      pays: extract(patterns.localisation, text, 2)?.trim(),
    };
    if (!shopLocation.ville || !shopLocation.pays) {
      throw new Error("Shop location not found");
    }

    const shopData = {
      name: shopName,
      subscribers: shopSubscribers,
      location: shopLocation,
    };
    return shopData;
  } catch (error) {
    console.error("Error extracting shop data:", error);
    return null;
  }
};

export const getSalesData = async (text: string) => {
  try {
    const uniqueSales = new Set();
    const salesData = <any>[];

    const sellData = extractAll(patterns.transactions, text);
    if (sellData) {
      sellData.forEach((match) => {
        const sale = {
          article: match[1],
          price: parseFloat(match[2].replace(",", ".")),
          date: new Date(match[3]),
          brand: getBrand(match[1]),
        };

        const saleKey = `${sale.article
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim()}|${sale.price.toFixed(2).replace(/\s+/g, " ").trim()}`;

        if (!uniqueSales.has(saleKey)) {
          uniqueSales.add(saleKey);
          salesData.push(sale);
        }
      });
    }

    return salesData;
  } catch (error) {
    console.error("Error extracting sell data:", error);
    return null;
  }
};

export const getCommentsData = async (text: string) => {
  try {
    const comments = extractAll(patterns.comments, text);
    const salesByCountry = new Map<string, number>();
    const commentsList = <any>[];

    comments.forEach((comment) => {
      const commentContent = comment[3].replace(/\n/g, " ").trim();
      const country = detectLanguage(commentContent);
      if (country) {
        salesByCountry.set(country, (salesByCountry.get(country) || 0) + 1);
      }

      commentsList.push({
        author: comment[1],
        relativeDate: comment[2],
        content: commentContent,
        lang: country,
      });
    });
    return commentsList;
  } catch (error) {
    console.error("Error extracting comments data:", error);
    return null;
  }
};

export const getExpensesData = async (text: string) => {
  try {
    const depenses = <any>[];

    // Chercher les dépenses de vitrine
    const vitrineMatch = extractAll(patterns.vitrine, text);
    if (vitrineMatch) {
      vitrineMatch.forEach((match) => {
        const montant = Math.abs(parseFloat(match[1].replace(",", ".")));
        const date = match[2];
        depenses.push({
          type: "vitrine",
          montant,
          date,
        });
      });
    }

    // Chercher les dépenses de boost
    const boostMatch = extractAll(patterns.boost, text);
    if (boostMatch) {
      boostMatch.forEach((match) => {
        const montant = Math.abs(parseFloat(match[1].replace(",", ".")));
        const date = match[2];
        depenses.push({
          type: "boost",
          montant,
          date,
        });
      });
    }

    // Chercher les achats
    const achatsMatch = extractAll(patterns.achats, text);
    if (achatsMatch) {
      achatsMatch.forEach((match) => {
        const article = match[1];
        const montant = Math.abs(parseFloat(match[2].replace(",", ".")));
        const date = match[3];
        depenses.push({
          type: "achat",
          article,
          montant,
          date,
        });
      });
    }

    // Trier les dépenses par date
    depenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return depenses;
  } catch (error) {
    console.error("Error extracting expenses data:", error);
    return null;
  }
};

export const getStatisticsData = async (text: string) => {
  text = text.replace("=== ARTICLES ===", "").trim();
  let articles = extractAll(patterns.articles, text);
  interface Sale {
    item: string;
    brand: string;
    price: number;
    views: number;
  }
  interface BrandStats {
    brand: string;
    sales: Sale[];
    totalPrice: number;
    totalViews: number;
    count: number;
  }
  const salesByBrand = <BrandStats[]>[];

  articles.forEach((match) => {
    const article = {
      item: match[1].replace(/\n/g, " ").trim(),
      brand: match[2] || "unknown",
      price: parseFloat(match[3].replace(",", ".")),
      views: parseInt(match[4]),
    };

    if (article.brand) {
      const brandStats = salesByBrand.find((b) => b.brand === article.brand);
      if (brandStats) {
        brandStats.sales.push(article);
        brandStats.totalPrice += article.price;
        brandStats.totalViews += article.views;
        brandStats.count++;
      } else {
        salesByBrand.push({
          brand: article.brand,
          sales: [article],
          totalPrice: article.price,
          totalViews: article.views,
          count: 1,
        });
      }
    } else {
      salesByBrand.push({
        brand: "unknown",
        sales: [article],
        totalPrice: article.price,
        totalViews: article.views,
        count: 1,
      });
    }
  });

  const totalViews = salesByBrand.reduce(
    (sum, stats) => sum + stats.totalViews,
    0
  );
  const totalSales = salesByBrand.reduce((sum, stats) => sum + stats.count, 0);
  const totalSalesPrice = salesByBrand.reduce(
    (sum, stats) => sum + stats.totalPrice,
    0
  );
  const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

  return {
    salesByBrand,
    conversionRate,
    totalViews,
    totalSales,
    totalSalesPrice,
  };
};
