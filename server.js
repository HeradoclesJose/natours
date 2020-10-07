// Third party modules
const dotenv = require("dotenv");
// Setting up env vars
dotenv.config({ path: "./config.env" });
// Dev modules
const app = require("./app");
const db = require("./mongo");

process.on("uncaughtException", (err) => {
  console.log("UNHANDLED EXCEPTION! 🔥 Shutting down...");
  console.log(err.name, err.message);
  // Server.close will finish every request
  process.exit(1);
});

// Defining port
const port = process.env.PORT || 3000;

// Coneccting to DB
db.then(() => {
  console.log("DB connection successful");
});

// Starting server
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 🔥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
