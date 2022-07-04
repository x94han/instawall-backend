const AppError = require("./appError");
const httpStatusCodes = require("./httpStatusCodes");

const handleSyntaxError = (err, res) => {
  return new AppError(err.message, httpStatusCodes.BAD_REQUEST);
};

const handleCastErrorDB = (err, res) => {
  return new AppError(`${err.path} 格式錯誤`, httpStatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err, res) => {
  const keys = Object.keys(err.errors);
  const messages = keys.map((key) => `${key}: ${err.errors[key].name}`);
  return new AppError(
    `資料有誤 ${messages.join(", ")}`,
    httpStatusCodes.BAD_REQUEST
  );
};

const handleValidatorErrorDB = (err, res) => {
  const keys = Object.keys(err.errors);
  const messages = keys.map(
    (key) => `${key}: ${err.errors[key].properties.message}`
  );
  return new AppError(
    `資料有誤: ${messages.join(", ")}`,
    httpStatusCodes.BAD_REQUEST
  );
};

const handleDuplicateFieldsErrorDB = (err, res) => {
  if (err.code === 11000) {
    const keys = Object.keys(err.keyPattern);
    const messages = keys.map((key) => `${key}: ${err.keyValue[key]}`);
    return new AppError(
      `${messages.join(", ")}資料已存在`,
      httpStatusCodes.BAD_REQUEST
    );
  }
};

const handleTokenExpiredError = (err, res) => {
  return new AppError(`登入憑證過期，請重新登入`, httpStatusCodes.FORBIDDEN);
};

const handleJsonWebTokenError = (err, res) => {
  return new AppError(`登入憑證錯誤！`, httpStatusCodes.UNAUTHORIZED);
};

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

  let copiedErr = { ...err };
  copiedErr.message = err.message;

  switch (process.env.NODE_ENV) {
    case "development":
      sendErrorDev(copiedErr, res);
      break;

    case "production":
      switch (err.name) {
        case "SyntaxError":
          copiedErr = handleSyntaxError(copiedErr, res);
          break;

        case "CastError":
          copiedErr = handleCastErrorDB(copiedErr, res);
          break;

        case "ValidationError":
          copiedErr = handleValidationErrorDB(copiedErr, res);
          break;

        case "ValidatorError":
          copiedErr = handleValidatorErrorDB(copiedErr, res);
          break;

        case "MongoServerError":
          copiedErr = handleDuplicateFieldsErrorDB(copiedErr, res);
          break;

        case "TokenExpiredError":
          copiedErr = handleTokenExpiredError(copiedErr, res);
          break;

        case "JsonWebTokenError":
          copiedErr = handleJsonWebTokenError(copiedErr, res);
          break;
      }

      sendErrorProd(copiedErr, res);
      break;
  }
};

module.exports = errorHandle;
