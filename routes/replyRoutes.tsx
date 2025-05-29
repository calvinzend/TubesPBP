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
import { body, param } from "express-validator";
import { validateRequest } from "../middware/validateRequest";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/replies/:reply_id", [param("reply_id").isString().withMessage("Reply ID must be a string")], validateRequest, reply);

router.get("/user/:user_id/replies", [param("user_id").isString().withMessage("User ID must be a string")], validateRequest, userReply);

router.get("/posts/:tweet_id/replies", [param("tweet_id").isString().withMessage("Tweet ID must be a string")], validateRequest, postReply);

router.post(
  "/posts/:tweet_id/replies",
  upload.single("image_path"),
  [param("tweet_id").isString().withMessage("Tweet ID must be a string"), body("content").notEmpty().withMessage("Content is required")],
  validateRequest,
  createReply
);

router.put(
  "/replies/:reply_id",
  upload.single("image_path"),
  [param("reply_id").isString().withMessage("Reply ID must be a string"), body("content").optional().isString()],
  validateRequest,
  editReply
);

router.delete("/replies/:reply_id", [param("reply_id").isString().withMessage("Reply ID must be a string")], validateRequest, deleteReply);

export default router;