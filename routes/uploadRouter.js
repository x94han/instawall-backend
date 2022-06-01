const express = require("express");
const uploadCtrl = require("../controllers/uploadController");
const authCtrl = require("../controllers/authController");
const router = express.Router();

router.post(
  "/avatar",
  authCtrl.protect,
  uploadCtrl.checkAvatar,
  uploadCtrl.uploadAvatar
);

module.exports = router;
