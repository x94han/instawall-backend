const User = require("../models/userModel");
const Post = require("../models/postModel");
const Follow = require("../models/followModel");
const AppError = require("../utility/appError");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");
const filterObject = require("../utility/filterObject");

exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const postsCount = await Post.postsCount(req.params.id);
  const fansCount = await Follow.fansCount(req.params.id);
  const followingsCount = await Follow.followingsCount(req.params.id);
  const isFollowed = await Follow.isFollowed(req.user.id, req.params.id);

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: {
      user,
      postsCount,
      fansCount,
      followingsCount,
      isFollowed,
    },
  });
});

// 修改登入者資料
exports.updateProfile = catchAsync(async (req, res, next) => {
  const allowFields = ["screenName", "avatar", "gender"];
  const filteredBody = filterObject(req.body, allowFields);

  if (Object.keys(filteredBody).length === 0) {
    return next(new AppError("欄位未填寫", httpStatusCodes.BAD_REQUEST));
  }

  const editedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
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
    select: "screenName avatar",
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
