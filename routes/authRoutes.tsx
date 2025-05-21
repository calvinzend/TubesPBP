import express from "express";
import multer from "multer";
import { register, login } from "../controller/authController";
import { storage } from "../utils/multerStorage";

const upload = multer({ storage });
const router = express.Router();

router.post("/register", upload.single("profilePicture"), register);
router.post("/login", login);

export default router;