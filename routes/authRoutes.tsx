import express from "express";
import multer from "multer";
import { register, login } from "../controller/authController";
import { storage } from "../utils/multerStorage";
import { body } from "express-validator";
import { validateRequest } from "../middware/validateRequest";

const upload = multer({ storage });
const router = express.Router();

router.post("/register", upload.single("profilePicture"),
[
    body("username").notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("name").notEmpty().withMessage("Name is required"),
    body("name").isString().withMessage("Name must be a string"),
    body("email").isEmail().withMessage("Invalid email format"),
    validateRequest
]
, register);
router.post("/login", login);

export default router;