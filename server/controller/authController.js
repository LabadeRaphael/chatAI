// server/controllers/authController.js
const User = require('../models/User');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

// Create JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Register
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development"? false : true, // set to true in production with https
      maxAge: 86400000
    });
    res.status(201).json({ message: 'User registered', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development" ? false : true,
      maxAge: 86400000
    });
    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Logout
exports.logoutUser = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};
exports.userDetails =(req,res)=>{
  res.json(req.user);
}
exports.searchMessage = async (req,res)=>{
   const query = req.query.q; 
    if (!query) {
      return res.status(400).json({ message: 'No search query provided' });
    }
    try {
      
      const messages = await Message.find({
        $or: [
          { name: { $regex: query, $options: 'i' } }, // case-insensitive search
          { email: { $regex: query, $options: 'i' } },
        ],
      });
  
      console.log(messages);
      res.json({message: 'Matched data found',});
      if (!messages) {
         res.json({message: 'No matched data found',});
      }
    } catch (error) {
       console.error('Search Error:', err.message);
    res.status(500).json({ message: 'Server error' });
    }
}
