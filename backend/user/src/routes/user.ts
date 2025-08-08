import express from "express";
import { loginUser, verifyOtp } from "../controllers/user.js";
const router = express.Router();
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

export default router;
