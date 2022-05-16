const express = require("express");
const usersCtrl = require("../controllers/usersController");
const authCtrl = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authCtrl.signup);
router.post("/login", authCtrl.login);

router.get("/profile", authCtrl.protect, usersCtrl.getProfile);
router.patch("/profile", authCtrl.protect, usersCtrl.updateProfile);

router.route("/").get(usersCtrl.getAllUsers);
// router.route("/:id").get(usersCtrl.getUser);

module.exports = router;
