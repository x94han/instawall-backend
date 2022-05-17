const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required."],
    },
    content: {
      type: String,
      required: [true, "Content is required."],
    },
    images: {
      type: [String],
    },
    status: {
      type: Number,
      enum: [0, 1, 2], // 0: original, 1: edited, 2: editing
      default: 0,
    },
    validity: {
      type: Number,
      enum: [0, 1, 0], // 0: invalid, 1: valid, 9: lock
      default: 1,
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
    },
    userUpdateAt: {
      type: Date,
    },
    like: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
