const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Following is required."],
    },
  },
  {
    versionKey: false,
  }
);

// 取得追蹤者數量
followSchema.statics.followingsCount = async function (user) {
  return this.model("Follow").countDocuments({ user });
};

// 取得粉絲數量
followSchema.statics.fansCount = async function (user) {
  return this.model("Follow").countDocuments({ following: user });
};

// 是否重複追蹤
followSchema.statics.isFollowed = async function (user, following) {
  const found = await this.model("Follow").exists({ user, following });
  return found ? true : false;
};

const Follow = new mongoose.model("Follow", followSchema);

module.exports = Follow;
