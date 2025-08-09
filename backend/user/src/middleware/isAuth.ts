import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../model/User.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

export interface IsAuthRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: IsAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Authorization header missing or invalid" });
      return;
    }
    const token = authHeader.split(" ")[1] as string;
    const decodedValue = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
    req.user = decodedValue.user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};
