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

// @route   PATCH /api/households/:id
// @desc    Cập nhật tên/đơn vị tiền tệ gia đình (chỉ owner/admin)
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const householdId = req.params.id;
    const { name, currency } = req.body;

    const myMembership = await HouseholdMember.findOne({
      household_id: householdId,
      user_id: req.user.id,
      status: 'active',
    });

    if (!myMembership || !['owner', 'admin'].includes(myMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ chủ hộ hoặc quản trị viên mới có thể chỉnh sửa thông tin gia đình.',
      });
    }

    const household = await Household.findOne({ id: householdId });
    if (!household) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gia đình.' });
    }

    if (name) household.name = name.trim();
    if (currency) household.currency = currency;
    await household.save();

    res.json({ success: true, message: 'Cập nhật gia đình thành công.', data: household });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/households/:id
// @desc    Xóa gia đình (chỉ owner)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const householdId = req.params.id;

    const myMembership = await HouseholdMember.findOne({
      household_id: householdId,
      user_id: req.user.id,
      status: 'active',
    });

    if (!myMembership || myMembership.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ chủ hộ (owner) mới có thể xóa gia đình.',
      });
    }

    await Household.deleteOne({ id: householdId });
    await HouseholdMember.deleteMany({ household_id: householdId });
    await HouseholdInvitation.deleteMany({ household_id: householdId });

    res.json({ success: true, message: 'Đã xóa gia đình thành công.' });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/households/:id/members/:userId/role
// @desc    Thay đổi quyền thành viên (owner -> admin/member, admin -> member)
router.patch('/:id/members/:userId/role', requireAuth, async (req, res, next) => {
  try {
    const { id: householdId, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Quyền không hợp lệ. Chỉ chấp nhận 'admin' hoặc 'member'.",
      });
    }

    // Kiểm tra người thực hiện phải là owner hoặc admin
    const myMembership = await HouseholdMember.findOne({
      household_id: householdId,
      user_id: req.user.id,
      status: 'active',
    });

    if (!myMembership || !['owner', 'admin'].includes(myMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thay đổi quyền thành viên.',
      });
    }

    // Admin chỉ có thể set role='member', không thể set role='admin'
    if (myMembership.role === 'admin' && role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Quản trị viên (admin) không thể cấp quyền admin cho người khác.',
      });
    }

    const targetMember = await HouseholdMember.findOne({
      household_id: householdId,
      user_id: userId,
      status: 'active',
    });

    if (!targetMember) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thành viên.' });
    }

    if (targetMember.role === 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Không thể thay đổi quyền của chủ hộ (owner).',
      });
    }

    targetMember.role = role;
    await targetMember.save();

    res.json({
      success: true,
      message: `Đã cập nhật quyền thành viên thành '${role}'.`,
      data: targetMember,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/households/:id/members/:userId
// @desc    Xóa thành viên khỏi gia đình (owner/admin kick, hoặc tự rời)
router.delete('/:id/members/:userId', requireAuth, async (req, res, next) => {
  try {
    const { id: householdId, userId } = req.params;

    const myMembership = await HouseholdMember.findOne({
      household_id: householdId,
      user_id: req.user.id,
      status: 'active',
    });

    if (!myMembership) {
      return res.status(403).json({ success: false, message: 'Bạn không phải thành viên gia đình này.' });
    }

    const isSelf = req.user.id === userId;
    const isOwnerOrAdmin = ['owner', 'admin'].includes(myMembership.role);

    // Chỉ cho phép: tự rời hoặc owner/admin kick người khác
    if (!isSelf && !isOwnerOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa thành viên này.',
      });
    }

    const targetMember = await HouseholdMember.findOne({
      household_id: householdId,
      user_id: userId,
      status: 'active',
    });

    if (!targetMember) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thành viên.' });
    }

    // Không cho phép xóa owner (trừ khi tự rời với tư cách owner)
    if (targetMember.role === 'owner' && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa chủ hộ (owner) khỏi gia đình.',
      });
    }

    targetMember.status = isSelf ? 'left' : 'removed';
    await targetMember.save();

    res.json({
      success: true,
      message: isSelf ? 'Bạn đã rời gia đình.' : 'Đã xóa thành viên khỏi gia đình.',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/households/invitations/accept
// @desc    Chấp nhận lời mời vào gia đình qua token
router.post('/invitations/accept', requireAuth, async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp token lời mời.' });
    }

    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    const invitation = await HouseholdInvitation.findOne({ token_hash, status: 'pending' });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Token không hợp lệ hoặc đã được sử dụng.' });
    }

    if (invitation.expires_at < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(410).json({ success: false, message: 'Lời mời đã hết hạn.' });
    }

    // Kiểm tra user đã là thành viên chưa
    const existing = await HouseholdMember.findOne({
      household_id: invitation.household_id,
      user_id: req.user.id,
    });

    if (existing && existing.status === 'active') {
      return res.status(409).json({ success: false, message: 'Bạn đã là thành viên của gia đình này.' });
    }

    if (existing) {
      existing.status = 'active';
      existing.role = invitation.role;
      existing.joined_at = new Date();
      await existing.save();
    } else {
      await HouseholdMember.create({
        household_id: invitation.household_id,
        user_id: req.user.id,
        role: invitation.role,
        status: 'active',
      });
    }

    invitation.status = 'accepted';
    await invitation.save();

    res.json({
      success: true,
      message: 'Đã tham gia gia đình thành công.',
      household_id: invitation.household_id,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/households/:id/invitations
// @desc    Lấy danh sách lời mời đang chờ (owner/admin xem)
router.get('/:id/invitations', requireAuth, async (req, res, next) => {
  try {
    const householdId = req.params.id;

    const myMembership = await HouseholdMember.findOne({
      household_id: householdId,
      user_id: req.user.id,
      status: 'active',
    });

    if (!myMembership || !['owner', 'admin'].includes(myMembership.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem danh sách lời mời.' });
    }

    const invitations = await HouseholdInvitation.find({
      household_id: householdId,
      status: 'pending',
    }).sort({ created_at: -1 });

    res.json({ success: true, data: invitations });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/households/:id/invitations/:invitationId
// @desc    Hủy lời mời (owner/admin)
router.delete('/:id/invitations/:invitationId', requireAuth, async (req, res, next) => {
  try {
    const { id: householdId, invitationId } = req.params;

    const myMembership = await HouseholdMember.findOne({
      household_id: householdId,
      user_id: req.user.id,
      status: 'active',
    });

    if (!myMembership || !['owner', 'admin'].includes(myMembership.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy lời mời.' });
    }

    const invitation = await HouseholdInvitation.findOne({ id: invitationId, household_id: householdId });
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lời mời.' });
    }

    invitation.status = 'cancelled';
    await invitation.save();

    res.json({ success: true, message: 'Đã hủy lời mời.' });
  } catch (error) {
    next(error);
  }
});

export default router;

