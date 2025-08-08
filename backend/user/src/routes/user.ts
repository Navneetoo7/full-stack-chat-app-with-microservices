import express from "express";
import { loginUser } from "../controllers/user.js";
const router = express.Router();
router.post("/login", loginUser);

router.get("/test", (req, res) => {
  console.log("✅ Test route hit");
  res.send("Working");
});

export default router;
