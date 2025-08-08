import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateAuthToken = (user: any) => {
  return jwt.sign({ user }, JWT_SECRET, {
    expiresIn: "15d",
  });
};

export const verifyAuthToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
