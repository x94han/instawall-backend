const express = require("express");
const uploadCtrl = require("../controllers/uploadController");
const authCtrl = require("../controllers/authController");
const router = express.Router();

router.post(
  "/avatar",
  uploadCtrl.checkAvatar,
  authCtrl.protect,
  uploadCtrl.getImgurUrl
);

router.post(
  "/image",
  uploadCtrl.checkImage,
  authCtrl.protect,
  uploadCtrl.getImgurUrl
);

module.exports = router;
