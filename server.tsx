import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/User';
import { Tweet } from './models/Tweet';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from "express";
import multer from 'multer';
import path from 'path';

dotenv.config(); 

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
  models: [User,   Tweet],
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique file name
  },
});
const upload = multer({ storage: storage });
const app = express();

app.use(cors());
app.use(express.json());

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
      try {
          if (req.path === "/login" || req.path === "/register" || req.path === "/refresh") {
              return next();
          }

          const authorization = req.headers.authorization;
          if (!authorization) {
              return res.status(401).json({ error: 'Authorization header missing' });
          }

          const token = authorization.split(" ")[1];
          if (!token) {
              return res.status(401).json({ error: 'Token missing' });
          }

          const decoded = jwt.verify(token, secretKey) as { userId: string };
          const user = await User.findByPk(decoded.userId);

          console.log("Decoded user:", decoded);
          console.log("User found:", user);
          
          if (!user) {
              return res.status(401).json({ error: 'User not found' });
          }

          req.user = user;
          next();
      } catch (err) {
          return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }
  })();
};


app.use(authenticate);

app.post("/register", upload.single('profilePicture'), async (req: Request, res: Response) => {
  try {
    console.log('req.body:', req.body); // <-- Tambahkan ini
    console.log('req.file:', req.file);


    const { username, password, name, email } = req.body;
    const file = req.file; 

    if (!username || !password || !name || !email) {
      return res.status(400).json({ error: "Semua field wajib diisi!" });
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

    const token = jwt.sign({ userId: user.user_id }, secretKey, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password, name, email,bio } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio) user.bio = bio;

    await user.save();
    res.json({ message: "User updated successfully" });
  }catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})


//Uji coba
app.get("/posts", async (req, res) => {
  
  try {
    const posts = await Tweet.findAll();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }});

app.get("/posts/user/:id", async (req, res) => {
  
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Tweet.findAll({ where: { user_id: user.user_id } });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }});


app.post("/posts", async (req, res) => {
  
  try {
    const { title, content, authorName } = req.body;
    const userId = req.user?.user_id; 

    if (!title || !content || !authorName) {
      return res.status(400).json({ error: "Missing title, content, or authorName" });
    }

    const post = await Tweet.create({
      post_id: uuidv4(),
      title,
      content,
      authorName,
      userId,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})


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
