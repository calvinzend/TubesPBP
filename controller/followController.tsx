import { Request, Response } from "express";
import { Follower } from "../models/Follower";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";

export const follower = async (req: Request, res: Response): Promise<void> => {
     try {
        const followers = await Follower.findAll({
          where: { userId: req.params.userId },
          include: [{
            model: User,
            as: 'follower', // this should match the alias defined in your User model relationship
            attributes: ['user_id', 'username'] // specify the fields you want to return from the User model
          }]
        });
    
        if (!followers || followers.length === 0) {
            res.status(404).json({ error: "No followers found" });
        }
    
        // Extract and return only the follower's data
        const followerData = followers.map(follower => follower.follower_id);
        res.json(followerData); // Return just the follower data
      } catch (error) {
        console.error("Error fetching followers:", error);
        res.status(500).json({ error: "Internal server error" });
      }
}

export const following = async (req: Request, res: Response): Promise<void> => {
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
      res.status(404).json({ error: "No following found" });
    }

    // Extract and return only the data of users the current user is following
    const followingData = following.map(entry => entry.user_id);
    res.json(followingData);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const addFollower = async (req: Request, res: Response): Promise<void> => {
    const { follower_id } = req.params;  // follower_id is the user who wants to follow
    const { user_id } = req.body;         // user_id is the user who is being followed

    //  Check if the user is authenticated
    if (follower_id !== req.user?.user_id) {
        res.status(403).json({ error: "You are not authorized to follow this user." });
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
}