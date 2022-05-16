const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utility/appError");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");

// 簽發憑證
const createAndSendToken = async (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(statusCode).send({
    status: "success",
    token,
    data: user,
  });
};

// 註冊
exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, screenName } = req.body;

  if (!email || !password || !passwordConfirm || !screenName) {
    next(new AppError("欄位填寫不正確", httpStatusCodes.BAD_REQUEST));
  }

  const newUser = await User.create({
    email,
    password,
    passwordConfirm,
    screenName,
  });

  await createAndSendToken(newUser, httpStatusCodes.CREATED, res);
});

// 登入
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("請輸入信箱或密碼", httpStatusCodes.BAD_REQUEST));

  const foundUser = await User.findOne({ email }).select("+password");
  if (
    !foundUser ||
    !(await foundUser.isCorrectPassword(password, foundUser.password))
  )
    return next(new AppError("帳號或密碼錯誤", httpStatusCodes.UNAUTHORIZED));

  await createAndSendToken(foundUser, httpStatusCodes.OK, res);
});
