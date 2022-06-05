const express = require("express");
const postsCtrl = require("../controllers/postsController");
const authCtrl = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get([authCtrl.protect, postsCtrl.getAllPosts])
  .post([authCtrl.protect, postsCtrl.addNewPost])
  .delete([authCtrl.protect, postsCtrl.deleteAllPosts]);

router
  .route("/:id")
  .patch([authCtrl.protect, postsCtrl.editPost])
  .delete([authCtrl.protect, postsCtrl.deletePost]);

router
  .route("/:id/likes")
  .post([authCtrl.protect, postsCtrl.likePost])
  .delete([authCtrl.protect, postsCtrl.unlikePost]);

module.exports = router;
