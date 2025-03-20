const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./configs/db.js");
const Role = require("./models/roleModel");
const cors = require("cors");
const bodyParser = require("body-parser");
const UserSubscription = require("./models/userSubscriptionModel");
const SubscriptionHistory = require("./models/subscriptionHistoryModel");
const Subscription = require("./models/subscriptionModel");
const User = require("./models/userModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const emailDetectionController = require("./controllers/emailDetectionController.js");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure cors before any routes
app.use(
  cors({
    origin: [
      process.env.FRONT_URL,
      "http://192.168.1.11:3000",
      "chrome-extension://nilnijhogiifjkbgbiaaonkcckemnfpd",
      "chrome-extension://mpnhomcmacodllmklmaecenfliofknjk",
    ],
    credentials: true,
    sameSite: "none",
  })
);

app.use(cookieParser());

const plans = [
  {
    link: "https://buy.stripe.com/test_aEUdTO6GDfg646s001",
    stripePriceId: "price_1QxxeGFMF8GHiO3i3X2juXTK",
    name: "Basic",
    price: 5,
    frequency: "monthly",
    plan: "basic",
  },
  {
    link: "https://buy.stripe.com/test_14k7vq3ur4Bs32obIK",
    stripePriceId: "price_1QxxeWFMF8GHiO3ioVUBjr7w",
    name: "Standard",
    price: 10,
    frequency: "monthly",
    plan: "standard",
  },
  {
    link: "https://buy.stripe.com/test_14k1725CzaZQ0Ug5kn",
    stripePriceId: "price_1QxxelFMF8GHiO3iQvrFceoh",
    name: "Premium",
    price: 20,
    frequency: "monthly",
    plan: "premium",
  },
];

function calculateSubscriptionEndDate(startDate) {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  // Vérifier si le jour du mois de départ existe dans le mois suivant
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  if (startDay !== endDay) {
    endDate.setDate(0);
  }

  return endDate;
}

// Webhook endpoint must be before JSON middleware
app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json", limit: "50mb" }), // Ajout de la limite
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        endpointSecret
      );

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          console.log("[SUCCESS] Checkout session completed.");
          const session = await stripe.checkout.sessions.retrieve(
            event.data.object.id,
            {
              expand: ["line_items"],
            }
          );

          const customerId = session.customer;
          const customer = await stripe.customers.retrieve(customerId);

          const priceId = session.line_items.data[0].price.id;
          const plan = await Subscription.findOne({
            where: { stripePriceId: priceId },
          });

          if (!plan) {
            console.error("No subscription found in database.");
            return;
          }

          let user;

          if (customer.email) {
            user = await User.findOne({ where: { email: customer.email } });

            if (!user) {
              user = await User.create({ email: customer.email });
            }
          } else {
            console.error("No user found.");
            return;
          }

          const startDate = new Date();
          const endDate = calculateSubscriptionEndDate(startDate);

          // Create a subscription if it doesn't exist
          const existingSubscription = await UserSubscription.findOne({
            where: { userId: user.id },
          });

          let userSubscription = existingSubscription;
          if (!existingSubscription) {
            userSubscription = await UserSubscription.create({
              userId: user.id,
              subscriptionId: plan.id,
              stripeCustomerId: customerId,
              startDate: startDate,
              endDate: endDate,
            });
          } else {
            // Mettre à jour les dates de l'abonnement existant
            userSubscription.subscriptionId = plan.id;
            userSubscription.startDate = startDate;
            userSubscription.endDate = endDate;
            await userSubscription.save();
          }
          console.log("User subscription created or updated.");

          const changeReason = "new subscription";
          // TODO : Ajouter une logique de changement  automatique du changement de plan.

          // Toggle status of user subscription in history table
          const existingSubscriptionHistory = await SubscriptionHistory.findAll(
            {
              where: { userSubscriptionId: userSubscription.id },
            }
          );
          if (existingSubscriptionHistory.length > 0) {
            for (const subscriptionHistory of existingSubscriptionHistory) {
              if (subscriptionHistory.status === "active") {
                subscriptionHistory.endDate = new Date();
                subscriptionHistory.status = "expired";
              }
              await subscriptionHistory.save();
            }
          }

          // Insert a new subscription in history
          const subscriptionHistory = await SubscriptionHistory.create({
            userSubscriptionId: userSubscription.id,
            subscriptionId: plan.id,
            status: "active",
            startDate: startDate,
            endDate: endDate,
            changeReason,
          });
          console.log("Subscription history created.");

          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const user = await User.findOne({
            where: { stripeCustomerId: subscription.customer },
          });

          if (user) {
            user.subscriptionStatus = "cancelled";
            await user.save();
          }
          break;
        }
        default:
        // console.log(`Unhandled event type ${event.type}.`);
      }

      response.json({ received: true });
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// JSON middleware for all other routes
app.use(express.json({ limit: "50mb" }));

const initializeDatabase = async () => {
  try {
    await sequelize.sync();
    console.log("[SUCCESS] Base de données synchronisée");

    // Vérifier si des rôles existent déjà
    const existingRoles = await Role.findAll();
    const existingSubscriptions = await Subscription.findAll();

    if (existingRoles.length === 0) {
      const roles = ["administrator", "moderator", "user"];
      for (const roleName of roles) {
        await Role.create({ name: roleName });
        console.log(`[SUCCESS] Rôle '${roleName}' créé`);
      }
      console.log("[SUCCESS] Initialisation des rôles terminée");
    } else {
      console.log("[INFO] Les rôles sont déjà initialisés");
    }
    if (existingSubscriptions.length === 0) {
      const subscriptions = plans;
      for (const subscription of subscriptions) {
        await Subscription.create({
          name: subscription.name,
          price: subscription.price,
          frequency: subscription.frequency,
          stripePriceId: subscription.stripePriceId,
          plan: subscription.plan,
          link: subscription.link,
        });
      }
      console.log("[SUCCESS] Initialisation des abonnements terminée");
    } else {
      console.log("[INFO] Les abonnements sont déjà initialisés");
    }
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de l'initialisation de la base de données:",
      error
    );
  }
};

sequelize
  .authenticate()
  .then(() => {
    console.log(
      "[SUCCESS] Connection to the database has been established successfully."
    );
    return initializeDatabase(); // Appeler la fonction d'initialisation
  })
  .then(() => {
    console.log(
      "[SUCCESS] Models are synchronized with the database successfully."
    );
  })
  .catch((err) =>
    console.log(
      "[ERROR] There was an error during database connection : " + err
    )
  );

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const ordersRoutes = require("./routes/ordersRoutes.js");
const salesRoutes = require("./routes/salesRoutes.js");
const subscriptionRoutes = require("./routes/subscriptionsRoutes.js");
const extensionRoutes = require("./routes/extensionRoutes.js");

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/ext", extensionRoutes);

// app.use("/api/ext/data");

app.get("/api/detect-emails", async (req, res) => {
  try {
    await emailDetectionController.testEmailConnection();
    res.status(200).send("Email detection process completed successfully.");
  } catch (error) {
    res
      .status(500)
      .send("Error during email detection process: " + error.message);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.post("/create-checkout-session", async (req, res) => {
//   const { email, plan } = req.body;

//   let user = await User.findOne({ where: { email } });
//   if (!user) {
//     user = await User.create({ email });
//   }

//   const selectedPlan = plans.find((p) => p.plan === plan);
//   if (!selectedPlan) {
//     return res.status(400).json({ error: "Invalid plan selection" });
//   }

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     mode: "subscription",
//     customer_email: email,
//     line_items: [
//       {
//         price: selectedPlan.stripePriceId,
//         quantity: 1,
//       },
//     ],
//     success_url: `${process.env.FRONT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${process.env.FRONT_URL}/cancel`,
//   });

//   res.json({ sessionId: session.id });
// });

setInterval(async () => {
  await emailDetectionController.testEmailConnection();
}, process.env.EMAIL_DETECTION_INTERVAL * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
