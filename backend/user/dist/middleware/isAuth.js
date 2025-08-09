import jwt, {} from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res
                .status(401)
                .json({ message: "Authorization header missing or invalid" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decodedValue = jwt.verify(token, JWT_SECRET);
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Authentication failed" });
    }
};
//# sourceMappingURL=isAuth.js.map