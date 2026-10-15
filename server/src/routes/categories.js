import express from 'express';
import { Category } from '../models/Category.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/categories
// @desc    Lấy danh mục thu chi (mặc định + cá nhân + gia đình)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { type, household_id } = req.query;

    const filter = {
      $or: [
        { is_default: true },
        { owner_user_id: req.user.id },
      ],
    };

    if (household_id) {
      filter.$or.push({ household_id });
    }

    if (type) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ is_default: -1, name: 1 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/categories
// @desc    Tạo danh mục mới
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, type, icon, color, household_id } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục (name) và loại (type: income | expense) là bắt buộc.',
      });
    }

    const newCategory = await Category.create({
      name: name.trim(),
      type,
      icon: icon || 'tag',
      color: color || '#3b82f6',
      owner_user_id: household_id ? null : req.user.id,
      household_id: household_id || null,
      is_default: false,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công.',
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/categories/:id
// @desc    Cập nhật danh mục tùy chỉnh
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục.',
      });
    }

    if (category.is_default) {
      return res.status(403).json({
        success: false,
        message: 'Không thể chỉnh sửa danh mục mặc định của hệ thống.',
      });
    }

    if (category.owner_user_id && category.owner_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa danh mục này.',
      });
    }

    const { name, icon, color, type } = req.body;
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (type) category.type = type;

    await category.save();

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/categories/:id
// @desc    Xóa danh mục tùy chỉnh
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục.',
      });
    }

    if (category.is_default) {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa danh mục mặc định của hệ thống.',
      });
    }

    await Category.deleteOne({ id: category.id });

    res.json({
      success: true,
      message: 'Đã xóa danh mục.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
