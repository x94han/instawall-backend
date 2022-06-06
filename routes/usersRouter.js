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
router.get("/likes", authCtrl.protect, usersCtrl.getLikeList);
router.get("/following", authCtrl.protect, usersCtrl.getFollowing);

router
  .route("/:id/follow")
  .post([authCtrl.protect, usersCtrl.follow])
  .delete([authCtrl.protect, usersCtrl.unfollow]);

router.route("/").get(usersCtrl.getAllUsers);

module.exports = router;
