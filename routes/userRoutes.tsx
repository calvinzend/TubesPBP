import { Router } from "express";
import { allUser, userDetail, updateUser, deleteUser } from "../controller/userController";

const router = Router();

router.get("/users", allUser);

router.get("/users/:id", userDetail);

router.put("/users/:id", updateUser);

router.delete("/users/:id", deleteUser);

export default router;