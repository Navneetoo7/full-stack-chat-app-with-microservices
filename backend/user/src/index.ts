import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRouters  from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config();
connectDb();
connectRabbitMQ()

if (!process.env.REDIS_URL) {
  throw new Error("Missing REDIS_URL in .env file");
}
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient
.connect()
.then(() => console.log("connected to redis"))
.catch(console.error);

const app = express();
app.use("api/v1", userRouters)
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
