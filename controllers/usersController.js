const User = require("../models/userModel");
const AppError = require("../utility/appError");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");

exports.updateUser = catchAsync(async (req, res, next) => {
  const { account, password, screenName, avatar, gender } = req.body;
  const editedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      account,
      password,
      screenName,
      avatar,
      gender,
    },
    { new: true, runValidators: true }
  );

  if (!editedUser) {
    next(new AppError("查無此使用者", httpStatusCodes.NOT_FOUND));
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
