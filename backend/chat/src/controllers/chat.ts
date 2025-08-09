import axios from "axios";
import tryCatch from "../config/tryCatch.js";
import type { IsAuthRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";

export const createNewChat = tryCatch(async (req: IsAuthRequest, res) => {
  const userId = req.user?._id;
  const { otherUserId } = req.body;
  if (!otherUserId) {
    return res.status(400).json({ message: "Other user ID is required" });
  }

  const existingChat = await Chat.findOne({
    users: { $all: [userId, otherUserId], $size: 2 },
  });
  console.error("Existing chat found:", existingChat);
  if (existingChat) {
    res.status(200).json({
      message: "Chat already exists",
      chat: existingChat?._id,
    });
    return;
  }
  const newChat = await Chat.create({
    users: [userId, otherUserId],
  });

  res.status(201).json({
    message: "Chat created successfully",
    newChat,
  });
});

export const getAllChats = tryCatch(async (req: IsAuthRequest, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

  if (!chats || chats.length === 0) {
    return res.status(404).json({ message: "No chats found" });
  }
  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id !== userId);
      const unSeenCount = await Messages.countDocuments({
        chatId: chat._id,
        isSeen: false,
        sender: { $ne: userId },
      });
      try {
        const { data } = await axios.get(
          `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
        );
        return {
          user: data,
          ...chat.toObject(),
          latestMessage: chat.latestMessage || null,
          unSeenCount,
        };
      } catch (error) {
        console.error("Error fetching unseen messages count:", error);
        return {
          user: { _id: otherUserId, name: "Unknown User" },
          ...chat.toObject(),
          latestMessage: chat.latestMessage || null,
          unSeenCount,
        };
      }
    })
  );
  res.status(200).json({
    message: "Chats fetched successfully",
    chats: chatWithUserData,
  });
});

export const sendMessage = tryCatch(async (req: IsAuthRequest, res) => {
  const { chatId, text } = req.body;
  const senderId = req.user?._id;
  const imageFile = req.file;

  if (!senderId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  if (!chatId) {
    return res.status(400).json({ message: "Chat ID are required" });
  }

  if (!text && !imageFile) {
    return res.status(400).json({ message: "Text or image is required" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // const isUserInChat = chat.users.includes(senderId); this working only is remain same data type some one is string and some is object id it will not work
  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  );
  if (!isUserInChat) {
    return res.status(403).json({ message: "User not part of this chat" });
  }
  const otherUserId = chat.users.find(
    (id) => id.toString() !== senderId.toString()
  );

  if (!otherUserId) {
    return res.status(401).json({ message: "No other user" });
  }
  // socket setup

  let messageData: any = {
    chatId,
    sender: senderId,
    seen: false,
    seenAt: undefined,
  };
  if (imageFile) {
    messageData.image = {
      url: imageFile.path,
      publicId: imageFile.filename,
    };
    messageData.messageType = "image";
    messageData.text = text || "";
  } else {
    messageData.text = text;
    messageData.messageType = "text";
  }
  const message = new Messages(messageData);
  const savedMessage = await message.save();
  const latestMessageText = imageFile ? "Image sent" : text;

  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMessage: {
        text: latestMessageText,
        sender: senderId,
      },
      updatedAt: new Date(),
    },
    { new: true }
  );
  // Emit the message to the other user via socket
  res.status(201).json({
    message: "Message sent successfully",
    senderId: senderId,
  });
});

export const getMessagesByChat = tryCatch(async (req: IsAuthRequest, res) => {
  const chatId = req.params.chatId;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === req.user?._id.toString()
  );

  if (!isUserInChat) {
    return res.status(403).json({ message: "User not part of this chat" });
  }

  const messagesToMarkSeen = await Messages.find({
    chatId,
    sender: { $ne: userId },
    seen: false,
  });

  await Messages.updateMany(
    {
      chatId,
      sender: { $ne: userId },
      seen: false,
    },
    { seen: true, seenAt: new Date() }
  );
  const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });

  const otherUserId = chat.users.find(
    (id) => id.toString() !== userId.toString()
  );
  try {
    const { data } = await axios.get(
      `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
    );
    if (!otherUserId) {
      return res.status(403).json({ message: "No other user" });
    }
    // socket work
    res.status(200).json({
      message: "Messages fetched successfully",
      user: data,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.json({
      message: "Error fetching user data",
      user: { _id: otherUserId, name: "Unknow user" },
    });
    return;
  }
  res.status(200).json({
    message: "Messages fetched successfully",
    messages,
  });
});
