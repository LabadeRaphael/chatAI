// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
// const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
// app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Serve client statically
const clientPath = path.join(__dirname, '../client');
console.log("Serving static files from:", clientPath); // for debugging
const fs = require('fs');
console.log("Client directory exists?", fs.existsSync(clientPath)); // should say true

app.use(express.static(clientPath));

// ✅ This will serve the register.html as the default root
// app.get('/', (req, res) => {
//   console.log("GET / hit"); // You should see this
//   res.sendFile(path.join(clientPath, 'register.html'));
// });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT || 4000, () =>
    console.log(`Server running on port ${process.env.PORT || 4000}`)
  );
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
