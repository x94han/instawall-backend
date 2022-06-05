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
      required: [
        function () {
          return !this.image;
        },
        "Either content or image is required",
      ],
    },
    image: {
      type: String,
      required: [
        function () {
          return !this.content;
        },
        "Either content or image is required",
      ],
    },
    active: {
      type: Boolean,
      default: true,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
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
    select: "screenName avatar",
  });
  next();
});

const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
