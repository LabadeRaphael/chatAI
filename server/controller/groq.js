// require('dotenv').config();
// const Message = require('../models/Message');
// const Chat = require('../models/Chat');
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// console.log(process.env.GEMINI_API_KEY);

// exports.sendMessage = async (req, res) => {
//   const { content, title, newStatus, sessionID } = req.body;
//   const userId = req.user.id;

//   try {
//     let chat;
//     if (newStatus) {
//       chat = await Chat.create({ user: userId, title, messages: [] });
//     } else {
//       if (sessionID) {
//         chat = await Chat.findOne({ user: userId, _id: sessionID });
//       } else {
//         chat = await Chat.findOne({ user: userId }).sort({ createdAt: -1 });
//         if (!chat) {
//           chat = await Chat.create({ user: userId, title, messages: [] });
//         }
//       }
//     }

//     // Save user message
//     await Message.create({ user: userId, sender: 'user', content, chatSessionId: chat._id });

//     // Use Gemini API
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
//     const result = await model.generateContent(content);
//     const botReply = result.response.text();

//     // Save bot reply
//     await Message.create({ user: userId, sender: 'bot', content: botReply, chatSessionId: chat._id });
//     chat.messages.push({ sender: 'user', content });
//     chat.messages.push({ sender: 'bot', content: botReply });
//     await chat.save();

//     res.status(200).json({ reply: botReply });
//   } catch (err) {
//     console.error('Gemini AI Error:', err.message);
//     res.status(500).json({
//       reply: 'AI service is temporarily unavailable. Try again later.',
//       error: err.message,
//     });
//   }
// };




require('dotenv').config();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.sendMessage = async (req, res) => {
  console.log("sendMessage endpoint hit");

  const { content, title, newStatus, sessionID } = req.body;
  const userId = req.user.id;

  try {
    let chat;
    if (newStatus) {
      chat = await Chat.create({ user: userId, title, messages: [] });
    } else {
      if (sessionID) {
        chat = await Chat.findOne({ user: userId, _id: sessionID });
      } else {
        chat = await Chat.findOne({ user: userId }).sort({ createdAt: -1 });
        if (!chat) {
          chat = await Chat.create({ user: userId, title, messages: [] });
        }
      }
    }

    await Message.create({
      user: userId,
      sender: 'user',
      content,
      chatSessionId: chat._id
    });

    const aiResponse = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a helpful IT assistant.' },
        { role: 'user', content }
      ]
    });

    const botReply = aiResponse.choices[0]?.message?.content || "I'm not sure how to respond.";

    await Message.create({
      user: userId,
      sender: 'bot',
      content: botReply,
      chatSessionId: chat._id
    });

    chat.messages.push({ sender: 'user', content });
    chat.messages.push({ sender: 'bot', content: botReply });

    await chat.save();

    res.status(200).json({ reply: botReply });
  } catch (err) {
    console.error('Groq AI Error:', err);
    res.status(500).json({
      reply: 'AI service is temporarily unavailable. Try again later.',
      error: err.message
    });
  }
};
