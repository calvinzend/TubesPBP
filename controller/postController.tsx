import { Request, Response } from "express";
import { Tweet } from "../models/Tweet";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { Likes } from "../models/Likes";
import { Sequelize } from 'sequelize-typescript'

export const allPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Tweet.findAll({
      where: { reply_id: null },
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'username', 'profilePicture'],
        },
        {
          model: Likes,
          attributes: [],
          required: false,
        },
        {
          model: Tweet,
          as: 'Replies',
          attributes: [],
          required: false,
        },
      ],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('likes.like_id'))), 'likeCount'],
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('Replies.tweet_id'))), 'replyCount'],
        ],
      },
      group: ['Tweet.tweet_id', 'user.user_id'],
      order: [['createdAt', 'DESC']],
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const post = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Tweet.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          as: 'Replies' // Use the exact alias as in your model
        }
      ]
    });
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const postUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Tweet.findAll({
      where: {
        user_id: req.params.user_id,
        reply_id: null,
      },
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'username', 'profilePicture'],
        },
        {
          model: Likes,
          attributes: [],
          required: false,
        },
        {
          model: Tweet,
          as: 'Replies',
          attributes: [],
          required: false,
        },
      ],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('likes.like_id'))), 'likeCount'],
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('Replies.tweet_id'))), 'replyCount'],
        ],
      },
      group: ['Tweet.tweet_id', 'user.user_id'],
      order: [['createdAt', 'DESC']],
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const postReplies = async (req: Request, res: Response): Promise<void> => {
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
      res.status(404).json({ error: "No replies found" });
    }

    res.status(200).json({
      replies,
      message: "Replies fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const createPost = async (req: Request, res: Response): Promise<void> => {
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);

  try {
    const { user_id, content } = req.body;
    const file = req.file;

    if (!content) {
      res.status(400).json({ error: "Content is required" });
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
}

// Get a tweet and all its direct replies (thread)
export const getTweetThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tweet_id } = req.params;

    const tweet = await Tweet.findByPk(tweet_id, {
      include: {
        model: User,
        attributes: ['user_id', 'name', 'username', 'profilePicture'],
      },
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('likes.like_id'))), 'likeCount'],
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('Replies.tweet_id'))), 'replyCount'],
        ],
      },
      group: ['Tweet.tweet_id', 'user.user_id'],
    });

    const replies = await Tweet.findAll({
      where: { reply_id: tweet_id },
      include: {
        model: User,
        attributes: ['user_id', 'name', 'username', 'profilePicture'],
      },
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('likes.like_id'))), 'likeCount'],
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('Replies.tweet_id'))), 'replyCount'],
        ],
      },
      group: ['Tweet.tweet_id', 'user.user_id'],
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({
      tweet,
      replies,
    });
  } catch (error) {
    console.error("Error fetching tweet thread:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};