const express = require("express");
const usersCtrl = require("../controllers/usersController");
const authCtrl = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authCtrl.signup);
router.post("/login", authCtrl.login);

router
  .route("/profile")
  .get([authCtrl.protect, usersCtrl.getProfile])
  .patch([authCtrl.protect, usersCtrl.updateProfile]);

router.patch("/updatePassword", authCtrl.protect, authCtrl.updatePassword);

router.route("/likes").get([authCtrl.protect, usersCtrl.getLikeList]);
router.route("/").get(usersCtrl.getAllUsers);

module.exports = router;
