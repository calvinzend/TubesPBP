import { Request, Response } from "express";

import { User } from "../models/User";
import bcrypt from "bcrypt";



export const allUser = async (req: Request, res: Response) : Promise<void> => {
    try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const userDetail = async (req: Request, res: Response) : Promise<void> => { 
    try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { oldPassword, password, ...otherFields } = req.body;

    if (password !== undefined) {
      if (!oldPassword) {
        res.status(400).json({ error: "Password lama harus diisi" });
        return;
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ error: "Password lama salah" });
        return;
      }

      // if (password.length < 6) {
      //   res.status(400).json({ error: "Password baru minimal 6 karakter" });
      //   return;
      // }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await user.update({ ...otherFields, password: hashedPassword });
    } else {
      await user.update(otherFields);
    }

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await user.destroy();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

