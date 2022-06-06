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

// 取得登入者所有貼文
exports.getPosts = catchAsync(async (req, res, next) => {
  const foundPosts = await Post.find({ user: req.user._id });

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: foundPosts,
  });
});

exports.follow = catchAsync(async (req, res, next) => {
  const follower = req.user.id;
  const target = req.params.id;

  if (follower === target) {
    return next(new AppError("不可以追蹤自己", httpStatusCodes.BAD_REQUEST));
  }

  await User.updateOne(
    {
      _id: follower,
      "following.user": { $ne: target },
    },
    {
      $addToSet: {
        following: { user: target },
      },
    }
  );

  await User.updateOne(
    {
      _id: target,
      "followers.user": { $ne: follower },
    },
    {
      $addToSet: {
        followers: { user: follower },
      },
    }
  );

  res.status(httpStatusCodes.CREATED).send({
    status: "success",
    data: "追蹤成功",
  });
});

exports.unfollow = catchAsync(async (req, res, next) => {
  const follower = req.user.id;
  const target = req.params.id;

  if (follower === target) {
    return next(
      new AppError("沒有退自己追蹤的功能", httpStatusCodes.BAD_REQUEST)
    );
  }

  await User.findByIdAndUpdate(follower, {
    $pull: {
      following: { user: target },
    },
  });

  await User.findByIdAndUpdate(target, {
    $pull: {
      followers: { user: follower },
    },
  });

  res.status(httpStatusCodes.CREATED).send({
    status: "success",
    data: "取消追蹤成功",
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: users,
  });
});
