const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: [true, "PostId is required."],
    },
    type: {
      type: Number,
      enum: [0, 1], // 0: comment, 1: reply
      required: [true, "Type is required."],
    },
    author: {
      type: String,
      required: [true, "UserId is required."],
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
      enum: [0, 1, 9], // 0: original, 1: edited, 9: editing
      default: 0,
    },
    validity: {
      type: Number,
      enum: [0, 1, 9], // 0: invalid, 1: valid, 9: lock
      default: 1,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
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

const Comment = new mongoose.model("Comment", commentSchema);

module.exports = Comment;
