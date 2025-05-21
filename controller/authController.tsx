import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";

const secretKey = process.env.JWT_SECRET || "your_secret_key";


export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('req.body:', req.body); 
        console.log('req.file:', req.file);
    
    
        const { username, password, name, email } = req.body;
        const file = req.file;
    
        if (!username || !password || !name || !email) {
          res.status(400).json({ error: "Semua field wajib diisi!" });
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
    
        res.status(201).json({ message: "User created successfully" });
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
      }
}


export const login = async (req: Request, res: Response): Promise<void> => {
    try {
    const { username, email, password } = req.body;

    const loginIdentifier = username || email; 
    if (!loginIdentifier || !password) {
      res.status(400).json({ error: "Missing username/email or password" });
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
        res.status(401).json({ error: "Invalid credentials" });
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.user_id }, secretKey, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}