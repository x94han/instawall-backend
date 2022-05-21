const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "PostId is required."],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserId is required."],
    },
    content: {
      type: String,
      required: [true, "Content is required."],
    },
    status: {
      // 0: original, 1: edited, 2: editing, 3: locked, 4: ban
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    userUpdatedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  { versionKey: false }
);

userSchema.pre(/^find/, async function (next) {
  this.find({ active: true });
  next();
});

const Comment = new mongoose.model("Comment", commentSchema);

module.exports = Comment;
