const User = require("../models/userModel");
const AppError = require("../utility/appError");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");

exports.getProfile = catchAsync(async (req, res, next) => {
  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: req.user,
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { screenName, avatar, gender } = req.body;
  const editedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      screenName,
      avatar,
      gender,
    },
    { new: true, runValidators: true }
  );

  if (!editedUser) {
    return next(new AppError("查無此使用者", httpStatusCodes.NOT_FOUND));
  }

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: editedUser,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: users,
  });
});
