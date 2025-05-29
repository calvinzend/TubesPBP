import { Router } from "express";
import { allUser, userDetail, updateUser, deleteUser, searchUser } from "../controller/userController";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middware/validateRequest";

const router = Router();

router.get("/users/search", [query("q").optional().isString()], validateRequest, searchUser);

router.get("/users", allUser);

router.get("/users/:id", [param("id").isString().withMessage("User ID must be a string")], validateRequest, userDetail);

router.put(
  "/users/:id",
  [
    param("id").isString().withMessage("User ID must be a string"),
    body("name").optional().isString(),
    body("email").optional().isEmail(),
  ],
  validateRequest,
  updateUser
);

router.delete("/users/:id", [param("id").isString().withMessage("User ID must be a string")], validateRequest, deleteUser);

export default router;