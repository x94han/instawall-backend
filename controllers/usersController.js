const User = require("../models/userModel");
const Post = require("../models/postModel");
const AppError = require("../utility/appError");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");
const filterObject = require("../utility/filterObject");

// 取得登入者資料
exports.getProfile = catchAsync(async (req, res, next) => {
  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: req.user,
  });
});

// 修改登入者資料
exports.updateProfile = catchAsync(async (req, res, next) => {
  const allowFields = ["screenName", "avatar", "gender"];
  const filteredBody = filterObject(req.body, allowFields);

  if (Object.keys(filteredBody).length === 0) {
    return next(new AppError("欄位未填寫", httpStatusCodes.BAD_REQUEST));
  }

  const editedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!editedUser) {
    return next(new AppError("查無此使用者", httpStatusCodes.NOT_FOUND));
  }

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: editedUser,
  });
});

// 取得登入者按讚列表
exports.getLikeList = catchAsync(async (req, res, next) => {
  const likeList = await Post.find({
    likes: {
      $in: req.user._id,
    },
  }).populate({
    path: "likes",
    selet: "screenName",
  });

  if (!likeList) {
    return next(new AppError("查無按讚資料", httpStatusCodes.NOT_FOUND));
  }

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: likeList,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: users,
  });
});
