const Follow = require("../models/followModel");
const User = require("../models/userModel");
const AppError = require("../utility/appError");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");

exports.follow = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const following = req.params.id;

  if (user === following) {
    return next(new AppError("不可以追蹤自己", httpStatusCodes.BAD_REQUEST));
  }

  if (!(await User.exists({ _id: following }))) {
    return next(new AppError("查無此使用者", httpStatusCodes.BAD_REQUEST));
  }

  if (await Follow.isFollowed(user, following)) {
    return next(new AppError("已追蹤過", httpStatusCodes.BAD_REQUEST));
  }

  await Follow.create({
    user,
    following,
  });

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: {
      message: "追蹤成功",
    },
  });
});

exports.unfollow = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const following = req.params.id;

  if (user === following) {
    return next(
      new AppError("沒有退自己追蹤的功能", httpStatusCodes.BAD_REQUEST)
    );
  }

  if (!(await User.exists({ _id: following }))) {
    return next(new AppError("查無此使用者", httpStatusCodes.BAD_REQUEST));
  }

  const found = await Follow.findOne({ user, following });

  if (!found) {
    return next(new AppError("沒有追蹤紀錄", httpStatusCodes.BAD_REQUEST));
  }

  await Follow.findByIdAndDelete(found._id);

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: {
      message: "取消成功",
    },
  });
});

exports.getFollowings = catchAsync(async (req, res, next) => {
  const documents = await Follow.find({ user: req.params.id }).populate({
    path: "following",
    select: "screenName avatar",
  });
  const followings = documents.map((document) => {
    return {
      user: document.following,
      isFollowed: true,
    };
  });

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: followings,
  });
});

exports.getFans = catchAsync(async (req, res, next) => {
  const documents = await Follow.find({ following: req.params.id }).populate({
    path: "user",
    select: "screenName avatar",
  });
  const fans = await Promise.all(
    documents.map(async (document) => {
      const isFollowed = await Follow.isFollowed(
        req.user._id,
        document.user._id
      );
      return {
        user: document.user,
        isFollowed,
      };
    })
  );

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: fans,
  });
});
