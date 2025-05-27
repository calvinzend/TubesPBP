import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { sendError } from "../utils/response";

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
        return sendError(res, "Authorization header missing", 401);
      }

      const token = authorization.split(" ")[1];
      if (!token) {
        return sendError(res, "Token missing", 401);
      }

      const decoded = jwt.verify(token, secretKey) as { userId: string };
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return sendError(res, "User not found", 401);
      }

      req.user = user;
      next();
    } catch (err) {
      return sendError(res, "Unauthorized - Invalid token", 401);
    }
  })();
};
