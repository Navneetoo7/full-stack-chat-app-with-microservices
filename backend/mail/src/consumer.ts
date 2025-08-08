import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RabbitMQ_Host,
      port: 5677,
      username: process.env.RabbitMQ_Username,
      password: process.env.RabbitMQ_Password,
    });
    const channel = await connection.createChannel();
    const queueName = "send-otp";
    await channel.assertQueue(queueName, { durable: true });
    console.log("✅ Mail service consumer started, listening for otp emails");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, text } = JSON.parse(msg.content.toString());
          console.log(
            "Received OTP request for ${to}",
            JSON.parse(msg.content.toString())
          );

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.PASSWORD,
            },
          });
          await transporter.sendMail({
            to,
            subject,
            text,
          });
          console.log(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (err) {
          console.log("Failed to send otp", err);
        }
      }
    });
  } catch (err) {
    console.log("Failed to start to rabbitMQ consumer", err);
  }
};
