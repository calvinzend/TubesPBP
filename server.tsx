import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from "express";

dotenv.config(); // Menggunakan .env untuk konfigurasi
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const config = require('./config/config.json');
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

const sequelize = new Sequelize({
  ...config.development,
  models: [User],
});

const app = express();
app.use(cors());
app.use(express.json());

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (["/login", "/register"].includes(req.path)) {
    return next(); // Tidak memerlukan otentikasi untuk path tertentu
  }

  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as { userId: string };
    User.findByPk(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        console.error("Authentication error:", err);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      });
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

app.use(authenticate);

/**
 * Register user baru
 */
app.post("/register", async (req, res) => {
  try {
    const { username, password, name, email, profilePicture } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      user_id: uuidv4(),
      username,
      password: hashedPassword,
      name,
      email,
      profilePicture: profilePicture || null,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Login user
 */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Mendapatkan daftar semua user
 */
app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Mendapatkan user berdasarkan ID
 */
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Koneksi ke database
sequelize.authenticate()
  .then(() => {
    console.log('Database connected.');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
