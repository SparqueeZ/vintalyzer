const {
  RivalShop,
  RivalArticles,
  RivalComments,
  RivalReplies,
} = require("../models");
const { v4: uuidv4 } = require("uuid"); // Import UUID library

exports.saveData = async (req, res) => {
  console.log("[INFO] User trying to save analysis data");
  const userId = req.user.id;
  console.log("[INFO] User ID:", userId);
  const data = req.body.shopData;
  const shopData = data.shop;
  const articlesData = data.articles;
  const commentsData = data.evaluations;

  try {
    // Save shop data
    shopData.userId = userId;
    let shop = await RivalShop.findOne({ where: { name: shopData.name } });
    if (shop) {
      await RivalShop.update(shopData, { where: { name: shopData.name } });
      shop = await RivalShop.findOne({ where: { name: shopData.name } });
    } else {
      shop = await RivalShop.create(shopData);
    }

    // Ensure shop is defined
    if (!shop || !shop.id) {
      throw new Error("Failed to retrieve or create shop");
    }

    // Save articles data
    for (const article of articlesData) {
      if (!article.articleId) {
        article.articleId = uuidv4();
      }
      article.shopId = shop.id; // Associate with shop
      const existingArticle = await RivalArticles.findOne({
        where: { articleId: article.articleId },
      });
      if (existingArticle) {
        await RivalArticles.update(article, {
          where: { articleId: article.articleId },
        });
      } else {
        await RivalArticles.create(article);
      }
    }

    // Save comments and replies
    for (const comment of commentsData) {
      if (!comment.commentId) {
        comment.commentId = uuidv4();
      }
      comment.shopId = shop.id; // Associate with shop
      let savedComment = await RivalComments.findOne({
        where: { commentId: comment.commentId },
      });
      if (savedComment) {
        await RivalComments.update(comment, {
          where: { commentId: comment.commentId },
        });
        savedComment = await RivalComments.findOne({
          where: { commentId: comment.commentId },
        });
      } else {
        savedComment = await RivalComments.create(comment);
      }

      // Ensure comment is saved before processing replies
      if (!savedComment || !savedComment.id) {
        throw new Error("Failed to save or retrieve comment");
      }

      // Check if replies exist and are iterable
      if (Array.isArray(comment.replies)) {
        for (const reply of comment.replies) {
          if (!reply.replyId) {
            reply.replyId = uuidv4();
          }
          reply.memberName = reply.author;
          reply.commentId = savedComment.id;
          const existingReply = await RivalReplies.findOne({
            where: { replyId: reply.replyId },
          });
          if (existingReply) {
            await RivalReplies.update(reply, {
              where: { replyId: reply.replyId },
            });
          } else {
            await RivalReplies.create(reply);
          }
        }
      }
    }

    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("[ERROR] Failed to save data:", error);
    res.status(500).json({ message: "Failed to save data", error });
  }
};

exports.getRivalShopDataByUserId = async (req, res) => {
  const userId = req.user.id;

  try {
    console.log("[INFO] Fetching RivalShop data for user ID:", userId);

    // Fetch RivalShops for the given user
    const rivalShops = await RivalShop.findAll({
      where: { userId },
      include: [
        {
          model: RivalArticles,
          as: "articles",
        },
        {
          model: RivalComments,
          as: "comments",
          include: [
            {
              model: RivalReplies,
              as: "replies",
            },
          ],
        },
      ],
    });

    if (!rivalShops || rivalShops.length === 0) {
      return res
        .status(404)
        .json({ message: "No RivalShop data found for this user." });
    }

    // Structure the data into JSON format
    const structuredData = rivalShops.map((shop) => ({
      shop: {
        id: shop.id,
        name: shop.name,
        location: shop.location,
        followers: shop.followers,
        globalRating: shop.globalRating,
        evaluationsCount: shop.evaluationsCount,
        ratingNumber: shop.ratingNumber,
        autoRating: {
          amount: shop.autoRatingAmount,
          rating: shop.autoRatingRating,
        },
        membersRating: {
          amount: shop.membersRatingAmount,
          rating: shop.membersRatingRating,
        },
      },
      articles: shop.articles.map((article) => ({
        id: article.id,
        brand: article.brand,
        likes: article.likes,
        price: article.price,
        priceWithProtection: article.priceWithProtection,
        protectionFee: article.protectionFee,
      })),
      comments: shop.comments.map((comment) => ({
        id: comment.id,
        memberName: comment.memberName,
        content: comment.content,
        date: comment.date,
        rating: comment.rating,
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          memberName: reply.memberName,
          content: reply.content,
        })),
      })),
    }));

    res.status(200).json(structuredData);
  } catch (error) {
    console.error("[ERROR] Failed to fetch RivalShop data:", error);
    res.status(500).json({ message: "Failed to fetch RivalShop data", error });
  }
};
