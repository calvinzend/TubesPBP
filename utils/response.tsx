import { Response } from "express";

export const sendResponse = (res: Response, data: any, status: number = 200) => {
  res.status(status).json({ success: true, ...data });
};

export const sendError = (res: Response, error: string, status: number = 400) => {
  res.status(status).json({ success: false, error });
};