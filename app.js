const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const httpStatusCodes = require("./utility/httpStatusCodes");
const errorHandle = require("./utility/errorHandle");
const AppError = require("./utility/appError");
const indexRouter = require("./routes/index");
const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");
const { Server } = require("http");

process.on("uncaughtException", (err) => {
  console.error("Unhandled Exception! Shutting dowon...");
  console.error(err);
  process.exit(1);
});

require("dotenv").config({ path: "./config.env" });
require("./connection");

const app = express();

// 1. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
if (process.env.NODE_ENV === "development") app.use(logger("dev"));

// 2. Router Handles
app.use("/", indexRouter);
app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/users", usersRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server`,
      httpStatusCodes.NOT_FOUND
    )
  );
});

app.use(errorHandle);
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection! Shutting dowon...");
  console.error(err);
  Server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
