import { Router } from "express";
import multer from "multer";
import {
  allPost,
  post,
  postUser,
  getTweetThread,
  createPost,
} from "../controller/postController";
import { storage } from "../utils/multerStorage"; 

const router = Router();

const upload = multer({ storage });

router.get("/posts", allPost);

router.get("/posts/:id", post);

router.get("/posts/user/:user_id", postUser);

router.get("/posts/:tweet_id/thread", getTweetThread);

router.post("/posts", upload.single("image"), createPost);

export default router;