import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const secretKey = process.env.JWT_SECRET || "your_secret_key";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      if (req.path === "/login" || req.path === "/register" || req.path === "/refresh") {
        return next();
      }

      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(401).json({ error: 'Authorization header missing' });
      }

      const token = authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: 'Token missing' });
      }

      const decoded = jwt.verify(token, secretKey) as { userId: string };
      const user = await User.findByPk(decoded.userId);

      console.log("Decoded user:", decoded);
      console.log("User found:", user);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  })();
};
