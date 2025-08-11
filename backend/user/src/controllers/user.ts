import { generateAuthToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import tryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";
import { type IsAuthRequest } from "../middleware/isAuth.js";
import { User } from "../model/User.js";

export const loginUser = tryCatch(async (req, res) => {
  const { email } = req.body;
  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);
  if (rateLimit) {
    res.status(429).json({
      message: "Too many requests, please wait before requesting new opt.",
    });
    return;
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otp, { EX: 300 });
  await redisClient.set(rateLimitKey, "true", { EX: 60 });
  const message = {
    to: email,
    subject: `Your OTP Code`,
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };
  await publishToQueue("send-otp", message);
  res.status(200).json({
    message: "OTP sent successfully.",
  });
});

export const verifyOtp = tryCatch(async (req, res) => {
  console.log("-req.body", req.body)
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required.",
    });
  }
  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({
      message: "OTP is invalid or has expired.",
    });
  }
  await redisClient.del(otpKey);

  let user = await User.findOne({ email });
  if (!user) {
    const name = email.split("@")[0];
    user = await User.create({ email, name });
    await user.save();
  }
  const token = generateAuthToken(user);
  res.status(200).json({
    message: "OTP verified successfully.",
    token,
    user,
  });
});

export const getUserProfile = tryCatch(async (req: IsAuthRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "User not authenticated.",
    });
  }
  res.status(200).json({
    message: "User profile retrieved successfully.",
    user,
  });
});

export const updateName = tryCatch(async (req: IsAuthRequest, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    res.status(404).json({
      message: "User not found.",
    });
    return;
  }
  user.name = req.body.name || user.name;
  await user.save();
  // res.status(200).json({
  //   message: "User name updated successfully.",
  //   user,
  // });
  const token = generateAuthToken(user);
  return res
    .status(200)
    .json({ message: "User profile updated successfully.", token, user });
});

export const getAllUsers = tryCatch(async (req, res) => {
  const users = await User.find({}, "-__v -createdAt -updatedAt");
  res.status(200).json({
    message: "All users retrieved successfully.",
    users,
  });
});

export const getUserById = tryCatch(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId, "-__v -createdAt -updatedAt");
  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }
  res.status(200).json({
    message: "User retrieved successfully.",
    user,
  });
});
