const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required."],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
    },
    content: {
      type: String,
      required: [true, "Content is required."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

commentSchema.pre(/^find/, async function (next) {
  this.populate({
    path: "user",
    select: "screenName avatar",
  });
  next();
});

const Comment = new mongoose.model("Comment", commentSchema);

module.exports = Comment;
