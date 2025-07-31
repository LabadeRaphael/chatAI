// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Serve client statically
const clientPath = path.join(__dirname, '../client');
console.log("Serving static files from:", clientPath); // for debugging
const fs = require('fs');
console.log("Client directory exists?", fs.existsSync(clientPath)); // for debugging

app.use(express.static(clientPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT || 4000, () =>
    console.log(`Server running on port ${process.env.PORT || 4000}`)
  );
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
