import { Router } from "express";
import multer from "multer";
import {
  allPost,
  post,
  postUser,
  getTweetThread,
  createPost,
  editPost,      // Tambahkan ini
  deletePost  
} from "../controller/postController";
import { storage } from "../utils/multerStorage"; 

const router = Router();

const upload = multer({ storage });

router.get("/posts", allPost);

router.get("/posts/:id", post);

router.get("/posts/user/:user_id", postUser);

router.get("/posts/:tweet_id/thread", getTweetThread);

router.post("/posts", upload.single("image"), createPost);

router.put("/posts/:id", upload.single("image"), editPost);  
    // Edit post
router.delete("/posts/:id", deletePost);                         // Delete post & replies


export default router;