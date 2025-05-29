import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const now = new Date().toISOString();
  
  console.log('----------------------------------------');
  console.log(`[${now}] ${req.method} ${req.path}`);
  console.log('----------------------------------------');
  next();
};