import { Request, Response } from "express";
import { Likes } from "../models/Likes";
import { Tweet } from "../models/Tweet";
import { v4 as uuidv4 } from "uuid";
import { sendResponse, sendError } from "../utils/response";

export const allReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tweet_id } = req.params;

    const like = await Likes.findOne({
      where: { tweet_id },
    });

    const countLike = await Likes.count({ where: { tweet_id } });

    sendResponse(res, { likes: countLike, liked: !!like });
  } catch (error) {
    console.error("Error fetching likes:", error);
    sendError(res, "Internal server error", 500);
  }
};

export const addReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tweet_id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const tweet = await Tweet.findByPk(tweet_id);
    if (!tweet) {
      sendError(res, "Post not found", 404);
      return;
    }

    const existingLike = await Likes.findOne({ where: { user_id, tweet_id } });

    if (existingLike) {
      await existingLike.destroy();
      const likes = await Likes.count({ where: { tweet_id } });
      sendResponse(res, { liked: false, message: "Post unliked successfully", likes });
    } else {
      await Likes.create({
        like_id: uuidv4(),
        user_id,
        tweet_id,
        likedAt: new Date(),
      });
      const likes = await Likes.count({ where: { tweet_id } });
      sendResponse(res, { liked: true, message: "Post liked successfully", likes });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    sendError(res, "Internal server error", 500);
  }
};