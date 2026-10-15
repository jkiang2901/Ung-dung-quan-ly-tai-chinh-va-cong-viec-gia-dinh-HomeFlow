import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Profile } from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET || 'homeflow_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản mới (lưu vào bảng profiles)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, display_name, avatar_url, timezone } = req.body;

    if (!email || !password || !display_name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ email, password và display_name',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
    }

    const existingUser = await Profile.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newProfile = await Profile.create({
      email: email.toLowerCase().trim(),
      password_hash,
      display_name: display_name.trim(),
      avatar_url: avatar_url || null,
      timezone: timezone || 'Asia/Ho_Chi_Minh',
    });

    const token = generateToken(newProfile.id, newProfile.email);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      token,
      user: newProfile,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Đăng nhập
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu',
      });
    }

    const user = await Profile.findOne({ email: email.toLowerCase().trim() }).select('+password_hash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Lấy thông tin tài khoản hiện tại
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin profile
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { display_name, avatar_url, timezone } = req.body;
    const updates = {};

    if (display_name) updates.display_name = display_name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (timezone) updates.timezone = timezone;

    const updatedProfile = await Profile.findOneAndUpdate(
      { id: req.user.id },
      { $set: updates },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
