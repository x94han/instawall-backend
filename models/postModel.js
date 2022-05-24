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
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  { versionKey: false }
);

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "Post",
});

postSchema.pre(/^find/, async function (next) {
  this.find({ active: true });
  this.populate({
    path: "author",
    select: "screenName images createdAt",
  });
  next();
});

const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
