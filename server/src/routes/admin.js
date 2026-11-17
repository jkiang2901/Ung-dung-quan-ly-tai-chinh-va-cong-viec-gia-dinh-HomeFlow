import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { Profile } from '../models/Profile.js';
import { Household } from '../models/Household.js';
import { HouseholdMember } from '../models/HouseholdMember.js';
import { HouseholdInvitation } from '../models/HouseholdInvitation.js';
import { Account } from '../models/Account.js';
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { TransactionTransfer } from '../models/TransactionTransfer.js';
import { Task } from '../models/Task.js';
import { Debt } from '../models/Debt.js';
import { AdminSetting } from '../models/AdminSetting.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

const dateLabel = (value) => (value ? new Date(value).toISOString() : '');
const profileLabel = (profile) => profile?.display_name || profile?.email || 'Không rõ';
const boundedLimit = (value, fallback = 5000) => {
  const limit = Number.parseInt(value, 10);
  return Number.isInteger(limit) && limit > 0 ? Math.min(limit, 20000) : fallback;
};

router.get('/me', (req, res) => {
  res.json({ success: true, user: { id: req.user.id, email: req.user.email, display_name: req.user.display_name } });
});

router.get('/overview', async (req, res, next) => {
  try {
    const [users, households, accounts, transactions, tasks, debts] = await Promise.all([
      Profile.countDocuments(),
      Household.countDocuments(),
      Account.countDocuments({ is_archived: false }),
      Transaction.find().sort({ transaction_date: -1 }).select('amount type transaction_date').lean(),
      Task.find().select('completed').lean(),
      Debt.find().select('amount paid_amount due_date status').lean(),
    ]);
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
      return {
        key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
        month: month.toLocaleDateString('vi-VN', { month: 'short' }),
        income: 0,
        expense: 0,
      };
    });
    const monthIndex = new Map(months.map((month, index) => [month.key, index]));
    transactions.forEach((tx) => {
      const date = new Date(tx.transaction_date || 0);
      const index = monthIndex.get(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      if (index !== undefined) months[index][tx.type] += tx.amount || 0;
    });
    const userGrowth = await Profile.aggregate([
      { $match: { created_at: { $gte: months[0] ? new Date(`${months[0].key}-01`) : new Date(0) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$created_at' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const overdueDebts = debts.filter((debt) => debt.status !== 'completed' && debt.due_date && new Date(debt.due_date) < now).length;
    res.json({
      success: true,
      stats: {
        users,
        households,
        accounts,
        transactions: transactions.length,
        monthlyIncome: months.at(-1)?.income || 0,
        monthlyExpense: months.at(-1)?.expense || 0,
        debts: debts.length,
        overdueDebts,
        tasks: tasks.length,
        completedTasks: tasks.filter((task) => task.completed).length,
      },
      monthlyCashFlow: months,
      userGrowth: userGrowth.map((row) => ({ month: row._id, users: row.count })),
      recentTransactions: transactions.slice(-5).reverse(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const profiles = await Profile.find().sort({ created_at: -1 }).lean();
    const ids = profiles.map((profile) => profile.id);
    const [memberships, accounts, transactions] = await Promise.all([
      HouseholdMember.aggregate([{ $match: { user_id: { $in: ids }, status: 'active' } }, { $group: { _id: '$user_id', count: { $sum: 1 } } }]),
      Account.aggregate([{ $match: { owner_user_id: { $in: ids }, is_archived: false } }, { $group: { _id: '$owner_user_id', count: { $sum: 1 } } }]),
      Transaction.aggregate([{ $match: { user_id: { $in: ids } } }, { $group: { _id: '$user_id', count: { $sum: 1 } } }]),
    ]);
    const counts = (rows) => new Map(rows.map((row) => [row._id, row.count]));
    const householdCounts = counts(memberships);
    const walletCounts = counts(accounts);
    const transactionCounts = counts(transactions);
    res.json({
      success: true,
      users: profiles.map((profile) => ({
        id: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        phone: profile.phone || '',
        role: 'MEMBER',
        status: profile.is_banned ? 'banned' : 'active',
        avatarUrl: profile.avatar_url || '',
        joinedAt: dateLabel(profile.created_at),
        lastActive: '',
        householdsCount: householdCounts.get(profile.id) || 0,
        walletsCount: walletCounts.get(profile.id) || 0,
        totalTransactions: transactionCounts.get(profile.id) || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    if (typeof req.body.isBanned !== 'boolean') return res.status(400).json({ success: false, message: 'isBanned phải là true hoặc false.' });
    if (req.params.id === req.user.id && req.body.isBanned) return res.status(400).json({ success: false, message: 'Không thể khóa chính tài khoản quản trị đang đăng nhập.' });
    const profile = await Profile.findOneAndUpdate(
      { id: req.params.id },
      { $set: { is_banned: req.body.isBanned } },
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    res.json({ success: true, isBanned: profile.is_banned });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.displayName !== undefined) {
      if (typeof req.body.displayName !== 'string' || !req.body.displayName.trim() || req.body.displayName.trim().length > 100) {
        return res.status(400).json({ success: false, message: 'Tên người dùng phải dài 1-100 ký tự.' });
      }
      updates.display_name = req.body.displayName.trim();
    }
    if (req.body.email !== undefined) {
      if (typeof req.body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email.trim())) {
        return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
      }
      updates.email = req.body.email.trim().toLowerCase();
    }
    if (req.body.phone !== undefined) {
      if (typeof req.body.phone !== 'string' || req.body.phone.length > 30) return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ.' });
      updates.phone = req.body.phone.trim() || null;
    }
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'Không có trường hợp lệ để cập nhật.' });
    const profile = await Profile.findOneAndUpdate({ id: req.params.id }, { $set: updates }, { new: true, runValidators: true });
    if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    res.json({ success: true, profile: { id: profile.id, displayName: profile.display_name, email: profile.email, phone: profile.phone || '' } });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  let session;
  try {
    session = await Profile.startSession();
    if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản quản trị đang đăng nhập.' });
    const profile = await Profile.findOne({ id: req.params.id }).select('id email').lean();
    if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase());
    if (adminEmails.includes(profile.email.toLowerCase())) return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản nằm trong ADMIN_EMAILS.' });

    await session.withTransaction(async () => {
      const ownedHouseholds = await Household.countDocuments({ created_by: profile.id }).session(session);
      if (ownedHouseholds > 0) {
        const error = new Error('Người dùng đang là chủ hộ. Hãy chuyển quyền chủ hộ trước khi xóa tài khoản.');
        error.status = 409;
        throw error;
      }
      const accountIds = await Account.find({ owner_user_id: profile.id }).distinct('id').session(session);
      const transferIds = await TransactionTransfer.find({
        $or: [{ from_account_id: { $in: accountIds } }, { to_account_id: { $in: accountIds } }],
      }).distinct('id').session(session);
      await Transaction.deleteMany({ $or: [{ user_id: profile.id }, { account_id: { $in: accountIds } }, { transfer_id: { $in: transferIds } }] }, { session });
      await TransactionTransfer.deleteMany({ id: { $in: transferIds } }, { session });
      await Account.deleteMany({ owner_user_id: profile.id }, { session });
      await Category.deleteMany({ owner_user_id: profile.id }, { session });
      await HouseholdMember.deleteMany({ user_id: profile.id }, { session });
      await Debt.deleteMany({ user_id: profile.id }, { session });
      await Task.deleteMany({ user_id: profile.id }, { session });
      await Task.updateMany({ assigned_to_user_id: profile.id }, { $set: { assigned_to_user_id: null, assigned_to: 'Chưa giao', avatar_url: '' } }, { session });
      await Profile.deleteOne({ id: profile.id }, { session });
    });
    res.json({ success: true, message: 'Đã xóa tài khoản và dữ liệu liên quan.' });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  } finally {
    if (session) await session.endSession();
  }
});

router.get('/households', async (req, res, next) => {
  try {
    const households = await Household.find().sort({ created_at: -1 }).lean();
    const ids = households.map((household) => household.id);
    const [members, accounts, profiles, transactions] = await Promise.all([
      HouseholdMember.find({ household_id: { $in: ids }, status: 'active' }).lean(),
      Account.find({ household_id: { $in: ids }, is_archived: false }).lean(),
      Profile.find().select('id display_name email avatar_url').lean(),
      Transaction.find({ household_id: { $in: ids } }).select('account_id type amount').lean(),
    ]);
    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
    const response = households.map((household) => {
      const householdMembers = members.filter((member) => member.household_id === household.id);
      const householdAccounts = accounts.filter((account) => account.household_id === household.id);
      const accountIds = new Set(householdAccounts.map((account) => account.id));
      const householdTransactions = transactions.filter((transaction) => accountIds.has(transaction.account_id));
      const owner = profileMap.get(household.created_by);
      return {
        id: household.id,
        name: household.name,
        ownerId: household.created_by,
        ownerName: profileLabel(owner),
        ownerEmail: owner?.email || '',
        membersCount: householdMembers.length,
        walletsCount: householdAccounts.length,
        totalFund: householdAccounts.reduce((sum, account) => sum + (account.initial_balance || 0), 0)
          + householdTransactions.reduce((sum, transaction) => sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount), 0),
        currency: household.currency,
        createdAt: dateLabel(household.created_at),
        members: householdMembers.map((member) => {
          const profile = profileMap.get(member.user_id);
          return { userId: member.user_id, name: profileLabel(profile), role: member.role.toUpperCase(), avatarUrl: profile?.avatar_url || '' };
        }),
      };
    });
    res.json({ success: true, households: response });
  } catch (error) {
    next(error);
  }
});

router.put('/households/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.trim().length > 100) {
        return res.status(400).json({ success: false, message: 'Tên gia đình phải dài 1-100 ký tự.' });
      }
      updates.name = req.body.name.trim();
    }
    if (req.body.currency !== undefined) {
      if (typeof req.body.currency !== 'string' || !/^[A-Za-z]{3}$/.test(req.body.currency)) {
        return res.status(400).json({ success: false, message: 'Đơn vị tiền tệ phải gồm 3 ký tự.' });
      }
      updates.currency = req.body.currency.toUpperCase();
    }
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'Không có trường hợp lệ để cập nhật.' });
    const household = await Household.findOneAndUpdate({ id: req.params.id }, { $set: updates }, { new: true, runValidators: true });
    if (!household) return res.status(404).json({ success: false, message: 'Không tìm thấy gia đình.' });
    res.json({ success: true, household });
  } catch (error) {
    next(error);
  }
});

router.delete('/households/:id', async (req, res, next) => {
  let session;
  try {
    session = await Household.startSession();
    let found = false;
    await session.withTransaction(async () => {
      const household = await Household.findOne({ id: req.params.id }).session(session).lean();
      if (!household) return;
      found = true;
      const accountIds = await Account.find({ household_id: household.id }).distinct('id').session(session);
      const transferIds = await TransactionTransfer.find({
        $or: [{ from_account_id: { $in: accountIds } }, { to_account_id: { $in: accountIds } }],
      }).distinct('id').session(session);
      await Transaction.deleteMany({ $or: [{ household_id: household.id }, { account_id: { $in: accountIds } }, { transfer_id: { $in: transferIds } }] }, { session });
      await TransactionTransfer.deleteMany({ id: { $in: transferIds } }, { session });
      await Account.deleteMany({ household_id: household.id }, { session });
      await Category.deleteMany({ household_id: household.id }, { session });
      await HouseholdMember.deleteMany({ household_id: household.id }, { session });
      await HouseholdInvitation.deleteMany({ household_id: household.id }, { session });
      await Task.deleteMany({ household_id: household.id }, { session });
      await Household.deleteOne({ id: household.id }, { session });
    });
    if (!found) return res.status(404).json({ success: false, message: 'Không tìm thấy gia đình.' });
    res.json({ success: true, message: 'Đã xóa gia đình và dữ liệu liên quan.' });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  } finally {
    if (session) await session.endSession();
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const [rows, profiles, accounts, categories, households] = await Promise.all([
      Transaction.find().sort({ transaction_date: -1 }).limit(boundedLimit(req.query.limit)).lean(),
      Profile.find().select('id display_name email').lean(),
      Account.find().select('id name').lean(),
      Category.find().select('id name').lean(),
      Household.find().select('id name').lean(),
    ]);
    const mapById = (values) => new Map(values.map((value) => [value.id, value]));
    const profileMap = mapById(profiles), accountMap = mapById(accounts), categoryMap = mapById(categories), householdMap = mapById(households);
    res.json({
      success: true,
      transactions: rows.map((row) => ({
        id: row.id,
        title: row.note || categoryMap.get(row.category_id)?.name || 'Giao dịch',
        userName: profileLabel(profileMap.get(row.user_id)),
        userEmail: profileMap.get(row.user_id)?.email || '',
        accountName: accountMap.get(row.account_id)?.name || '',
        householdName: householdMap.get(row.household_id)?.name || '',
        amount: row.amount,
        type: row.is_transfer ? 'transfer' : row.type,
        category: categoryMap.get(row.category_id)?.name || 'Khác',
        date: dateLabel(row.transaction_date),
        status: 'completed',
        isTransfer: row.is_transfer,
        accountId: row.account_id,
        categoryId: row.category_id,
        note: row.note || '',
        transactionDate: row.transaction_date,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.put('/transactions/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.amount !== undefined) {
      if (!Number.isFinite(req.body.amount) || req.body.amount < 0) return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ.' });
      updates.amount = req.body.amount;
    }
    if (req.body.type !== undefined) {
      if (!['income', 'expense'].includes(req.body.type)) return res.status(400).json({ success: false, message: 'Loại giao dịch không hợp lệ.' });
      updates.type = req.body.type;
    }
    if (req.body.note !== undefined) {
      if (typeof req.body.note !== 'string' || req.body.note.length > 500) return res.status(400).json({ success: false, message: 'Ghi chú không hợp lệ.' });
      updates.note = req.body.note.trim();
    }
    if (req.body.transactionDate !== undefined) {
      const date = new Date(req.body.transactionDate);
      if (Number.isNaN(date.getTime())) return res.status(400).json({ success: false, message: 'Ngày giao dịch không hợp lệ.' });
      updates.transaction_date = date;
    }
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'Không có trường hợp lệ để cập nhật.' });
    const transaction = await Transaction.findOneAndUpdate(
      { id: req.params.id, is_transfer: { $ne: true } },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch hoặc giao dịch chuyển ví không thể sửa ở đây.' });
    res.json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
});

router.delete('/transactions/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ id: req.params.id }).lean();
    if (!transaction) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch.' });
    if (transaction.is_transfer && transaction.transfer_id) {
      await Promise.all([
        Transaction.deleteMany({ transfer_id: transaction.transfer_id }),
        TransactionTransfer.deleteOne({ id: transaction.transfer_id }),
      ]);
    } else {
      await Transaction.deleteOne({ id: transaction.id });
    }
    res.json({ success: true, message: 'Đã xóa giao dịch.' });
  } catch (error) {
    next(error);
  }
});

router.get('/debts', async (req, res, next) => {
  try {
    const [debts, profiles] = await Promise.all([
      Debt.find().sort({ due_date: 1 }).limit(boundedLimit(req.query.limit)).lean(),
      Profile.find().select('id display_name').lean(),
    ]);
    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
    res.json({
      success: true,
      debts: debts.map((debt) => {
        const owner = profileLabel(profileMap.get(debt.user_id));
        const overdue = debt.status !== 'completed' && debt.due_date && new Date(debt.due_date) < new Date();
        return {
          id: debt.id,
          title: debt.note || `${debt.type === 'lend' ? 'Cho vay' : 'Đi vay'} - ${debt.person_name}`,
          creditorName: debt.type === 'lend' ? owner : debt.person_name,
          debtorName: debt.type === 'lend' ? debt.person_name : owner,
          amount: debt.amount,
          paidAmount: debt.paid_amount,
          dueDate: dateLabel(debt.due_date),
          createdAt: dateLabel(debt.created_at || debt.start_date),
          status: debt.status === 'completed' ? 'paid' : overdue ? 'overdue' : debt.paid_amount > 0 ? 'partial' : 'unpaid',
          note: debt.note || '',
          personName: debt.person_name,
          type: debt.type,
          userId: debt.user_id,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.put('/debts/:id', async (req, res, next) => {
  try {
    const existing = await Debt.findOne({ id: req.params.id }).select('amount paid_amount').lean();
    if (!existing) return res.status(404).json({ success: false, message: 'Không tìm thấy khoản nợ.' });
    const updates = {};
    if (req.body.personName !== undefined) {
      if (typeof req.body.personName !== 'string' || !req.body.personName.trim()) return res.status(400).json({ success: false, message: 'Tên người liên quan không được để trống.' });
      updates.person_name = req.body.personName.trim();
    }
    if (req.body.amount !== undefined) {
      if (!Number.isFinite(req.body.amount) || req.body.amount < 0) return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ.' });
      updates.amount = req.body.amount;
    }
    if (req.body.paidAmount !== undefined) {
      if (!Number.isFinite(req.body.paidAmount) || req.body.paidAmount < 0 || req.body.paidAmount > (updates.amount ?? existing.amount)) {
        return res.status(400).json({ success: false, message: 'Số tiền đã trả không hợp lệ.' });
      }
      updates.paid_amount = req.body.paidAmount;
    }
    if (req.body.dueDate !== undefined) {
      const date = req.body.dueDate ? new Date(req.body.dueDate) : null;
      if (date && Number.isNaN(date.getTime())) return res.status(400).json({ success: false, message: 'Ngày đến hạn không hợp lệ.' });
      updates.due_date = date;
    }
    if (req.body.note !== undefined) {
      if (typeof req.body.note !== 'string' || req.body.note.length > 500) return res.status(400).json({ success: false, message: 'Ghi chú không hợp lệ.' });
      updates.note = req.body.note.trim();
    }
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'Không có trường hợp lệ để cập nhật.' });
    const updatedAmount = updates.amount ?? existing.amount;
    const updatedPaid = updates.paid_amount ?? existing.paid_amount;
    updates.status = updatedPaid >= updatedAmount ? 'completed' : updatedPaid > 0 ? 'partial' : 'pending';
    const debt = await Debt.findOneAndUpdate({ id: req.params.id }, { $set: updates }, { new: true, runValidators: true });
    if (!debt) return res.status(404).json({ success: false, message: 'Không tìm thấy khoản nợ.' });
    res.json({ success: true, debt });
  } catch (error) {
    next(error);
  }
});

router.delete('/debts/:id', async (req, res, next) => {
  try {
    const debt = await Debt.findOneAndDelete({ id: req.params.id });
    if (!debt) return res.status(404).json({ success: false, message: 'Không tìm thấy khoản nợ.' });
    res.json({ success: true, message: 'Đã xóa khoản nợ.' });
  } catch (error) {
    next(error);
  }
});

router.get('/tasks', async (req, res, next) => {
  try {
    const [tasks, profiles, households] = await Promise.all([
      Task.find().sort({ createdAt: -1 }).limit(boundedLimit(req.query.limit)).lean(),
      Profile.find().select('id display_name avatar_url').lean(),
      Household.find().select('id name').lean(),
    ]);
    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
    const householdMap = new Map(households.map((household) => [household.id, household]));
    res.json({
      success: true,
      tasks: tasks.map((task) => {
        const assigned = profileMap.get(task.assigned_to_user_id);
        const creator = profileMap.get(task.user_id);
        const overdue = !task.completed && task.due_date && new Date(task.due_date) < new Date();
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          assignedToName: assigned?.display_name || task.assigned_to || 'Chưa giao',
          assignedToAvatar: assigned?.avatar_url || '',
          createdByName: profileLabel(creator),
          householdName: householdMap.get(task.household_id)?.name || 'Cá nhân',
          dueDate: dateLabel(task.due_date),
          amount: task.amount || 0,
          tag: task.tag || '',
          priority: task.priority ? 'high' : 'medium',
          status: task.completed ? 'completed' : overdue ? 'overdue' : 'pending',
          completedAt: dateLabel(task.completed_at),
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.put('/tasks/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== 'string' || !req.body.title.trim() || req.body.title.trim().length > 200) return res.status(400).json({ success: false, message: 'Tiêu đề công việc phải dài 1-200 ký tự.' });
      updates.title = req.body.title.trim();
    }
    if (req.body.description !== undefined) updates.description = String(req.body.description).slice(0, 2000);
    if (req.body.amount !== undefined) {
      if (!Number.isFinite(req.body.amount) || req.body.amount < 0) return res.status(400).json({ success: false, message: 'Tiền thưởng không hợp lệ.' });
      updates.amount = req.body.amount;
    }
    if (req.body.completed !== undefined) {
      if (typeof req.body.completed !== 'boolean') return res.status(400).json({ success: false, message: 'completed phải là true hoặc false.' });
      updates.completed = req.body.completed;
      updates.completed_at = req.body.completed ? new Date() : null;
    }
    if (req.body.priority !== undefined) {
      if (typeof req.body.priority !== 'boolean') return res.status(400).json({ success: false, message: 'priority phải là true hoặc false.' });
      updates.priority = req.body.priority;
    }
    if (req.body.dueDate !== undefined) {
      const date = req.body.dueDate ? new Date(req.body.dueDate) : null;
      if (date && Number.isNaN(date.getTime())) return res.status(400).json({ success: false, message: 'Ngày hết hạn không hợp lệ.' });
      updates.due_date = date;
    }
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'Không có trường hợp lệ để cập nhật.' });
    const task = await Task.findOneAndUpdate({ id: req.params.id }, { $set: updates }, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy công việc.' });
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.delete('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ id: req.params.id });
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy công việc.' });
    res.json({ success: true, message: 'Đã xóa công việc.' });
  } catch (error) {
    next(error);
  }
});

router.get('/reports', async (req, res, next) => {
  try {
    const now = new Date();
    const ranges = { '30days': 30, quarter: 90, year: 365, all: null };
    const days = ranges[req.query.range] ?? 365;
    const from = days ? new Date(now.getTime() - days * 86400000) : new Date(0);
    const [cashFlow, categories, tasks, users] = await Promise.all([
      Transaction.aggregate([
        { $match: { transaction_date: { $gte: from } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$transaction_date' } }, type: { $first: '$type' }, amount: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'expense', transaction_date: { $gte: from } } },
        { $group: { _id: '$category_id', amount: { $sum: '$amount' } } },
        { $sort: { amount: -1 } },
        { $limit: 8 },
      ]),
      Task.aggregate([{ $group: { _id: '$completed', count: { $sum: 1 }, rewards: { $sum: '$amount' } } }]),
      Profile.aggregate([{ $match: { created_at: { $gte: from } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$created_at' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ]);
    const categoryIds = categories.map((row) => row._id).filter(Boolean);
    const categoryNames = await Category.find({ id: { $in: categoryIds } }).select('id name').lean();
    const categoryMap = new Map(categoryNames.map((category) => [category.id, category.name]));
    const grouped = new Map();
    cashFlow.forEach((row) => {
      const month = grouped.get(row._id) || { month: row._id, income: 0, expense: 0 };
      month[row.type] = row.amount;
      grouped.set(row._id, month);
    });
    const completed = tasks.find((task) => task._id === true) || { count: 0, rewards: 0 };
    const taskTotal = tasks.reduce((sum, row) => sum + row.count, 0);
    const pending = tasks.find((task) => task._id === false)?.count || 0;
    const incomeTotal = Array.from(grouped.values()).reduce((sum, row) => sum + row.income, 0);
    const expenseTotal = Array.from(grouped.values()).reduce((sum, row) => sum + row.expense, 0);
    res.json({
      success: true,
      monthlyCashFlow: Array.from(grouped.values()).map((row) => ({ ...row, net: row.income - row.expense })),
      userGrowth: users.map((row) => ({ month: row._id, users: row.count })),
      categoryExpenses: categories.map((row, index) => ({
        name: categoryMap.get(row._id) || 'Không phân loại',
        value: row.amount,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'][index],
      })),
      taskCompletion: [
        { name: 'Hoàn thành', value: taskTotal ? Math.round((completed.count / taskTotal) * 100) : 0, color: '#10b981' },
        { name: 'Chưa hoàn thành', value: taskTotal ? Math.round((pending / taskTotal) * 100) : 0, color: '#f59e0b' },
      ],
      summary: { income: incomeTotal, expense: expenseTotal, netSavings: incomeTotal - expenseTotal, completedTasks: completed.count, totalTasks: taskTotal, rewards: completed.rewards },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await AdminSetting.findOne({ key: 'system' }).lean();
    res.json({ success: true, settings: settings?.value || {} });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length > 50) {
      return res.status(400).json({ success: false, message: 'Cấu hình không hợp lệ.' });
    }
    const allowedSections = new Set(['general', 'security', 'notifications']);
    if (Object.keys(req.body).some((key) => !allowedSections.has(key))) {
      return res.status(400).json({ success: false, message: 'Có nhóm cấu hình không được hỗ trợ.' });
    }
    const allowedFields = {
      general: new Set(['systemName', 'supportEmail', 'currency', 'timezone', 'language']),
      security: new Set(['twoFactorAuth', 'sessionTimeout', 'maxLoginAttempts', 'ipWhitelist']),
      notifications: new Set(['emailAlerts', 'pushNotification', 'unusualTxAlert']),
    };
    for (const [section, values] of Object.entries(req.body)) {
      if (!values || typeof values !== 'object' || Array.isArray(values)
        || Object.keys(values).some((key) => !allowedFields[section].has(key))) {
        return res.status(400).json({ success: false, message: `Nhóm cấu hình ${section} không hợp lệ.` });
      }
    }
    if (req.body.general) {
      const { systemName, supportEmail, currency, timezone, language } = req.body.general;
      if (systemName !== undefined && (typeof systemName !== 'string' || !systemName.trim() || systemName.length > 100)) {
        return res.status(400).json({ success: false, message: 'Tên hệ thống phải dài 1-100 ký tự.' });
      }
      if (supportEmail !== undefined && (typeof supportEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail))) {
        return res.status(400).json({ success: false, message: 'Email hỗ trợ không hợp lệ.' });
      }
      if (currency !== undefined && (typeof currency !== 'string' || !/^[A-Za-z]{3}$/.test(currency))) {
        return res.status(400).json({ success: false, message: 'Mã tiền tệ phải gồm 3 ký tự.' });
      }
      if ([timezone, language].some((value) => value !== undefined && (typeof value !== 'string' || value.length > 100))) {
        return res.status(400).json({ success: false, message: 'Múi giờ hoặc ngôn ngữ không hợp lệ.' });
      }
    }
    const security = req.body.security;
    if (security) {
      if (security.twoFactorAuth !== undefined && typeof security.twoFactorAuth !== 'boolean') {
        return res.status(400).json({ success: false, message: 'twoFactorAuth phải là true hoặc false.' });
      }
      if (security.twoFactorAuth === true) {
        return res.status(501).json({ success: false, message: 'Chưa thể bật 2FA: hệ thống chưa tích hợp nhà cung cấp TOTP.' });
      }
      const limit = Number(security.maxLoginAttempts);
      if (security.maxLoginAttempts !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 20)) {
        return res.status(400).json({ success: false, message: 'Số lần đăng nhập sai phải từ 1 đến 20.' });
      }
      const timeout = Number(security.sessionTimeout);
      if (security.sessionTimeout !== undefined && (!Number.isInteger(timeout) || timeout < 1 || timeout > 1440)) {
        return res.status(400).json({ success: false, message: 'Thời hạn phiên phải từ 1 đến 1440 phút.' });
      }
      if (security.ipWhitelist !== undefined) {
        const addresses = String(security.ipWhitelist).split(',').map((item) => item.trim()).filter(Boolean);
        const valid = addresses.every((entry) => {
          const [ip, prefix] = entry.split('/');
          const chunks = ip.split('.');
          const validIp = chunks.length === 4 && chunks.every((chunk) => /^\d{1,3}$/.test(chunk) && Number(chunk) <= 255);
          return validIp && (prefix === undefined || (/^\d{1,2}$/.test(prefix) && Number(prefix) <= 32));
        });
        if (!valid) return res.status(400).json({ success: false, message: 'Danh sách IP chỉ nhận IPv4 và CIDR hợp lệ, phân cách bằng dấu phẩy.' });
      }
    }
    const notifications = req.body.notifications;
    if (notifications && Object.values(notifications).some((enabled) => typeof enabled !== 'boolean')) {
      return res.status(400).json({ success: false, message: 'Cấu hình thông báo phải là true hoặc false.' });
    }
    if (notifications && Object.values(notifications).some((enabled) => enabled === true)) {
      return res.status(501).json({ success: false, message: 'Chưa thể bật email/push/webhook: hệ thống chưa cấu hình nhà cung cấp thông báo.' });
    }
    const setting = await AdminSetting.findOneAndUpdate(
      { key: 'system' },
      { $set: { value: req.body, updated_by: req.user.id } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, settings: setting.value });
  } catch (error) {
    next(error);
  }
});

router.get('/notifications', async (req, res, next) => {
  try {
    const now = new Date();
    const [newUsers, overdueDebts, overdueTasks] = await Promise.all([
      Profile.find().sort({ created_at: -1 }).limit(5).select('id display_name email created_at').lean(),
      Debt.find({ status: { $ne: 'completed' }, due_date: { $lt: now } }).sort({ due_date: 1 }).limit(10).lean(),
      Task.find({ completed: false, due_date: { $lt: now } }).sort({ due_date: 1 }).limit(10).lean(),
    ]);
    res.json({
      success: true,
      notifications: [
        ...newUsers.map((user) => ({ id: `user-${user.id}`, type: 'user', title: 'Người dùng mới', description: `${user.display_name} (${user.email})`, createdAt: dateLabel(user.created_at) })),
        ...overdueDebts.map((debt) => ({ id: `debt-${debt.id}`, type: 'debt', title: 'Khoản nợ quá hạn', description: `${debt.person_name} — ${debt.amount}`, createdAt: dateLabel(debt.due_date) })),
        ...overdueTasks.map((task) => ({ id: `task-${task.id}`, type: 'task', title: 'Công việc quá hạn', description: task.title, createdAt: dateLabel(task.due_date) })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim().slice(0, 100);
    if (query.length < 2) return res.json({ success: true, results: [] });
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const [users, households, transactions] = await Promise.all([
      Profile.find({ $or: [{ display_name: regex }, { email: regex }, { phone: regex }] }).limit(5).select('id display_name email').lean(),
      Household.find({ name: regex }).limit(5).select('id name').lean(),
      Transaction.find({ note: regex }).sort({ transaction_date: -1 }).limit(5).select('id note').lean(),
    ]);
    res.json({
      success: true,
      results: [
        ...users.map((user) => ({ id: user.id, label: user.display_name, detail: user.email, path: '/users' })),
        ...households.map((household) => ({ id: household.id, label: household.name, detail: 'Gia đình', path: '/households' })),
        ...transactions.map((transaction) => ({ id: transaction.id, label: transaction.note || 'Giao dịch', detail: 'Giao dịch', path: '/transactions' })),
      ],
    });
  } catch (error) {
    next(error);
  }
});

router.get('/backup', async (req, res, next) => {
  try {
    const [profiles, households, members, invitations, accounts, categories, transactions, transfers, tasks, debts, settings] = await Promise.all([
      Profile.find().select('-password_hash').lean(),
      Household.find().lean(),
      HouseholdMember.find().lean(),
      HouseholdInvitation.find().select('-token_hash').lean(),
      Account.find().lean(),
      Category.find().lean(),
      Transaction.find().lean(),
      TransactionTransfer.find().lean(),
      Task.find().lean(),
      Debt.find().lean(),
      AdminSetting.find().lean(),
    ]);
    const backup = {
      exportedAt: new Date().toISOString(),
      format: 'homeflow-json-backup-v1',
      collections: { profiles, households, household_members: members, household_invitations: invitations, accounts, categories, transactions, transaction_transfers: transfers, tasks, debts, admin_settings: settings },
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="homeflow-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (error) {
    next(error);
  }
});

export default router;
