const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

/*
  gender
    0 = Not known;
    1 = Male;
    2 = Female;
    3 = Gender other/diverse
*/

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required."],
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email."],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required."],
      minlength: 8,
      validate: {
        validator: function (el) {
          return !validator.isNumeric(el) && !validator.isAlpha(el);
        },
        message: "密碼需數字與英文或符號混合",
      },
      select: false,
    },
    passwordConfirm: {
      type: String,
      trim: true,
      required: [true, "Please confirm your password."],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "密碼輸入不一致",
      },
      select: false,
    },
    screenName: {
      type: String,
      trim: true,
      required: [true, "ScreenName is required."],
      minlength: 2,
    },
    avatar: {
      type: String,
    },
    gender: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  { versionKey: false }
);

// 密碼如有變更，則先加密
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// 比較兩組密碼是否一致
userSchema.methods.isCorrectPassword = async function (password, DBPassword) {
  return await bcrypt.compare(password, DBPassword);
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
