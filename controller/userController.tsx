import { Request, Response } from "express";
import { Op } from "sequelize";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import { Follower } from "../models/Follower";
import { sendResponse, sendError } from "../utils/response";

export const allUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll();
    sendResponse(res, { users });
  } catch (error) {
    console.error("Error fetching users:", error);
    sendError(res, "Internal server error", 500);
  }
};

export const userDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    const followersCount = await Follower.count({
      where: { following_id: req.params.id }
    });

    const followingCount = await Follower.count({
      where: { user_id: req.params.id }
    });

    sendResponse(res, {
      user,
      followersCount,
      followingCount
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    sendError(res, "Internal server error", 500);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    const { oldPassword, password, ...otherFields } = req.body;

    if (password) {
      if (!oldPassword) {
        sendError(res, "Password lama harus diisi", 400);
        return;
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        sendError(res, "Password lama salah", 400);
        return;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await user.update({ ...otherFields, password: hashedPassword });
    } else {
      await user.update(otherFields);
    }

    sendResponse(res, {
      message: "User updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    sendError(res, error.message || "Internal server error", 500);
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    await user.destroy();

    sendResponse(res, { message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    sendError(res, "Internal server error", 500);
  }
};

export const searchUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q) {
      sendError(res, "Query kosong", 400);
      return;
    }
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${q}%` } },
          { name: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ["user_id", "username", "name", "profilePicture", "bio"],
    });
    sendResponse(res, { users });
  } catch (error) {
    console.error("Error searching user:", error);
    sendError(res, "Internal server error", 500);
  }
};