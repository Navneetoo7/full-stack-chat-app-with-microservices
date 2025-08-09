import express from "express";
import { getAllUsers, getUserById, getUserProfile, loginUser, updateName, verifyOtp, } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
const router = express.Router();
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/profile", isAuth, getUserProfile);
router.put("/update-name", isAuth, updateName);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id", isAuth, getUserById);
export default router;
//# sourceMappingURL=user.js.map