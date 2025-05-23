import { Router } from "express";
import { follower, following, addFollower } from "../controller/followController";

const router = Router();

router.get("/followers/:user_id", follower);

router.get("/following/:following_id", following);

router.post("/follow/:following_id", addFollower);

export default router;