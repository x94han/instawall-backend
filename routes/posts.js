const express = require("express");
const postsCtrl = require("../controllers/postsController");
const router = express.Router();

router.route("/").get(postsCtrl.getAllPosts).post(postsCtrl.addNewPost);

module.exports = router;
