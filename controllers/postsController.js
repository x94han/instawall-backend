const Post = require("../models/postModel");
const AppError = require("../utility/appError");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");
const filterObject = require("../utility/filterObject");

exports.addNewPost = catchAsync(async (req, res, next) => {
  const { author, content, images } = req.body;

  if (!author || !content) {
    next(new AppError("欄位填寫不正確", httpStatusCodes.BAD_REQUEST));
  }

  const newPost = await Post.create({
    author,
    content,
    images,
  });

  res.status(httpStatusCodes.CREATED).send({
    status: "success",
    data: newPost,
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find();

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

  // 檢查並限制可編輯的欄位
  const allowFields = ["content", "images"];
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
    { active: true }
  );

  if (!updatedRes.acknowledged) {
    return next(new AppError("發生錯誤", httpStatusCodes.BAD_REQUEST));
  }

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: updatedRes,
  });
});
