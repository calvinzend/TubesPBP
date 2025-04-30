import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/User';
import { Request, Response, NextFunction } from "express";
import { Follower } from './models/Follower';
import { Likes } from './models/Likes';
import { Op } from 'sequelize';
import { create } from 'domain';
import { Tweet } from './models/Tweet';

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
  models: [User],
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

// ===================Autentication==================//

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
    const { username, email, password } = req.body;

    const loginIdentifier = username || email; // Support both fields
    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: "Missing username/email or password" });
    }

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: loginIdentifier },
          { email: loginIdentifier }
        ]
      }
    });

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

//==================GETTERS==================//

app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


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

app.get("/posts", async (req, res) => {
  try {
    const posts = await Tweet.findAll();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Tweet.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/posts/user/:userId", async (req, res) => {
  try {
    const posts = await Tweet.findAll({ where: { userId: req.params.userId } });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/followers/:userId", async (req, res) => {
  try {
    // Find all followers of the user
    const followers = await Follower.findAll({
      where: { userId: req.params.userId },
      include: [{
        model: User,
        as: 'follower', // this should match the alias defined in your User model relationship
        attributes: ['user_id', 'username'] // specify the fields you want to return from the User model
      }]
    });

    if (!followers || followers.length === 0) {
      return res.status(404).json({ error: "No followers found" });
    }

    // Extract and return only the follower's data
    const followerData = followers.map(follower => follower.followerId);
    res.json(followerData); // Return just the follower data
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/following/:userId", async (req, res) => {
  try {
    // Find all users the current user is following
    const following = await Follower.findAll({
      where: { followerId: req.params.userId },
      include: [{
        model: User,
        as: 'user', // this should match the alias defined in your User model relationship
        attributes: ['user_id', 'username'] // specify fields to return
      }]
    });

    if (!following || following.length === 0) {
      return res.status(404).json({ error: "No following found" });
    }

    // Extract and return only the data of users the current user is following
    const followingData = following.map(entry => entry.user);
    res.json(followingData);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//==================POSTS==================//
app.post("/posts", async (req, res) => {
  try {
    const { content, image_path, reply_id } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const tweet = await Tweet.create({
      tweet_id: uuidv4(),
      user_id: userId,
      content,
      image_path : image_path || null,
      reply_id : reply_id || null,
    });

    res.status(201).json(tweet);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/like/:tweetId", async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tweet = await Tweet.findByPk(tweetId);
    if (!tweet) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the user has already liked the tweet
    const like = await Likes.toggleLike(userId, tweetId);
    const countLike = await Likes.count({
      where: { tweetId: tweetId },
    });

    res.status(200).json({ message: "Post liked successfully", countLike });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/follow/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.user_id;

    if (!followerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // mending cek user follow dirinya sendiri disini atau di model?
    // Check if the user is already followed
    const follow = await Follower.toggleLike(followerId, userId);

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//==================Autenticate==================//
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