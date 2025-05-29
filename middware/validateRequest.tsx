// middleware/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendError } from "../utils/response";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    sendError(res, `Validation failed: ${errorMessages.join(", ")}`, 400);
  }
  next();
};
