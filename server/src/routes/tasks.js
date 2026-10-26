import express from 'express';
import { Task } from '../models/Task.js';
import { HouseholdMember } from '../models/HouseholdMember.js';
import { Profile } from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Lấy danh sách ID gia đình mà user tham gia
const getUserHouseholdIds = async (userId) => {
  const memberships = await HouseholdMember.find({ user_id: userId, status: 'active' }).select('household_id');
  return memberships.map((m) => m.household_id);
};

// 1. GET /api/tasks - Lấy danh sách việc nhà
//    Query params:
//      ?status=completed|pending   - lọc theo trạng thái
//      ?assigned_to=<userId>       - lọc theo người được giao
//      ?household_id=<id>          - lọc theo gia đình
//      ?tag=<tag>                  - lọc theo tag
//      ?priority=true|false        - lọc theo ưu tiên
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const householdIds = await getUserHouseholdIds(req.user.id);

    const filter = {
      $or: [
        { user_id: req.user.id },
        { household_id: { $in: householdIds } },
      ],
    };

    // Lọc theo trạng thái
    if (req.query.status === 'completed') filter.completed = true;
    else if (req.query.status === 'pending') filter.completed = false;

    // Lọc theo người được giao (userId hoặc 'Tôi')
    if (req.query.assigned_to) filter.assigned_to_user_id = req.query.assigned_to;

    // Lọc theo gia đình cụ thể
    if (req.query.household_id) {
      filter.household_id = req.query.household_id;
      delete filter.$or; // Nếu lọc household_id cụ thể, bỏ điều kiện $or
    }

    // Lọc theo tag
    if (req.query.tag) filter.tag = req.query.tag;

    // Lọc theo ưu tiên
    if (req.query.priority !== undefined) filter.priority = req.query.priority === 'true';

    const tasks = await Task.find(filter).sort({ priority: -1, createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/tasks/:id - Lấy chi tiết một công việc
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const householdIds = await getUserHouseholdIds(req.user.id);
    const task = await Task.findOne({
      id: req.params.id,
      $or: [{ user_id: req.user.id }, { household_id: { $in: householdIds } }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc.' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/tasks - Tạo việc nhà mới
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, time, amount, assigned_to, assigned_to_user_id, avatar_url, tag, priority, household_id, due_date, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề công việc không được để trống.' });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description || '',
      time: time || '',
      due_date: due_date ? new Date(due_date) : null,
      amount: Number(amount) || 0,
      assigned_to: assigned_to || 'Tôi',
      assigned_to_user_id: assigned_to_user_id || null,
      avatar_url: avatar_url || req.user.avatar_url || '',
      tag: tag || 'Gia đình',
      priority: Boolean(priority),
      completed: false,
      user_id: req.user.id,
      household_id: household_id || null,
    });

    res.status(201).json({ success: true, message: 'Tạo công việc thành công.', data: newTask });
  } catch (error) {
    next(error);
  }
});

// 4. PATCH /api/tasks/:id - Cập nhật thông tin công việc
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const householdIds = await getUserHouseholdIds(req.user.id);
    const task = await Task.findOne({
      id: req.params.id,
      $or: [{ user_id: req.user.id }, { household_id: { $in: householdIds } }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc hoặc bạn không có quyền chỉnh sửa.' });
    }

    const { title, description, time, due_date, amount, assigned_to, assigned_to_user_id, avatar_url, tag, priority } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (time !== undefined) task.time = time;
    if (due_date !== undefined) task.due_date = due_date ? new Date(due_date) : null;
    if (amount !== undefined) task.amount = Number(amount);
    if (assigned_to !== undefined) task.assigned_to = assigned_to;
    if (assigned_to_user_id !== undefined) task.assigned_to_user_id = assigned_to_user_id;
    if (avatar_url !== undefined) task.avatar_url = avatar_url;
    if (tag !== undefined) task.tag = tag;
    if (priority !== undefined) task.priority = Boolean(priority);

    await task.save();

    res.json({ success: true, message: 'Cập nhật công việc thành công.', data: task });
  } catch (error) {
    next(error);
  }
});

// 5. PUT /api/tasks/:id/toggle - Hoàn thành / Hủy hoàn thành việc nhà
router.put('/:id/toggle', requireAuth, async (req, res, next) => {
  try {
    const householdIds = await getUserHouseholdIds(req.user.id);
    const task = await Task.findOne({
      id: req.params.id,
      $or: [{ user_id: req.user.id }, { household_id: { $in: householdIds } }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc.' });
    }

    task.completed = !task.completed;
    if (task.completed) task.completed_at = new Date();
    else task.completed_at = null;
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

// 6. PUT /api/tasks/:id/assign - Giao công việc cho thành viên
router.put('/:id/assign', requireAuth, async (req, res, next) => {
  try {
    const { assigned_to_user_id } = req.body;

    if (!assigned_to_user_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp assigned_to_user_id.' });
    }

    const householdIds = await getUserHouseholdIds(req.user.id);
    const task = await Task.findOne({
      id: req.params.id,
      $or: [{ user_id: req.user.id }, { household_id: { $in: householdIds } }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc.' });
    }

    // Lấy tên và avatar của người được giao
    const assignee = await Profile.findOne({ id: assigned_to_user_id });
    if (!assignee) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để giao việc.' });
    }

    // Nếu task thuộc gia đình, kiểm tra assignee có phải thành viên không
    if (task.household_id) {
      const isMember = await HouseholdMember.exists({
        household_id: task.household_id,
        user_id: assigned_to_user_id,
        status: 'active',
      });
      if (!isMember) {
        return res.status(400).json({ success: false, message: 'Người dùng không phải thành viên của gia đình này.' });
      }
    }

    task.assigned_to_user_id = assigned_to_user_id;
    task.assigned_to = assignee.display_name || assignee.email;
    task.avatar_url = assignee.avatar_url || '';
    await task.save();

    res.json({ success: true, message: `Đã giao việc cho ${task.assigned_to}.`, data: task });
  } catch (error) {
    next(error);
  }
});

// 7. DELETE /api/tasks/:id - Xóa việc nhà
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    // Chỉ người tạo hoặc thành viên cùng gia đình mới được xóa
    const householdIds = await getUserHouseholdIds(req.user.id);
    const task = await Task.findOne({
      id: req.params.id,
      $or: [{ user_id: req.user.id }, { household_id: { $in: householdIds } }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc cần xóa.' });
    }

    await Task.deleteOne({ id: req.params.id });

    res.json({ success: true, message: 'Xóa việc nhà thành công.' });
  } catch (error) {
    next(error);
  }
});

export default router;

