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
    return res.status(201).json({ message: 'User registered', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
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
    return res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
   return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Forget-Password
exports.forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found kindly register.' });

    const isSame = await user.matchPassword(newPassword);
    if (isSame) return res.status(400).json({ message: 'New password must be different from the previous password.' });
    user.password = newPassword;
    await user.save();
    return res.json({ message: 'Password Reset successful'});
  } catch (err) {
   return res.status(500).json({ message: 'Server failed', error: err.message });
  }
};

// Logout
exports.logoutUser = (req, res) => {
  res.clearCookie('token');
 return res.json({ message: 'Logged out' });
};
exports.userDetails =(req,res)=>{
  if(!req.user){
    return res.status(401).json({message:'Not authorized, invalid token'});
  }else{
    return res.status(200).json(req.user);
  }
}
exports.searchMessage = async (req,res)=>{
   const query = String(req.query.q);
   const userId = String(req.user.id)
   console.log(query);
   console.log(userId);
   if(!userId){
   return res.status(401).json({ message: 'Not authorized, invalid token' });
   }
    else if (!query) {
      return res.status(400).json({ message: 'No search query provided' });
    }
    
    try {
      
      // const messages = await Message.find({
      //   user:userId, // restrict to logged-in user's messages
      //   content: { $regex: query, $options: 'i' } , // case-insensitive search
     
      // });
      // Step 1: Get all user messages that match the search query
const messages = await Message.find({
  user: userId,
  content: { $regex: query, $options: 'i' }
});

// Step 2: Get all messages in the same sessions
const chatSessionIds = messages.map(msg => msg.chatSessionId);

// Use Set to remove duplicates, then query all messages in those sessions
const allMessagesInSessions = await Message.find({
  chatSessionId: { $in: [...new Set(chatSessionIds)] }
});
  console.log( "all message",allMessagesInSessions);
  

  
      // console.log(messages);
      // console.log("query msg",queryMsg);
      if (messages?.length === 0 || messages == []) {
        return res.status(400).json({message: 'No matched data found',});
      }
      return res.status(200).json({message: 'Matched data found', searchData: allMessagesInSessions,});
    } catch (err) {
       console.error('Search Error:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
}
