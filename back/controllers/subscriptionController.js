const User = require("../models/userModel");
const Subscription = require("../models/subscriptionModel");
const userSubscription = require("../models/userSubscriptionModel");
const subscriptionHistory = require("../models/subscriptionHistoryModel");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

exports.getUserSubscription = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findOne({
      where: { id: id },
      include: [
        {
          model: Subscription,
          attributes: ["name", "price", "frequency", "createdAt", "updatedAt"],
          through: { attributes: ["status", "startDate", "endDate"] },
        },
      ],
    });
    const subscription = {
      ...user.Subscriptions[0].toJSON(),
      status: user.Subscriptions[0].UserSubscription.status,
      startDate: user.Subscriptions[0].UserSubscription.startDate,
      endDate: user.Subscriptions[0].UserSubscription.endDate,
    };

    res.status(200).json(subscription);
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la récupération des abonnements de l'utilisateur.",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des abonnements de l'utilisateur.",
    });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll();
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la récupération des abonnements.",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des abonnements." });
  }
};

exports.getUserSubscriptionHistory = async (req, res) => {
  const { id } = req.user;

  try {
    const userSub = await userSubscription.findOne({
      where: { userId: id },
    });

    if (!userSub) {
      return res
        .status(404)
        .json({ message: "Aucun abonnement trouvé pour cet utilisateur" });
    }

    const history = await subscriptionHistory.findAll({
      where: { userSubscriptionId: userSub.id },
      attributes: {
        exclude: ["id", "userSubscriptionId"],
      },
      include: [
        {
          model: Subscription,
          attributes: ["name", "price", "frequency", "plan"],
        },
      ],
      order: [["startDate", "DESC"]],
    });

    // Transformer la réponse pour avoir une structure plus propre
    const formattedHistory = history.map((item) => ({
      status: item.status,
      startDate: item.startDate,
      endDate: item.endDate,
      changeReason: item.changeReason,
      name: item.Subscription.name,
      price: item.Subscription.price,
      frequency: item.Subscription.frequency,
      plan: item.Subscription.plan,
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la récupération de l'historique des abonnements d'un utilisateur.",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération de l'historique des abonnements.",
    });
  }
};
