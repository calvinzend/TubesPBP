import { Router } from "express";
import { follower, following, addFollower } from "../controller/followController";
import { param } from "express-validator";
import { validateRequest } from "../middware/validateRequest";

const router = Router();

router.get("/followers/:user_id", [param("user_id").isString().withMessage("User ID must be a string")], validateRequest, follower);

router.get("/following/:following_id", [param("following_id").isString().withMessage("Following ID must be a string")], validateRequest, following);

router.post("/follow/:following_id", [param("following_id").isString().withMessage("Following ID must be a string")], validateRequest, addFollower);

export default router;