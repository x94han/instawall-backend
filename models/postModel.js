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
      trim: true,
      required: [true, "Content is required."],
    },
    image: {
      type: String,
      required: [true, "Image is required."],
      validate: {
        validator: function (el) {
          return el.startsWith("http") || el.startsWith("https");
        },
        message: "圖片網址應為 http 或 https 開頭",
      },
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
    id: false,
  }
);

// 取得貼文數量
postSchema.statics.postsCount = async function (user) {
  return this.model("Post").countDocuments({ user });
};

postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

postSchema.pre(/^find/, async function (next) {
  this.populate({
    path: "user",
    select: "screenName avatar",
  }).populate("comments");
  next();
});

const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
