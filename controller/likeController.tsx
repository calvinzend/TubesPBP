import { Request, Response } from "express";
import { Likes } from "../models/Likes";
import { Tweet } from "../models/Tweet";
import { v4 as uuidv4 } from "uuid";

export const allReply = async (req: Request, res: Response): Promise<void> => {
     try {
        const { tweet_id } = req.params;

        const like = await Likes.findOne({
        where: {
            tweet_id: tweet_id,
        },
        });

        const countLike = await Likes.count({ where: { tweet_id } });

        res.status(200).json({ likes: countLike, liked: !!like });
    } catch (error) {
        console.error("Error fetching likes:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const addReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tweet_id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const tweet = await Tweet.findByPk(tweet_id);
    if (!tweet) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const existingLike = await Likes.findOne({ where: { user_id, tweet_id } });

    if (existingLike) {
      await existingLike.destroy();
      const likes = await Likes.count({ where: { tweet_id } });
      res.status(200).json({ liked: false, message: "Post unliked successfully", likes });
    } else {
      await Likes.create({
        like_id: uuidv4(),
        user_id,
        tweet_id,
        likedAt: new Date(),
      });
      const likes = await Likes.count({ where: { tweet_id } });
      res.status(200).json({ liked: true, message: "Post liked successfully", likes });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};