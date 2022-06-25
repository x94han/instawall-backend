const { promisify } = require("util");
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

  if (!email || !password) {
    return next(new AppError("請輸入信箱或密碼", httpStatusCodes.BAD_REQUEST));
  }

  const foundUser = await User.findOne({ email }).select("+password");
  if (
    !foundUser ||
    !(await foundUser.isCorrectPassword(password, foundUser.password))
  ) {
    return next(new AppError("帳號或密碼錯誤", httpStatusCodes.UNAUTHORIZED));
  }

  await createAndSendToken(foundUser, httpStatusCodes.OK, res);
});

// 阻擋不合格 token
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 檢查是否有 token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("請先登入", httpStatusCodes.UNAUTHORIZED));
  }

  // 檢查 token 有效性與解碼
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 找出該憑證使用者
  const foundUser = await User.findById(decode.id);
  if (!foundUser) {
    return next(
      new AppError("登入憑證有問題，請重新登入", httpStatusCodes.UNAUTHORIZED)
    );
  }

  req.user = foundUser;
  next();
});

// 更新密碼
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  const foundUser = await User.findById(req.user.id).select("+password");

  // 檢查密碼是否正確
  if (
    !(await foundUser.isCorrectPassword(currentPassword, foundUser.password))
  ) {
    return next(new AppError("密碼不正確", httpStatusCodes.UNAUTHORIZED));
  }

  // 更新密碼
  foundUser.password = password;
  foundUser.passwordConfirm = passwordConfirm;
  await foundUser.save();

  // 更新 JWT
  await createAndSendToken(foundUser, httpStatusCodes.OK, res);
});
