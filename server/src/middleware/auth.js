import jwt from 'jsonwebtoken';
import { Profile } from '../models/Profile.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực (Vui lòng gửi Header Authorization: Bearer <token>)',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'homeflow_secret_key');

    const profile = await Profile.findOne({ id: decoded.id });
    if (!profile) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị xóa.',
      });
    }

    req.user = profile;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token xác thực không hợp lệ hoặc đã hết hạn.',
      error: error.message,
    });
  }
};
