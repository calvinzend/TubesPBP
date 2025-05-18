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
import { Reply } from './models/Reply';

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
  models: [User, Tweet, Follower, Likes, Reply], // Add your models here
});
User.hasMany(Tweet, { foreignKey: 'user_id' });
Tweet.belongsTo(User, { foreignKey: 'user_id' });

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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
    const posts = await Tweet.findAll({
      where: {
        reply_id: null,  // hanya ambil post yang bukan reply
      },
      include: {
        model: User,
        attributes: ['name', 'username', 'profilePicture'],
      },
      order: [['createdAt', 'DESC']], // Urut berdasarkan createdAt DESC
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Tweet.findByPk(req.params.id, {
    include: [
        {
            model: Tweet,
            as: 'replies'
        }
    ]
});
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/posts/user/:user_id", async (req, res) => {
  try {
    const posts = await Tweet.findAll({ where: { user_id: req.params.user_id } });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/likes/:tweet_id", async (req, res) => {
  try {
    const { tweet_id } = req.params;


    // Check if the user has liked the tweet
    const like = await Likes.findOne({
      where: {
        tweet_id: tweet_id,
      },
    });

    const countLike = await Likes.count({
      where: { tweet_id: tweet_id },
    });

    res.status(200).json({ likes: countLike, liked: !!like });
  } catch (error) {
    console.error("Error fetching likes:", error);
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

// get a specific reply
app.get("/replies/:reply_id", async (req, res) => {
  try {
    const { reply_id } = req.params;

    const reply = await Reply.findByPk(reply_id, {
      include: {
        model: User,
        attributes: ['name', 'username', 'profilePicture'],
      },
    });

    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    res.status(200).json({
      reply,
      message: "Reply fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching reply:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get all replies for a specific user
app.get("/users/:user_id/replies", async (req, res) => {
  try {
    const { user_id } = req.params;

    const replies = await Reply.findAll({
      where: { user_id: user_id },
      include: {
        model: User,
        attributes: ['name', 'username', 'profilePicture'],
      },
      order: [['createdAt', 'ASC']],
    });

    if (replies.length === 0) {
      return res.status(404).json({ error: "No replies found" });
    }

    res.status(200).json({
      replies,
      message: "Replies fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get all replies for a specific tweet
app.get("/posts/:tweet_id/replies", async (req, res) => {
  try {
    const { tweet_id } = req.params;

    const replies = await Tweet.findAll({
      where: { reply_id: tweet_id },
      include: {
        model: User,
        attributes: ['name', 'username', 'profilePicture'],
      },
      order: [['createdAt', 'ASC']],
    });

    if (replies.length === 0) {
      return res.status(404).json({ error: "No replies found" });
    }
    
    res.status(200).json({
      replies,
      message: "Replies fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//==================POSTS==================//
app.post("/posts", upload.single("image"), async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);

  try {
    const { user_id, content } = req.body;
    const file = req.file;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const tweet = await Tweet.create({
      tweet_id: uuidv4(),
      user_id,
      content,
      image_path: file ? file.path : null,
      reply_id: null,
    });

    res.status(201).json(tweet);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/like/:tweet_id", async (req, res) => {
  try {
    const { tweet_id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tweet = await Tweet.findByPk(tweet_id);
    if (!tweet) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existingLike = await Likes.findOne({ where: { user_id, tweet_id } });

    if (existingLike) {
      await existingLike.destroy();
      const countLike = await Likes.count({ where: { tweet_id } });
      return res.status(200).json({ liked: false, message: "Post unliked successfully", countLike });
    } else {
      await Likes.create({
        like_id: uuidv4(),
        user_id,
        tweet_id,
        likedAt: new Date(),
      });
      // Add the like to the Likes table
      const countLike = await Likes.count({ where: { tweet_id } });
      return res.status(200).json({ liked: true, message: "Post liked successfully", countLike });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/follow/:follower_id", async (req, res) => {
  const { follower_id } = req.params;  // follower_id is the user who wants to follow
  const { user_id } = req.body;         // user_id is the user who is being followed

  //  Check if the user is authenticated
  if (follower_id !== req.user?.user_id) {
    return res.status(403).json({ error: "You are not authorized to follow this user." });
  }

  // Prevent a user from following themselves
  if ( follower_id === user_id) {
    throw new Error("A user cannot follow themselves.");
  }

  const existingFollower = await Follower.findOne({ where: { user_id, follower_id } });

  // Check if the user is already following
  if (existingFollower) {
    // if they are, remove the follower relationship
    await existingFollower.destroy();
    res.status(200).json({ message: "Unfollowed successfully" });
  } else {
    await Follower.create({
      follow_id: uuidv4(), // Generate a unique ID for the follow
      user_id,
      follower_id,
    });
    res.status(200).json({ message: "Followed successfully" });
  }
});

// post a reply
app.post("/posts/:tweet_id/replies", upload.single('image_path'), async (req, res) => {
  try {
    const { tweet_id } = req.params;
    const { user_id, content } = req.body;
    const file = req.file;

    if (!user_id || !content) {
      return res.status(400).json({ error: "user_id and content are required" });
    }

    const userExists = await User.findByPk(user_id);
    if (!userExists) return res.status(404).json({ error: "User not found" });

    const tweetExists = await Tweet.findByPk(tweet_id);
    if (!tweetExists) return res.status(404).json({ error: "Tweet not found" });

    const reply = await Tweet.create({
      tweet_id: uuidv4(),
      user_id: user_id,
      content: content,
      image_path: file ? file.path : null,
      reply_id: tweet_id,
    });


    res.status(201).json({
      reply,
      message: "Reply created successfully"
    });
  } catch (error) {
    console.error("Error creating reply:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//==================PUT==================//
// put a reply
app.put("/replies/:reply_id", upload.single('image_path'), async (req, res) => {
  try {
    const { reply_id } = req.params;
    const { user_id, content } = req.body;
    const file = req.file;

    if (!user_id || !content) {
      return res.status(400).json({ error: "user_id and content are required" });
    }
  
    const userExists = await User.findByPk(user_id);
    if (!userExists) return res.status(404).json({ error: "User not found" });

    const replyExists = await Reply.findByPk(reply_id);
    if (!replyExists) return res.status(404).json({ error: "Reply not found" });

    replyExists.content = content;
    replyExists.image_path = file ? file.path : '';
    await replyExists.save();

    res.status(200).json({
      replyExists,
      message: "Reply updated successfully"
    });
  } catch (error) {
    console.error("Error updating reply:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//==================DELETE==================//
// delete a reply
app.delete("/replies/:reply_id", async (req, res) => {
  try {
    const { reply_id } = req.params;

    const replyExists = await Reply.findByPk(reply_id);
    if (!replyExists) return res.status(404).json({ error: "Reply not found" });

    await replyExists.destroy(); // soft delete the reply (paranoid: true)

    // permanently delete the reply
    // await replyExists.destroy({ force: true });

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
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