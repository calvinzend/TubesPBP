import express from "express";
import cors from "cors";
import path from "path";
import { authenticate } from "./middware/authenticate";

import { Sequelize } from 'sequelize-typescript';

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import replyRoutes from "./routes/replyRoutes";
import likeRoutes from "./routes/likeRoutes";
import followRoutes from "./routes/followRoutes";
import { User } from "./models/User";
import { Tweet } from "./models/Tweet";
import { Likes } from "./models/Likes";
import { Follower } from "./models/Follower";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(authenticate);

app.use( authRoutes);
app.use( userRoutes);
app.use( postRoutes);
app.use( replyRoutes);
app.use( likeRoutes);
app.use( followRoutes);

const env = process.env.NODE_ENV || "development";
const config = require('./config/config.json')[env];

const sequelize = new Sequelize({
  ...config,
  models: [User, Tweet, Follower, Likes],
  dialect: config.dialect
});

sequelize.authenticate()
  .then(() => {
    console.log('Database connected.');
    app.listen(3000, () => {
      console.log(`Server running on port 3000`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
