import { Router } from "express";
import { follower, following, addFollower } from "../controller/followController";

const router = Router();

router.get("/followers/:userId", follower);

router.get("/following/:userId", following);

router.post("/follow/:follower_id", addFollower);

export default router;