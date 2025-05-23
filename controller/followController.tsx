import { Request, Response } from "express";
import { Follower } from "../models/Follower";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";

// Get All User that Follow Specific User
export const follower = async (req: Request, res: Response): Promise<void> => {
  try {
    const {user_id} = req.params;

    // Find all followers for the user (user_id)
    const followers = await Follower.findAll({
      where: { following_id:user_id},
      include: [
        {
          model: User,
          as: "followerUser", // The user who follows
          attributes: ["user_id", "username", "name", "profilePicture"],
        },
      ],
    });

    const formattedFollowers = followers.map((record) => {
      const followerUser = record.get("followerUser") as User | null;
      return {
        follow_id: record.get("follow_id"),
        user_id: record.get("user_id"),
        following_id: record.get("following_id"),
        followedAt: record.get("followedAt"),
        follower: followerUser
          ? {
              user_id: followerUser.user_id,
              username: followerUser.username,
              name: followerUser.name,
              profilePicture: followerUser.profilePicture,
            }
          : null,
      };
    });

    res.status(200).json({ success: true, followers: formattedFollowers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch followers" });
  }
};

// Get All User that the Specific User Following
export const following = async (req: Request, res: Response): Promise<void> => {
  try {
    const { following_id } = req.params;

    // Find all users this user is following
    const following = await Follower.findAll({
      where: { user_id: following_id },
      include: [
        {
          model: User,
          as: "followedUser", // User being followed
          attributes: ["user_id", "username", "name", "profilePicture"],
        },
      ],
    });

    const formattedFollowing = following.map((record) => {
      const followedUser = record.get("followedUser") as User | null;
      return {
        follow_id: record.get("follow_id"),
        user_id: record.get("user_id"),
        following_id: record.get("following_id"),
        followedAt: record.get("followedAt"),
        following: followedUser
          ? {
              user_id: followedUser.user_id,
              username: followedUser.username,
              name: followedUser.name,
              profilePicture: followedUser.profilePicture,
            }
          : null,
      };
    });

    res.status(200).json({ success: true, following: formattedFollowing });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ success: false, message: "Failed to fetch following" });
  }
};

// Follow/unfollow endpoint
export const addFollower = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id; // The user who is following
    const { following_id } = req.params; // The user being followed

    if (!user_id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Prevent a user from following themselves
    if (user_id === following_id) {
      res.status(400).json({ error: "A user cannot follow themselves." });
      return;
    }

    const existingFollower = await Follower.findOne({ where: { following_id, user_id } });

    if (existingFollower) {
      // If already following, remove the follower relationship (unfollow)
      await existingFollower.destroy();
      res.status(200).json({ message: "Unfollowed successfully" });
      return;
    } else {
      await Follower.create({
        follow_id: uuidv4(),
        following_id, // The user being followed
        user_id,      // The user who follows
      });
      res.status(200).json({ message: "Followed successfully" });
      return;
    }
  } catch (error) {
    console.error("Error in /follow:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};