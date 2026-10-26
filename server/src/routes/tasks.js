import express from 'express';
import { Task } from '../models/Task.js';
import { HouseholdMember } from '../models/HouseholdMember.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Lấy danh sách ID gia đình mà user tham gia
const getUserHouseholdIds = async (userId) => {
  const memberships = await HouseholdMember.find({ user_id: userId, status: 'active' }).select('household_id');
  return memberships.map((m) => m.household_id);
};

// 1. GET /api/tasks - Lấy danh sách việc nhà
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const householdIds = await getUserHouseholdIds(req.user.id);
    const filter = {
      $or: [
        { user_id: req.user.id },
        { household_id: { $in: householdIds } },
      ],
    };

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/tasks - Tạo việc nhà mới trên MongoDB Atlas
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, time, amount, assigned_to, avatar_url, tag, priority, household_id } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề công việc không được để trống.',
      });
    }

    const newTask = await Task.create({
      title: title.trim(),
      time: time || '',
      amount: Number(amount) || 0,
      assigned_to: assigned_to || 'Tôi',
      avatar_url: avatar_url || req.user.avatar_url || '',
      tag: tag || 'Gia đình',
      priority: Boolean(priority),
      completed: false,
      user_id: req.user.id,
      household_id: household_id || null,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo công việc thành công.',
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
});

// 3. PUT /api/tasks/:id/toggle - Hoàn thành / Hủy hoàn thành việc nhà
router.put('/:id/toggle', requireAuth, async (req, res, next) => {
  try {
    const task = await Task.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc.',
      });
    }

    task.completed = !task.completed;
    await task.save();

    res.json({
      success: true,
      message: `Đã ${task.completed ? 'hoàn thành' : 'mở lại'} công việc.`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// 4. DELETE /api/tasks/:id - Xóa việc nhà
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const task = await Task.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc cần xóa.',
      });
    }

    await Task.deleteOne({ id: req.params.id });

    res.json({
      success: true,
      message: 'Xóa việc nhà thành công.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
