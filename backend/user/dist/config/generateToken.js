import jwt, {} from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const generateAuthToken = (user) => {
    return jwt.sign({ user }, JWT_SECRET, {
        expiresIn: "15d",
    });
};
//# sourceMappingURL=generateToken.js.map