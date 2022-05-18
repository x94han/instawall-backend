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

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let copiedErr = { ...err };
    switch (err.name) {
      case "CastError":
        copiedErr = new AppError(
          `Invalid ${err.path}: ${err.value}`,
          httpStatusCodes.BAD_REQUEST
        );
        break;

      case "MongoServerError":
        if (err.code === 11000) {
          const values = Object.values(err.keyValue).join(", ");
          copiedErr = new AppError(
            `Duplicate field value: ${values}.`,
            httpStatusCodes.BAD_REQUEST
          );
        }
        break;

      case "TokenExpiredError":
        copiedErr = new AppError(
          `登入憑證過期，請重新登入`,
          httpStatusCodes.BAD_REQUEST
        );
        break;

      case "JsonWebTokenError":
        copiedErr = new AppError(`登入憑證錯誤！`, httpStatusCodes.BAD_REQUEST);
        break;
    }
    sendErrorProd(copiedErr, res);
  }
};

module.exports = errorHandle;
