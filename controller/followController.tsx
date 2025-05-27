import { Request, Response } from "express";
import { Follower } from "../models/Follower";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { sendResponse, sendError } from "../utils/response";

// Get All User that Follow Specific User
export const follower = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    const followers = await Follower.findAll({
      where: { following_id: user_id },
      include: [
        {
          model: User,
          as: "followerUser",
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

    sendResponse(res, { followers: formattedFollowers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    sendError(res, "Failed to fetch followers", 500);
  }
};

// Get All User that the Specific User Following
export const following = async (req: Request, res: Response): Promise<void> => {
  try {
    const { following_id } = req.params;
    const following = await Follower.findAll({
      where: { user_id: following_id },
      include: [
        {
          model: User,
          as: "followedUser",
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

    sendResponse(res, { following: formattedFollowing });
  } catch (error) {
    console.error("Error fetching following:", error);
    sendError(res, "Failed to fetch following", 500);
  }
};

// Follow/unfollow endpoint
export const addFollower = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;
    const { following_id } = req.params;

    if (!user_id) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    if (user_id === following_id) {
      sendError(res, "A user cannot follow themselves.", 400);
      return;
    }

    const existingFollower = await Follower.findOne({ where: { following_id, user_id } });

    let action: "followed" | "unfollowed";
    if (existingFollower) {
      await existingFollower.destroy();
      action = "unfollowed";
    } else {
      await Follower.create({
        follow_id: uuidv4(),
        following_id,
        user_id,
      });
      action = "followed";
    }

    const followersCount = await Follower.count({ where: { following_id } });
    const isFollowing = action === "followed";

    sendResponse(res, {
      message: action === "followed" ? "Followed successfully" : "Unfollowed successfully",
      followersCount,
      isFollowing,
    });
  } catch (error) {
    console.error("Error in /follow:", error);
    sendError(res, "Internal server error", 500);
  }
};