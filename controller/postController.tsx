import { Request, Response } from "express";
import { Tweet } from "../models/Tweet";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { Likes } from "../models/Likes";
import { Sequelize } from 'sequelize-typescript';
import { sendResponse, sendError } from "../utils/response";

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

    sendResponse(res, { posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    sendError(res, "Internal server error", 500);
  }
};

export const post = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Tweet.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          as: 'Replies'
        }
      ]
    });
    if (!post) {
      sendError(res, "Post not found", 404);
      return;
    }
    sendResponse(res, { post });
  } catch (error) {
    console.error("Error fetching post:", error);
    sendError(res, "Internal server error", 500);
  }
};

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

    sendResponse(res, { posts });
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    sendError(res, "Internal server error", 500);
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
      sendError(res, "No replies found", 404);
      return;
    }

    sendResponse(res, {
      replies,
      message: "Replies fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    sendError(res, "Internal server error", 500);
  }
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, content } = req.body;
    const file = req.file;

    if (!content && !file) {
      sendError(res, "Isi text atau upload gambar!", 400);
      return;
    }

    const tweet = await Tweet.create({
      tweet_id: uuidv4(),
      user_id,
      content,
      image_path: file ? file.path : null,
      reply_id: null,
    });

    sendResponse(res, { tweet }, 201);
  } catch (error) {
    console.error("Error creating post:", error);
    sendError(res, "Internal server error", 500);
  }
};

export const getTweetThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tweet_id } = req.params;

    const tweet = await Tweet.findByPk(tweet_id, {
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
    });

    const replies = await Tweet.findAll({
      where: { reply_id: tweet_id },
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
      order: [['createdAt', 'ASC']],
    });

    sendResponse(res, {
      tweet,
      replies,
    });
  } catch (error) {
    console.error("Error fetching tweet thread:", error);
    sendError(res, "Internal server error", 500);
  }
};

export const editPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const file = req.file;

    const post = await Tweet.findByPk(id);
    if (!post) {
      sendError(res, "Post not found", 404);
      return;
    }

    post.content = content ?? post.content;
    if (file) {
      post.image_path = file.path;
    }
    await post.save();

    sendResponse(res, { message: "Post updated", post });
  } catch (error) {
    console.error("Error editing post:", error);
    sendError(res, "Internal server error", 500);
  }
};

// Delete post and all its replies recursively
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Recursive function to delete replies
    const deleteWithReplies = async (tweetId: string) => {
      const replies = await Tweet.findAll({ where: { reply_id: tweetId } });
      for (const reply of replies) {
        await deleteWithReplies(reply.tweet_id);
      }
      await Tweet.destroy({ where: { tweet_id: tweetId } });
    };

    const post = await Tweet.findByPk(id);
    if (!post) {
      sendError(res, "Post not found", 404);
      return;
    }

    await deleteWithReplies(id);

    sendResponse(res, { message: "Post and its replies deleted" });
  } catch (error) {
    console.error("Error deleting post:", error);
    sendError(res, "Internal server error", 500);
  }
};
