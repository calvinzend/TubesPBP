import { Request, Response } from "express";
import { Tweet } from "../models/Tweet";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { sendResponse, sendError } from "../utils/response";

// Get specific reply
export const reply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reply_id } = req.params;
    const reply = await Tweet.findByPk(reply_id, {
      include: {
        model: User,
        attributes: ['name', 'username', 'profilePicture'],
      },
    });
    if (!reply) {
      sendError(res, "Reply not found", 404);
      return;
    }
    sendResponse(res, { reply, message: "Reply fetched successfully" });
  } catch (error) {
    console.error("Error fetching reply:", error);
    sendError(res, "Internal server error", 500);
  }
};

// Get all replies by user
export const userReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    const replies = await Tweet.findAll({
      where: { user_id },
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
    sendResponse(res, { replies, message: "Replies fetched successfully" });
  } catch (error) {
    console.error("Error fetching replies:", error);
    sendError(res, "Internal server error", 500);
  }
};

// Get all replies to a tweet
export const postReply = async (req: Request, res: Response): Promise<void> => {
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
    sendResponse(res, { replies, message: "Replies fetched successfully" });
  } catch (error) {
    console.error("Error fetching replies:", error);
    sendError(res, "Internal server error", 500);
  }
};

// Create reply
export const createReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tweet_id } = req.params;
    const { user_id, content } = req.body;
    const file = req.file;

    if (!user_id || (!content && !file)) {
      sendError(res, "user_id and content or image are required", 400);
      return;
    }

    const userExists = await User.findByPk(user_id);
    if (!userExists) {
      sendError(res, "User not found", 404);
      return;
    }

    const tweetExists = await Tweet.findByPk(tweet_id);
    if (!tweetExists) {
      sendError(res, "Tweet not found", 404);
      return;
    }

    const reply = await Tweet.create({
      tweet_id: uuidv4(),
      user_id,
      content,
      image_path: file ? file.path : null,
      reply_id: tweet_id,
    });

    sendResponse(res, { reply, message: "Reply created successfully" }, 201);
  } catch (error) {
    console.error("Error creating reply:", error);
    sendError(res, "Internal server error", 500);
  }
};

// Edit reply
export const editReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reply_id } = req.params;
    const { user_id, content } = req.body;
    const file = req.file;

    if (!user_id || !content) {
      sendError(res, "user_id and content are required", 400);
      return;
    }

    const userExists = await User.findByPk(user_id);
    if (!userExists) {
      sendError(res, "User not found", 404);
      return;
    }

    const replyExists = await Tweet.findByPk(reply_id);
    if (!replyExists) {
      sendError(res, "Reply not found", 404);
      return;
    }

    replyExists.content = content;
    if (file) {
      replyExists.image_path = file.path;
    }
    await replyExists.save();

    sendResponse(res, { reply: replyExists, message: "Reply updated successfully" });
  } catch (error) {
    console.error("Error updating reply:", error);
    sendError(res, "Internal server error", 500);
  }
};

// Delete reply
export const deleteReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reply_id } = req.params;
    const replyExists = await Tweet.findByPk(reply_id);
    if (!replyExists) {
      sendError(res, "Reply not found", 404);
      return;
    }
    await replyExists.destroy();
    sendResponse(res, { message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    sendError(res, "Internal server error", 500);
  }
};
