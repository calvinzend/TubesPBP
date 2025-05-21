import { Router } from "express";
import { allReply, addReply } from "../controller/likeController";

const router = Router();

router.get("/like/:tweet_id", allReply);

router.post("/like/:tweet_id", addReply);

export default router;
