import { Request, Response } from "express";
import { Tweet } from "../models/Tweet";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";

// to get spesific reply
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
         res.status(404).json({ error: "Reply not found" });
       }
   
       res.status(200).json({
         reply,
         message: "Reply fetched successfully"
       });
     } catch (error) {
       console.error("Error fetching reply:", error);
       res.status(500).json({ error: "Internal server error" });
     }
}

export const userReply = async (req: Request, res: Response): Promise<void> => {
  try {
      const { user_id } = req.params;
  
      const replies = await Tweet.findAll({
        where: { user_id: user_id },
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

// to get tweet reply
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

    // Always return 200 with an array
    res.status(200).json({
      replies,
      message: "Replies fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createReply = async (req: Request, res: Response): Promise<void> => {
    try {
    const { tweet_id } = req.params;
    const { user_id, content } = req.body;
    const file = req.file;

    if (!user_id || !content) {
       res.status(400).json({ error: "user_id and content are required" });
    }

    const userExists = await User.findByPk(user_id);
    if (!userExists)  res.status(404).json({ error: "User not found" });

    const tweetExists = await Tweet.findByPk(tweet_id);
    if (!tweetExists)  res.status(404).json({ error: "Tweet not found" });

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
}


export const editReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reply_id } = req.params;
    const { user_id, content } = req.body;
    const file = req.file;

    if (!user_id || !content) {
      res.status(400).json({ error: "user_id and content are required" });
      return;
    }

    const userExists = await User.findByPk(user_id);
    if (!userExists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const replyExists = await Tweet.findByPk(reply_id);
    if (!replyExists) {
      res.status(404).json({ error: "Reply not found" });
      return;
    }

    replyExists.content = content;
    replyExists.image_path = file ? file.path : ''; 
    await replyExists.save();

    res.status(200).json({
      reply: replyExists,
      message: "Reply updated successfully"
    });
  } catch (error) {
    console.error("Error updating reply:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteReply = async (req: Request, res: Response): Promise<void> => {
   try {
      const { reply_id } = req.params;
  
      const replyExists = await Tweet.findByPk(reply_id);
      if (!replyExists) {
        res.status(404).json({ error: "Reply not found" });
        return;
    }
  
      await replyExists.destroy(); // soft delete the reply (paranoid: true)
  
      // permanently delete the reply
      // await replyExists.destroy({ force: true });
  
      res.status(200).json({ message: "Reply deleted successfully" });
    } catch (error) {
      console.error("Error deleting reply:", error);
      res.status(500).json({ error: "Internal server error" });
    }
}
