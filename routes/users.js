const express = require("express");
const usersCtrl = require("../controllers/usersController");
const router = express.Router();

router.route("/").get(usersCtrl.getAllUsers).post(usersCtrl.addNewUser);
router.route("/:id").patch(usersCtrl.updateUser);

module.exports = router;
