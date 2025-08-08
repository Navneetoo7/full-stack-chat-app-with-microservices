import { publishToQueue } from "../config/rabbitmq.js";
import tryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";
export const loginUser = tryCatch(async (req, res) => {
    console.log("Login request received:", req.body);
    const { email } = req.body;
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    console.log("Rate limit status:", rateLimit);
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
//# sourceMappingURL=user.js.map