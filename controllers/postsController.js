const Post = require("../models/postModel");
const AppError = require("../utility/appError");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");

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
  const posts = await Post.find().populate({
    path: "author",
    select: "screenName avatar",
  });
  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: posts,
  });
});
