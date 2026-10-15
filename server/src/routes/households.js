import express from 'express';
import crypto from 'crypto';
import { Household } from '../models/Household.js';
import { HouseholdMember } from '../models/HouseholdMember.js';
import { HouseholdInvitation } from '../models/HouseholdInvitation.js';
import { Profile } from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/households
// @desc    Lấy danh sách các gia đình user đang tham gia
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const memberships = await HouseholdMember.find({
      user_id: req.user.id,
      status: 'active',
    });

    const householdIds = memberships.map((m) => m.household_id);
    const households = await Household.find({ id: { $in: householdIds } });

    const result = households.map((hh) => {
      const mem = memberships.find((m) => m.household_id === hh.id);
      return {
        ...hh.toJSON(),
        my_role: mem?.role || 'member',
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/households
// @desc    Tạo gia đình mới (Người tạo tự động là 'owner' trong household_members)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, currency } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên gia đình là bắt buộc.',
      });
    }

    const newHousehold = await Household.create({
      name: name.trim(),
      created_by: req.user.id,
      currency: currency || 'VND',
    });

    // Thêm người tạo vào household_members với role 'owner'
    await HouseholdMember.create({
      household_id: newHousehold.id,
      user_id: req.user.id,
      role: 'owner',
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Tạo gia đình thành công.',
      data: newHousehold,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/households/:id/members
// @desc    Lấy danh sách thành viên trong gia đình
router.get('/:id/members', requireAuth, async (req, res, next) => {
  try {
    const householdId = req.params.id;

    // Kiểm tra quyền truy cập
    const isMember = await HouseholdMember.exists({
      household_id: householdId,
      user_id: req.user.id,
      status: 'active',
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là thành viên của gia đình này.',
      });
    }

    const members = await HouseholdMember.find({
      household_id: householdId,
      status: 'active',
    });

    const userIds = members.map((m) => m.user_id);
    const profiles = await Profile.find({ id: { $in: userIds } });

    const result = members.map((m) => {
      const prof = profiles.find((p) => p.id === m.user_id);
      return {
        ...m.toJSON(),
        display_name: prof?.display_name || 'Thành viên',
        avatar_url: prof?.avatar_url || null,
        email: prof?.email || null,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/households/:id/invitations
// @desc    Mời thành viên qua email (Chỉ owner hoặc admin mới được mời)
router.post('/:id/invitations', requireAuth, async (req, res, next) => {
  try {
    const householdId = req.params.id;
    const { invited_email, role = 'member' } = req.body;

    if (!invited_email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp invited_email.',
      });
    }

    // Kiểm tra quyền mời: Phải là owner hoặc admin
    const myMembership = await HouseholdMember.findOne({
      household_id: householdId,
      user_id: req.user.id,
      status: 'active',
    });

    if (!myMembership || !['owner', 'admin'].includes(myMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ có chủ hộ (owner) hoặc quản trị viên (admin) mới có quyền gửi lời mời.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày

    const invitation = await HouseholdInvitation.create({
      household_id: householdId,
      invited_email: invited_email.toLowerCase().trim(),
      invited_by: req.user.id,
      role: role === 'admin' ? 'admin' : 'member',
      token_hash,
      expires_at: expiresAt,
    });

    res.status(201).json({
      success: true,
      message: 'Đã gửi lời mời thành công.',
      invite_token: token,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
