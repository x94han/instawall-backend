const express = require("express");
const usersCtrl = require("../controllers/usersController");
const followsCtrl = require("../controllers/followsController");
const authCtrl = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authCtrl.signup);
router.post("/login", authCtrl.login);
router.patch("/updatePassword", authCtrl.protect, authCtrl.updatePassword);

router.get("/likes", authCtrl.protect, usersCtrl.getLikeList);
router.get("/:id/followings", authCtrl.protect, followsCtrl.getFollowings);
router.get("/:id/fans", authCtrl.protect, followsCtrl.getFans);

router
  .route("/:id/profile")
  .get([authCtrl.protect, usersCtrl.getProfile])
  .patch([authCtrl.protect, usersCtrl.updateProfile]);

router
  .route("/:id/follow")
  .post([authCtrl.protect, followsCtrl.follow])
  .delete([authCtrl.protect, followsCtrl.unfollow]);

router.route("/").get(usersCtrl.getAllUsers);

module.exports = router;
