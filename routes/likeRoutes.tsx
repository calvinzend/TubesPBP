import { Router } from "express";
import { allReply, addReply } from "../controller/likeController";
import { param } from "express-validator";
import { validateRequest } from "../middware/validateRequest";

const router = Router();

router.get("/like/:tweet_id", [param("tweet_id").isString().withMessage("Tweet ID must be a string")], validateRequest, allReply);

router.post("/like/:tweet_id", [param("tweet_id").isString().withMessage("Tweet ID must be a string")], validateRequest, addReply);

export default router;