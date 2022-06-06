const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
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
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

postSchema.pre(/^find/, async function (next) {
  this.find({ active: true });
  this.populate({
    path: "user",
    select: "screenName avatar",
  }).populate("comments");
  next();
});

const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
