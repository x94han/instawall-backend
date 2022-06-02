const Post = require("../models/postModel");
const AppError = require("../utility/appError");
const APIFeatures = require("../utility/apiFeatures");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");
const filterObject = require("../utility/filterObject");

exports.addNewPost = catchAsync(async (req, res, next) => {
  const allowFields = ["author", "content", "image"];
  const filteredBody = filterObject(req.body, allowFields);

  if (Object.keys(filteredBody).length === 0) {
    return next(new AppError("欄位未填寫", httpStatusCodes.BAD_REQUEST));
  }

  const newPost = await Post.create(filteredBody);

  res.status(httpStatusCodes.CREATED).send({
    status: "success",
    data: newPost,
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const posts = await features.query;

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: posts,
  });
});

exports.editPost = catchAsync(async (req, res, next) => {
  const foundPost = await Post.findById(req.params.id);

  if (!foundPost) {
    return next(new AppError("查無此貼文", httpStatusCodes.NOT_FOUND));
  }

  if (!req.user._id.equals(foundPost.author._id)) {
    return next(new AppError("您沒有操作權限", httpStatusCodes.UNAUTHORIZED));
  }

  const allowFields = ["content", "image"];
  const filteredBody = filterObject(req.body, allowFields);
  const bodyKeys = Object.keys(filteredBody);

  if (bodyKeys.length === 0) {
    return next(new AppError("欄位未填寫", httpStatusCodes.UNAUTHORIZED));
  }

  bodyKeys.forEach((key) => {
    foundPost[key] = filteredBody[key];
  });

  const editedPost = await foundPost.save();

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: editedPost,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const foundPost = await Post.findById(req.params.id);

  if (!foundPost) {
    return next(new AppError("查無此貼文", httpStatusCodes.NOT_FOUND));
  }

  if (!req.user._id.equals(foundPost.author._id)) {
    return next(new AppError("您沒有操作權限", httpStatusCodes.UNAUTHORIZED));
  }

  foundPost.active = false;
  await foundPost.save();

  res.status(httpStatusCodes.NO_CONTENT).send();
});

// 刪除登入者所有貼文
exports.deleteAllPosts = catchAsync(async (req, res, next) => {
  const updatedRes = await Post.updateMany(
    { author: req.user._id },
    { active: false }
  );

  if (!updatedRes.acknowledged) {
    return next(new AppError("發生錯誤", httpStatusCodes.BAD_REQUEST));
  }

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: updatedRes,
  });
});
