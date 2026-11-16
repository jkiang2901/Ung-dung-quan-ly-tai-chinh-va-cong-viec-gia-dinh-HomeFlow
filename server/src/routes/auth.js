import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Profile } from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';
import { AdminSetting } from '../models/AdminSetting.js';

const router = express.Router();
const failedLogins = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

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
    const { email, password, display_name, avatar_url, timezone, phone } = req.body;

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
      phone: phone ? phone.trim() : null,
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

    const normalizedEmail = email.toLowerCase().trim();
    const attemptKey = `${req.ip}:${normalizedEmail}`;
    if (failedLogins.size > 10000) {
      for (const [key, value] of failedLogins) {
        if (Date.now() - value.startedAt >= LOGIN_WINDOW_MS) failedLogins.delete(key);
      }
    }
    const currentAttempt = failedLogins.get(attemptKey);
    if (currentAttempt && Date.now() - currentAttempt.startedAt >= LOGIN_WINDOW_MS) failedLogins.delete(attemptKey);
    const attempt = failedLogins.get(attemptKey);
    const settings = await AdminSetting.findOne({ key: 'system' }).select('value.security.maxLoginAttempts').lean();
    const configuredLimit = Number(settings?.value?.security?.maxLoginAttempts || process.env.MAX_LOGIN_ATTEMPTS || 5);
    const attemptLimit = Number.isInteger(configuredLimit) ? Math.min(Math.max(configuredLimit, 1), 20) : 5;
    if (attempt && attempt.count >= attemptLimit) {
      return res.status(429).json({
        success: false,
        message: 'Đăng nhập tạm thời bị khóa do nhập sai quá nhiều lần. Thử lại sau 15 phút.',
      });
    }

    const user = await Profile.findOne({ email: normalizedEmail }).select('+password_hash');
    if (!user) {
      const previous = failedLogins.get(attemptKey);
      failedLogins.set(attemptKey, { count: (previous?.count || 0) + 1, startedAt: previous?.startedAt || Date.now() });
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const previous = failedLogins.get(attemptKey);
      failedLogins.set(attemptKey, { count: (previous?.count || 0) + 1, startedAt: previous?.startedAt || Date.now() });
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    failedLogins.delete(attemptKey);
    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị quản trị viên khóa.',
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
// @desc    Cập nhật thông tin profile (chỉ cho phép display_name, avatar_url, timezone)
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const forbiddenFields = ['email', 'password', 'password_hash', 'role', 'id', '_id', 'created_at'];
    const attemptedForbidden = forbiddenFields.filter((field) => field in req.body);

    if (attemptedForbidden.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Không được phép thay đổi các trường: ${attemptedForbidden.join(', ')} qua endpoint này.`,
      });
    }

    const { display_name, avatar_url, timezone, phone } = req.body;
    const updates = {};

    if (display_name !== undefined) {
      if (typeof display_name !== 'string' || display_name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tên hiển thị (display_name) không được để trống.',
        });
      }
      if (display_name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Tên hiển thị không được vượt quá 100 ký tự.',
        });
      }
      updates.display_name = display_name.trim();
    }

    if (avatar_url !== undefined) {
      if (avatar_url !== null && typeof avatar_url !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'avatar_url phải là chuỗi đường dẫn hình ảnh hoặc null.',
        });
      }
      updates.avatar_url = avatar_url;
    }

    if (phone !== undefined) {
      if (phone !== null && typeof phone !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'phone phải là chuỗi số điện thoại hoặc null.',
        });
      }
      updates.phone = phone ? phone.trim() : null;
    }

    if (timezone !== undefined) {
      if (typeof timezone !== 'string' || timezone.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Múi giờ (timezone) phải là chuỗi hợp lệ.',
        });
      }
      updates.timezone = timezone.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ít nhất một trường cần cập nhật: display_name, avatar_url, phone, timezone.',
      });
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { id: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password_hash');

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản người dùng.',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      user: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
