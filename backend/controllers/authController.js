const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const TokenBlacklist = require('../models/TokenBlacklist');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Task = require('../models/Task');



const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'planr.psg@gmail.com',
    pass: 'qatgeiyptgmsgpck',
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);


router.get('/user', authMiddleware, async (req, res) => {
  const user = req.user;
  try {
      res.status(200).json({ 
          email: user.email, 
          name: user.name, 
          notification: user.notification 
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching user data', error });
  }
});

router.delete('/user', authMiddleware, async (req, res) => {
  const user = req.user;
  try {
    if (!user.jwtToken) {
      return res.status(400).json({ message: 'No JWT token found for this user.' });
    }
        const blacklistedToken = new TokenBlacklist({ token: user.jwtToken });
        await blacklistedToken.save();
        const d_user = await User.findByIdAndDelete(user.id);

        if (!d_user) {
          return res.status(404).json({ message: 'User not found.' });
        }

        await Task.deleteMany({ user: user.email });

      res.status(200).json({message: `User ${d_user.name} account has been deleted successfully`
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting user data', error });
  }
});



router.post('/user/notification', authMiddleware, async (req, res) => {
  const { notification } = req.body;
  const userId = req.user.id; 

  try {
      const validNotifications = ['mute', 'all', 'priority'];
      if (!validNotifications.includes(notification)) {
          return res.status(400).json({ message: 'Invalid notification setting.' });
      }

      const user = await User.findByIdAndUpdate(userId, { notification }, { new: true });
      
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ message: 'Notification setting updated successfully.', user });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating notification setting.', error });
  }
});



router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.password = String(otp);

    await user.save();

    const mailOptions = {
      from: 'no-reply@planr.com',
      to: email,
      subject: 'Your OTP for Plan-R',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to Plan-R!</h2>
          <p style="font-size: 16px;">Your One-Time Password (OTP) is:</p>
          <h1 style="font-size: 36px; color: #007BFF;">${otp}</h1>
          <p style="font-size: 16px;">This OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="font-size: 16px;">Please enter this code to complete your verification.</p>
          <hr style="border: 1px solid #ccc;">
          <footer style="font-size: 12px; color: #777;">
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you for using Plan-R!</p>
          </footer>
        </div>
      `,
    };    

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while sending OTP.' });
  }
});

router.post('/signup', async (req, res) => {
  const { email, name, otp, password } = req.body;
  const n_otp = Number(otp);
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User does not exist. Please request an OTP.' });
    }

    if (user.otp === n_otp && user.otpExpiry > Date.now()) {
      user.name = name;
      user.password = await bcrypt.hash(password, 10);
      user.otp = '';
      user.otpExpiry = null;
      user.isActive = true;

      const token = jwt.sign({ id: user._id }, 'fuwvegwifviubwvfuhj', { expiresIn: '1h' });

      await user.save();
      res.status(200).json({ message: 'Signup successful!', token });
    } else {console.log(
        user.otp, n_otp, user.otp === n_otp, typeof user.otp, typeof n_otp);
        console.log(user.otpExpiry > Date.now());
      res.status(400).json({ message: 'Invalid OTP or OTP expired.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during signup.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id }, 'fuwvegwifviubwvfuhj', { expiresIn: '1h' });


    user.jwtToken = token; 
    user.isActive = true;
    await user.save();

    res.status(200).json({ message: 'Login successful!', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

router.post('/recovery', async (req, res) => {
  const { email, otp, password } = req.body;
  const n_otp = Number(otp);
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User does not exist.' });
    }

    if (user.otp === n_otp && user.otpExpiry > Date.now()) {
      user.password = await bcrypt.hash(password, 10);
      user.otp = '';
      user.otpExpiry = null;

      await user.save();
      res.status(200).json({ message: 'Password has been reset successfully.' });
    } else {

      console.log(user.otp, n_otp, user.otp === n_otp, typeof user.otp, typeof n_otp);
      res.status(400).json({ message: 'Invalid OTP or OTP expired.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during password recovery.' });
  }
});


router.post('/logout', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }
  
    jwt.verify(token, 'fuwvegwifviubwvfuhj', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Failed to authenticate token.' });
      }
  
      try {
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }
  
        const blacklistedToken = new TokenBlacklist({ token });
        await blacklistedToken.save();

        user.isActive = false;
        await user.save();
  
        res.status(200).json({ message: 'User logged out successfully.' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during logout.' });
      }
    });
  });

  
module.exports = router;
