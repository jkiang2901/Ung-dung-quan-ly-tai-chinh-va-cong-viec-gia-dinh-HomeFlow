import jwt from 'jsonwebtoken';
import { Profile } from '../models/Profile.js';
import { AdminSetting } from '../models/AdminSetting.js';

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

    if (profile.is_banned) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị quản trị viên khóa.',
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

const ipv4ToNumber = (address) => {
  const parts = address.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) return null;
  return parts.reduce((value, part) => (value * 256) + Number(part), 0);
};

const isAllowedAddress = (address, entry) => {
  const [range, prefixText] = entry.split('/');
  if (!prefixText) return address === range;
  const addressNumber = ipv4ToNumber(address);
  const rangeNumber = ipv4ToNumber(range);
  const prefix = Number(prefixText);
  if (addressNumber === null || rangeNumber === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (addressNumber & mask) === (rangeNumber & mask);
};

export const requireAdmin = async (req, res, next) => {
  try {
    const allowedEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    if (allowedEmails.length === 0) {
      return res.status(503).json({
        success: false,
        message: 'Chưa cấu hình ADMIN_EMAILS trên máy chủ.',
      });
    }

    if (!req.user || !allowedEmails.includes(req.user.email.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản không có quyền quản trị hệ thống.',
      });
    }

    const stored = await AdminSetting.findOne({ key: 'system' }).select('value').lean();
    const whitelist = (stored?.value?.security?.ipWhitelist || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (whitelist.length > 0) {
      const requestIp = (req.ip || req.socket.remoteAddress || '').replace(/^::ffff:/, '');
      if (!whitelist.some((entry) => isAllowedAddress(requestIp, entry))) {
        return res.status(403).json({ success: false, message: 'Địa chỉ IP không nằm trong danh sách được phép.' });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
