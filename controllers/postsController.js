const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const AppError = require("../utility/appError");
const APIFeatures = require("../utility/apiFeatures");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");
const filterObject = require("../utility/filterObject");

exports.addPost = catchAsync(async (req, res, next) => {
  const { content, image } = req.body;

  if (!content || !image) {
    return next(new AppError("欄位填寫不正確", httpStatusCodes.BAD_REQUEST));
  }

  const newPost = await Post.create({
    user: req.user._id,
    content,
    image,
  });

  res.status(httpStatusCodes.CREATED).send({
    status: "success",
    data: newPost,
  });
});

exports.getPostsFlexible = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const foundPosts = await features.query;

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: foundPosts,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const foundPost = await Post.findById(req.params.id);

  if (!foundPost) {
    return next(new AppError("查無此貼文", httpStatusCodes.NOT_FOUND));
  }

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: foundPost,
  });
});

exports.editPost = catchAsync(async (req, res, next) => {
  const foundPost = await Post.findById(req.params.id);

  if (!foundPost) {
    return next(new AppError("查無此貼文", httpStatusCodes.NOT_FOUND));
  }

  if (!req.user._id.equals(foundPost.user._id)) {
    return next(new AppError("您沒有操作權限", httpStatusCodes.UNAUTHORIZED));
  }

  const allowFields = ["content", "image"];
  const filteredBody = filterObject(req.body, allowFields);
  const bodyKeys = Object.keys(filteredBody);

  if (bodyKeys.length !== allowFields.length) {
    return next(new AppError("欄位填寫不正確", httpStatusCodes.UNAUTHORIZED));
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
  const postId = req.params.id;

  if (!postId) {
    return next(new AppError("缺少貼文 ID", httpStatusCodes.BAD_REQUEST));
  }

  const foundPost = await Post.findById(postId);
  if (!foundPost) {
    return next(new AppError("查無此貼文", httpStatusCodes.NOT_FOUND));
  }

  if (!req.user._id.equals(foundPost.user._id)) {
    return next(new AppError("您沒有操作權限", httpStatusCodes.UNAUTHORIZED));
  }

  await Post.findByIdAndDelete(postId);
  await Comment.deleteMany({ post: postId });

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: {
      post: postId,
    },
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const newPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: {
        likes: req.user.id,
      },
    },
    {
      new: true,
    }
  );

  if (!newPost) {
    return next(new AppError("查無貼文", httpStatusCodes.NOT_FOUND));
  }

  res.status(httpStatusCodes.CREATED).send({
    status: "success",
    data: newPost,
  });
});

exports.unlikePost = catchAsync(async (req, res, next) => {
  const newPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $pull: {
        likes: req.user.id,
      },
    },
    {
      new: true,
    }
  );

  if (!newPost) {
    return next(new AppError("查無貼文", httpStatusCodes.NOT_FOUND));
  }

  res.status(httpStatusCodes.CREATED).send({
    status: "success",
    data: newPost,
  });
});

exports.addComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  if (!content) {
    return next(new AppError("欄位填寫不正確", httpStatusCodes.BAD_REQUEST));
  }

  if (!(await Post.exists({ _id: req.params.id }))) {
    return next(new AppError("查無此貼文", httpStatusCodes.BAD_REQUEST));
  }

  const newComment = await Comment.create({
    post: req.params.id,
    user: req.user._id,
    content,
  });

  res.status(httpStatusCodes.CREATED).send({
    status: "success",
    data: newComment,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(new AppError("缺少評論 ID", httpStatusCodes.BAD_REQUEST));
  }

  const foundComment = await Comment.findById(req.params.id);
  if (!foundComment) {
    return next(new AppError("查無此評論", httpStatusCodes.NOT_FOUND));
  }

  if (!req.user._id.equals(foundComment.user._id)) {
    return next(new AppError("您沒有操作權限", httpStatusCodes.UNAUTHORIZED));
  }

  await Comment.findByIdAndDelete(req.params.id);

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: {
      comment: req.params.id,
    },
  });
});

// 刪除登入者所有貼文
exports.deleteAllPosts = catchAsync(async (req, res, next) => {
  if (req.originalUrl === "/api/v1/posts/") {
    this.deletePost(req, res, next);
    return;
  }

  const updatedRes = await Post.updateMany(
    { user: req.user._id },
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
