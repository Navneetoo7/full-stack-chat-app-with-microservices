import { generateAuthToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import tryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";
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
