import { Router } from "express";
import multer from "multer";
import {
  allPost,
  post,
  postUser,
  getTweetThread,
  createPost,
  editPost,
  deletePost  
} from "../controller/postController";
import { storage } from "../utils/multerStorage"; 
import { body, param } from "express-validator";
import { validateRequest } from "../middware/validateRequest";

const router = Router();

const upload = multer({ storage });

router.get("/posts", allPost);

router.get("/posts/:id", [param("id").isString().withMessage("Post ID must be a string")], validateRequest, post);

router.get("/posts/user/:user_id", [param("user_id").isString().withMessage("User ID must be a string")], validateRequest, postUser);

router.get("/posts/:tweet_id/thread", [param("tweet_id").isString().withMessage("Tweet ID must be a string")], validateRequest, getTweetThread);

router.post(
  "/posts",
  upload.single("image"),
  validateRequest,
  createPost
);

router.put(
  "/posts/:id",
  upload.single("image"),
  [param("id").isString().withMessage("Post ID must be a string")],
  validateRequest,
  editPost
);

router.delete("/posts/:id", [param("id").isString().withMessage("Post ID must be a string")], validateRequest, deletePost);

export default router;