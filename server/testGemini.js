require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const run = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hello, who are you?");
    console.log("Gemini says:", result.response.text());
  } catch (err) {
    console.error("❌ Gemini Error:", err.message);
  }
};

run();
