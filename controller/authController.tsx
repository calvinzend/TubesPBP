import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import { sendResponse, sendError } from "../utils/response"; // Tambahkan import ini

const secretKey = process.env.JWT_SECRET || "your_secret_key";


export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, name, email } = req.body;
        const file = req.file;
    
        if (!username || !password || !name || !email) {
          sendError(res, "Semua field wajib diisi!", 400);
          return;
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = await User.create({
          user_id: uuidv4(),
          username,
          password: hashedPassword,
          name,
          email,
          profilePicture: file ? file.path : null,
        });
    
        sendResponse(res, { message: "User created successfully" }, 201);
      } catch (error) {
        console.error("Error creating user:", error);
        sendError(res, "Internal server error", 500);
      }
}


export const login = async (req: Request, res: Response): Promise<void> => {
    try {
    const { username, email, password } = req.body;
    const loginIdentifier = username || email; 
    if (!loginIdentifier || !password) {
      sendError(res, "Missing username/email or password", 400);
      return;
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: loginIdentifier },
          { email: loginIdentifier }
        ]
      }
    });

    if (!user) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    const token = jwt.sign({ userId: user.user_id }, secretKey, { expiresIn: "1h" });

    sendResponse(res, { message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    sendError(res, "Internal server error", 500);
  }
}