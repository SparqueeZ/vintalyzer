/**
 * Railway production server entry point
 */
const dotenv = require("dotenv");

// Load the right environment file
if (process.env.NODE_ENV === "production") {
  console.log("Loading production environment");
  dotenv.config({ path: ".env.production" });
} else {
  console.log("Loading development environment");
  dotenv.config();
}

// Start the application
require("./index");
