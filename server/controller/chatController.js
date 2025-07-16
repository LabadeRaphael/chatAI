// // server/controllers/chatController.js
// const Message = require('../models/Message');

// // const { Configuration, OpenAIApi } = require('openai');
// const OpenAI = require('openai');
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });
// // const configuration = new Configuration({
// //   apiKey: process.env.OPENAI_API_KEY
// // });
// // const openai = new OpenAIApi(configuration);

// exports.sendMessage = async (req, res) => {
//   const { content } = req.body;
//   const userId = req.user.id;

//   try {
//     // Save user message
//     const userMessage = await Message.create({
//       user: userId,
//       sender: 'user',
//       content
//     });

//     // Get AI response from OpenAI
//     const aiResponse = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [
//         { role: 'system', content: 'You are a helpful IT help desk assistant.' },
//         { role: 'user', content }
//       ]
//     });

//     const botReply = aiResponse.data.choices[0].message.content;

//     // Save bot response
//     const botMessage = await Message.create({
//       user: userId,
//       sender: 'bot',
//       content: botReply
//     });

//     res.status(200).json({ reply: botReply });
//   } catch (err) {
//     console.error('Chat error:', err);
//     console.log(err.status);
//     if (err.status === 429) {
//       return res.status(429).json({
//         reply: "Chatbot usage limit reached. Please try again later or check API quota."
//       });
//     }
//     return res.status(500).json({
//       reply: "Chatbot is currently unavailable. Please try again shortly."

//     })
//   }
// };



// const Message = require('../models/Message');
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const genAI = new GoogleGenerativeAI({
//   apiKey: process.env.GEMINI_API_KEY
// });
// console.log("api key",process.env.GEMINI_API_KEY);

// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Or gemini-1.5-lite

// exports.sendMessage = async (req, res) => {
//   const { content } = req.body;
//   const userId = req.user.id;

//   try {
//     // Save user message to DB
//     await Message.create({
//       user: userId,
//       sender: 'user',
//       content
//     });

//     // Generate bot reply
//     const result = await model.generateContent(content);
//     const botReply = result.response.text();

//     // Save bot message to DB
//     await Message.create({
//       user: userId,
//       sender: 'bot',
//       content: botReply
//     });

//     res.status(200).json({ reply: botReply });

//   } catch (error) {
//     console.error('Gemini Error:', error);
//     res.status(500).json({
//       reply: '😔 Gemini is currently unavailable. Please try again later.',
//       error: error.message
//     });
//   }
// };

require('dotenv').config();
const Message = require('../models/Message');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

exports.sendMessage = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  try {
    await Message.create({ user: userId, sender: 'user', content });

    const aiResponse = await openai.chat.completions.create({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      messages: [
        { role: 'system', content: 'You are a helpful IT assistant.' },
        { role: 'user', content },
      ],
    });

    const botReply = aiResponse.choices[0].message.content;

    await Message.create({ user: userId, sender: 'bot', content: botReply });

    res.status(200).json({ reply: botReply });
  } catch (err) {
    console.error('Together AI Error:', err);
    res.status(500).json({
      reply: 'AI service is temporarily unavailable. Try again later.',
      error: err.message,
    });
  }
};
