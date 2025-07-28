require('dotenv').config();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const OpenAI = require('openai');
const { ChatSession } = require('@google/generative-ai');

const openai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

exports.sendMessage = async (req, res) => {
  const { content, title, newStatus, sessionID} = req.body;
  const userId = req.user.id;
  console.log(newStatus);
  console.log("session id",sessionID);
  

  

  try {
    let chat;
    if (newStatus) {
      // const title=  title.length > 50 ? title.slice(0, 50) + '...' : title
      chat = await Chat.create({ user: userId, title, messages: [] });
    } else {
      if(sessionID){
        chat = await Chat.findOne({ user: userId, _id:sessionID})
        console.log("chat result", chat);
        
      }else{
        console.log("no session id");
        
        chat = await Chat.findOne({ user: userId }).sort({ createdAt: -1 });
        if (!chat) {
          // const title=  title.length > 50 ? title.slice(0, 50) + '...' : title
          chat = await Chat.create({ user: userId, title, messages: [] });
        }
      }
    }

    await Message.create({ user: userId, sender: 'user', content, chatSessionId: chat._id });

    const aiResponse = await openai.chat.completions.create({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      messages: [
        { role: 'system', content: 'You are a helpful IT assistant.' },
        { role: 'user', content },
      ],
    });

    const botReply = aiResponse.choices[0].message.content;

    await Message.create({ user: userId, sender: 'bot', content: botReply, chatSessionId: chat._id });
    // 4. Push bot reply
    chat.messages.push({ sender: 'user', content });
    chat.messages.push({ sender: 'bot', content: botReply });

    // 5. Save chat
    await chat.save();
    res.status(200).json({ reply: botReply });
  } catch (err) {
    console.error('Together AI Error:', err);
    res.status(500).json({
      reply: 'AI service is temporarily unavailable. Try again later.',
      error: err.message,
    });
  }
};
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({ user: userId }).sort({ createdAt: 1 });
    console.log(messages);

    res.status(200).json({ history: messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};
exports.getChatTitles = async (req, res) => {
  const userId = req.user.id;
  try {
    const chats = await Chat.find({ user: userId }).select('title createdAt');
    res.status(200).json({ titles: chats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat titles' });
  }
};
exports.getChatSession = async (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;
  console.log(id)
  try {
    const chats = await Chat.findOne({ user: userId, _id: id });
    console.log(chats);

    res.status(200).json({ chatSession: chats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat titles' });
  }
};
exports.delChatSession = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  console.log("del id", id);

  try {
    const response = await Chat.deleteOne({ _id: id, user: userId });
    const delresponse = await Message.deleteMany({
      chatSessionId
        : id, user: userId
    });
    console.log(delresponse);

    res.status(200).json({ message: "successful", response });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};
exports.delMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.deleteMany({ user: userId });
    const chatSession = await Chat.deleteMany({ user: userId });
    console.log(messages);
    console.log(chatSession);

    res.status(200).json({ message: [], chatSession: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chat history' });
  }
};


