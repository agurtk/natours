/* eslint-disable no-console */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(
    `💥💥💥💥 error name: ${err.name} error message: ${err.message} 💥💥💥💥`,
  );
  console.log(`💥💥💥💥 err: ${err} 💥💥💥💥`);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DB.replace("<PASSWORD>", process.env.DB_PASSWORD);

// web connect
mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
});

// local connect
// mongoose.connect(process.env.DB_LOCAL).then(() => {
//   console.log("DB connection successful!");
// });

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log("💥💥💥💥", err.name, err.message, "💥💥💥💥");
  server.close(() => {
    process.exit(1);
  });
});

// SIGTERM signal basically for Heroku config
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥💥💥💥 Process terminated! 💥💥💥💥");
  })
})
