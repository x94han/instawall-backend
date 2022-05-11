const mongoose = require("mongoose");

/*
  gender
    0 = Not known;
    1 = Male;
    2 = Female;
    9 = Not applicable.
*/

const userSchema = new mongoose.Schema(
  {
    account: {
      type: String,
      required: [true, "Account is required."],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: 8,
    },
    screenName: {
      type: String,
      required: [true, "ScreenName is required."],
    },
    avatar: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["u", "f", "m"],
      default: "u",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

const User = new mongoose.model("User", userSchema);

module.exports = User;
