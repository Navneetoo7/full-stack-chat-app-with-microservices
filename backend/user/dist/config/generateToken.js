import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const generateAuthToken = (user) => {
    return jwt.sign({ user }, JWT_SECRET, {
        expiresIn: "15d",
    });
};
export const verifyAuthToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
//# sourceMappingURL=generateToken.js.map