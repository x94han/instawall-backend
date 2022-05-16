const express = require("express");
const usersCtrl = require("../controllers/usersController");
const authCtrl = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authCtrl.signup);

router.route("/").get(usersCtrl.getAllUsers).post(usersCtrl.addNewUser);
router.route("/:id").patch(usersCtrl.updateUser);

module.exports = router;
