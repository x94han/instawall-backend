const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/*
  gender
    0 = Not known;
    1 = Male;
    2 = Female;
    3 = Gender other/diverse
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
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password."],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    screenName: {
      type: String,
      required: [true, "ScreenName is required."],
    },
    avatar: {
      type: String,
    },
    gender: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
