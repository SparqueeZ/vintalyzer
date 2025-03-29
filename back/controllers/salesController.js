const {
  SaleModel,
  ShopModel,
  ComentModel,
  ExpenseModel,
  Statistic,
  SaleByBrand,
  SaleWithBrand,
} = require("../models");

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll();
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching all sales:", error);
    res.status(500).json({ message: "Error retrieving sales" });
  }
};

exports.getUserSales = async (req, res) => {
  console.log("[INFO] Récupération des ventes de l'utilisateur");
  try {
    const userId = req.user.id; // Obtenu du middleware d'authentification
    const sales = await Sale.findAll({
      where: { userId: userId },
    });
    res.status(200).json(sales);
  } catch (error) {
    console.error("[ERROR] Error fetching user sales:", error);
    res.status(500).json({ message: "Error retrieving user sales" });
  }
};

exports.loadSales = async (req, res) => {
  const userId = req.user.id;
  const { boutique, ventes, commentaires, depenses, statistics } = req.body;

  try {
    // 1. Trouver ou créer la boutique
    let shop;
    try {
      [shop] = await ShopModel.findOrCreate({
        where: { email: boutique.email },
        defaults: {
          name: boutique.name || "Unnamed Shop",
          email: boutique.email,
          subscribers: parseInt(boutique.subscribers) || 0,
          city: boutique.location?.city || "Unknown",
          country: boutique.location?.country || "Unknown",
          userId: userId,
        },
      });

      // Mettre à jour les informations si la boutique existe déjà
      if (!shop.isNewRecord) {
        await shop.update({
          subscribers: parseInt(boutique.subscribers) || shop.subscribers,
          city: boutique.location?.ville || shop.city,
          country: boutique.location?.pays || shop.country,
        });
      }
    } catch (error) {
      console.error("[ERROR] Shop operation failed:", error);
      throw new Error("Shop operation failed: " + error.message);
    }

    // 2. Ajouter les ventes sans vérification de doublons
    try {
      for (const vente of ventes) {
        await SaleModel.create({
          shopId: shop.id,
          article: vente.article,
          date: new Date(vente.date),
          price: parseFloat(vente.price) || 0,
          brand: vente.brand || null,
        });
      }
    } catch (error) {
      console.error("[ERROR] Sales operation failed:", error);
    }

    // 3. Ajouter les commentaires sans doublons
    try {
      for (const comment of commentaires) {
        await ComentModel.create({
          shopId: shop.id,
          author: comment.author,
          content: comment.content || "Unknown",
          relativeDate: comment.relativeDate || "Unknown",
          lang: comment.lang || "unknown",
        });
      }
    } catch (error) {
      console.error("[ERROR] Comments operation failed:", error);
    }

    // 4. Ajouter les dépenses sans doublons
    try {
      for (const expense of depenses) {
        const [exp, created] = await ExpenseModel.findOrCreate({
          where: {
            shopId: shop.id,
            type: expense.type,
            montant: parseFloat(expense.montant),
            date: expense.date,
          },
          defaults: {
            article: expense.article || null,
          },
        });
        if (!created) {
          console.log(
            `[INFO] Expense already exists: ${expense.type} of ${expense.montant}€ on ${expense.date}`
          );
        }
      }
    } catch (error) {
      console.error("[ERROR] Expenses operation failed:", error);
    }

    // 5. Ajouter les statistiques
    try {
      // Créer les statistiques générales
      const statistic = await Statistic.create({
        shopId: shop.id,
        conversionRate: statistics.conversionRate,
        totalViews: statistics.totalViews,
        totalSales: statistics.totalSales,
        totalSalesPrice: statistics.totalSalesPrice,
      });

      // Pour chaque marque, créer une entrée dans SaleByBrand
      for (const brandData of statistics.salesByBrandWithoutGroup) {
        const saleByBrand = await SaleByBrand.create({
          statisticId: statistic.id,
          brand: brandData.brand,
          count: brandData.count,
          // totalPrice: brandData.totalPrice,
          // totalViews: brandData.totalViews,
        });

        // Pour chaque vente de cette marque, créer une entrée dans SaleWithBrand
        for (const sale of brandData.sales) {
          await SaleWithBrand.create({
            saleByBrandId: saleByBrand.id,
            article: sale.item,
            price: sale.price,
            brand: sale.brand,
            views: sale.views,
          });
        }
      }
    } catch (error) {
      console.error("[ERROR] Statistics operation failed:", error);
      throw new Error("Statistics operation failed: " + error.message);
    }

    // 6. Récupérer les statistiques des opérations
    const stats = {
      shop: shop.isNewRecord ? "created" : "updated",
      salesCount: await SaleModel.count({ where: { shopId: shop.id } }),
      commentsCount: await ComentModel.count({ where: { shopId: shop.id } }),
      expensesCount: await ExpenseModel.count({ where: { shopId: shop.id } }),
    };

    res.status(200).json({
      message: "Data processed successfully",
      shopId: shop.id,
      stats: stats,
    });
  } catch (error) {
    console.error("[ERROR] Error in data processing:", error);
    res.status(500).json({
      message: "Error in data processing",
      error: error.message,
    });
  }
};

exports.getUserData = async (req, res) => {
  const userId = req.user.id;

  try {
    const shops = await ShopModel.findAll({
      where: { userId: userId },
      attributes: ["name", "email", "subscribers", "city", "country"],
      include: [
        {
          model: SaleModel,
          attributes: ["article", "price", "date", "brand"],
          separate: true,
        },
        {
          model: ComentModel,
          attributes: ["author", "relativeDate", "content", "lang"],
          separate: true,
        },
        {
          model: ExpenseModel,
          attributes: ["type", "article", "montant", "date"],
          separate: true,
        },
        {
          model: Statistic,
          attributes: [
            "conversionRate",
            "totalViews",
            "totalSales",
            "totalSalesPrice",
          ],
          separate: true,
          include: [
            {
              model: SaleByBrand,
              attributes: ["brand", "count"],
              separate: true,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const total = await ShopModel.count({ where: { userId: userId } });

    res.status(200).json({
      message: "User data retrieved successfully",
      shops,
    });
  } catch (error) {
    console.error("[ERROR] Error retrieving user data:", error);
    res.status(500).json({
      message: "Error retrieving user data",
      error: error.message,
    });
  }

  // try {
  //   const shops = await ShopModel.findAll({
  //     where: { userId: userId },
  //     include: [
  //       {
  //         model: SaleModel,
  //         attributes: ["article", "price", "date", "brand"],
  //       },
  //       {
  //         model: ComentModel,
  //         attributes: ["author", "relativeDate", "content", "lang"],
  //       },
  //       {
  //         model: ExpenseModel,
  //         attributes: ["type", "article", "montant", "date"],
  //       },
  //       {
  //         model: Statistic,
  //         include: [
  //           {
  //             model: SaleByBrand,
  //           },
  //         ],
  //       },
  //     ],
  //     order: [
  //       ["createdAt", "DESC"],
  //       [SaleModel, "date", "DESC"],
  //       [ExpenseModel, "date", "DESC"],
  //       [ComentModel, "createdAt", "DESC"],
  //     ],
  //   });

  //   if (!shops) {
  //     return res.status(404).json({ message: "No shops found for this user" });
  //   }

  //   console.log("[INFO] User data retrieved successfully", shops);
  //   res.status(200).json({
  //     message: "User data retrieved successfully",
  //     shops: shops,
  //   });
  // } catch (error) {
  //   console.error("[ERROR] Error retrieving user data:", error);
  //   res.status(500).json({
  //     message: "Error retrieving user data",
  //     error: error.message,
  //   });
  // }
};
