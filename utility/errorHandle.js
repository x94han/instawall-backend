const AppError = require("./appError");
const httpStatusCodes = require("./httpStatusCodes");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(httpStatusCodes.INTERNAL_SERVER).json({
      status: "error",
      message: "系統錯誤，請洽系統管理員！",
    });
  }
};

const errorHandle = (err, req, res, next) => {
  err.statusCode = err.statusCode || httpStatusCodes.INTERNAL_SERVER;
  err.status = err.status || "error";

  switch (process.env.NODE_ENV) {
    case "development":
      sendErrorDev(err, res);
      break;

    case "production":
      let copiedErr = { ...err };
      switch (err.name) {
        case "CastError":
          copiedErr = new AppError(
            `無效的 ${err.path}: ${err.value}`,
            httpStatusCodes.BAD_REQUEST
          );
          break;

        case "ValidationError": // NOTE no break intentionally
        case "ValidatorError":
          const keys = Object.keys(err.errors);
          const messages = keys.map(
            (key) => `${key}: ${err.errors[key].properties.message}`
          );
          copiedErr = new AppError(
            `資料格式有誤: ${messages.join(", ")}`,
            httpStatusCodes.BAD_REQUEST
          );
          break;

        case "MongoServerError":
          if (err.code === 11000) {
            const keys = Object.keys(err.keyPattern);
            const messages = keys.map((key) => `${key}: ${err.keyValue[key]}`);
            copiedErr = new AppError(
              `${messages.join(", ")}資料已存在`,
              httpStatusCodes.BAD_REQUEST
            );
          }
          break;

        case "TokenExpiredError":
          copiedErr = new AppError(
            `登入憑證過期，請重新登入`,
            httpStatusCodes.FORBIDDEN
          );
          break;

        case "JsonWebTokenError":
          copiedErr = new AppError(
            `登入憑證錯誤！`,
            httpStatusCodes.UNAUTHORIZED
          );
          break;
      }

      sendErrorProd(copiedErr, res);
      break;
  }
};

module.exports = errorHandle;
