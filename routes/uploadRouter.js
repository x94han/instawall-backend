const express = require("express");
const uploadCtrl = require("../controllers/uploadController");
const authCtrl = require("../controllers/authController");
const router = express.Router();

router.post(
  "/avatar",
  authCtrl.protect,
  uploadCtrl.checkAvatar,
  uploadCtrl.getImgurUrl
);

router.post(
  "/image",
  authCtrl.protect,
  uploadCtrl.checkImage,
  uploadCtrl.getImgurUrl
);

module.exports = router;
