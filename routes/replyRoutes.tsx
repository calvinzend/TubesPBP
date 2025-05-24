import express from "express";
import multer from "multer";
import {
  reply,
  userReply,
  postReply,
  createReply,
  editReply,
  deleteReply,
} from "../controller/replyController";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("replies/:reply_id", reply);

router.get("/user/:user_id/replies", userReply);

router.get("/posts/:tweet_id/replies", postReply);

router.post("/posts/:tweet_id/replies", upload.single("image_image"), createReply);

router.put("/replies/:reply_id", upload.single("image_image"), editReply);

router.delete("/replies/:reply_id", deleteReply);

export default router;
