import express from 'express';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { HouseholdMember } from '../models/HouseholdMember.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Calculate dynamic balance of an account
const getAccountBalance = async (accountId, initialBalance) => {
  const transactions = await Transaction.aggregate([
    { $match: { account_id: accountId } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let incomeTotal = 0;
  let expenseTotal = 0;

  for (const item of transactions) {
    if (item._id === 'income') incomeTotal = item.total;
    if (item._id === 'expense') expenseTotal = item.total;
  }

  return (initialBalance || 0) + incomeTotal - expenseTotal;
};

// @route   GET /api/accounts
// @desc    Lấy danh sách các ví tiền (cá nhân hoặc theo gia đình)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { household_id, include_archived } = req.query;

    // Lấy danh sách household mà user tham gia
    const userMemberships = await HouseholdMember.find({
      user_id: req.user.id,
      status: 'active',
    });
    const allowedHouseholdIds = userMemberships.map((m) => m.household_id);

    const filter = {
      is_archived: include_archived === 'true' ? { $in: [true, false] } : false,
    };

    if (household_id) {
      if (!allowedHouseholdIds.includes(household_id)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập ví của gia đình này.',
        });
      }
      filter.household_id = household_id;
    } else {
      // Mặc định lấy ví cá nhân của user hoặc ví gia đình mà user tham gia
      filter.$or = [
        { owner_user_id: req.user.id },
        { household_id: { $in: allowedHouseholdIds } },
      ];
    }

    const accounts = await Account.find(filter).sort({ created_at: -1 });

    // Gắn thêm số dư hiện tại (balance) tính từ initial_balance và transactions
    const accountsWithBalance = await Promise.all(
      accounts.map(async (acc) => {
        const currentBalance = await getAccountBalance(acc.id, acc.initial_balance);
        return {
          ...acc.toJSON(),
          balance: currentBalance,
        };
      })
    );

    res.json({
      success: true,
      data: accountsWithBalance,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/accounts/:id
// @desc    Lấy chi tiết một ví tiền
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const account = await Account.findOne({ id: req.params.id });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ví tiền.',
      });
    }

    const balance = await getAccountBalance(account.id, account.initial_balance);
    const recentTransactions = await Transaction.find({ account_id: account.id })
      .sort({ transaction_date: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        ...account.toJSON(),
        balance,
        recent_transactions: recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/accounts
// @desc    Tạo ví tiền mới (Cá nhân hoặc Gia đình)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, type, initial_balance, currency, household_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên ví không được để trống.',
      });
    }

    let owner_user_id = null;
    let targetHouseholdId = null;

    if (household_id) {
      // Kiểm tra user có trong gia đình này không
      const member = await HouseholdMember.findOne({
        household_id,
        user_id: req.user.id,
        status: 'active',
      });
      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không phải là thành viên của gia đình này.',
        });
      }
      targetHouseholdId = household_id;
    } else {
      owner_user_id = req.user.id;
    }

    const newAccount = await Account.create({
      name,
      type: type || 'cash',
      initial_balance: Number(initial_balance) || 0,
      currency: currency || 'VND',
      owner_user_id,
      household_id: targetHouseholdId,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo ví tiền thành công.',
      data: {
        ...newAccount.toJSON(),
        balance: newAccount.initial_balance,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/accounts/:id
// @desc    Cập nhật thông tin ví tiền
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { name, type, initial_balance, currency, is_archived } = req.body;

    const account = await Account.findOne({ id: req.params.id });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ví tiền cần sửa.',
      });
    }

    // Kiểm tra quyền: Chủ ví cá nhân hoặc thành viên gia đình
    if (account.owner_user_id && account.owner_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa ví cá nhân của người khác.',
      });
    }

    if (name !== undefined) account.name = name;
    if (type !== undefined) account.type = type;
    if (initial_balance !== undefined) account.initial_balance = Number(initial_balance);
    if (currency !== undefined) account.currency = currency;
    if (is_archived !== undefined) account.is_archived = Boolean(is_archived);

    await account.save();

    const currentBalance = await getAccountBalance(account.id, account.initial_balance);

    res.json({
      success: true,
      message: 'Cập nhật ví tiền thành công.',
      data: {
        ...account.toJSON(),
        balance: currentBalance,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/accounts/:id
// @desc    Xóa ví tiền hoặc chuyển vào kho lưu trữ (Archive)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const account = await Account.findOne({ id: req.params.id });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ví tiền.',
      });
    }

    if (account.owner_user_id && account.owner_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thao tác trên ví này.',
      });
    }

    // Nếu ví đã có giao dịch, chuyển sang lưu trữ (is_archived = true) để bảo toàn dữ liệu
    const hasTransactions = await Transaction.exists({ account_id: account.id });
    if (hasTransactions) {
      account.is_archived = true;
      await account.save();
      return res.json({
        success: true,
        message: 'Ví này đã có lịch sử giao dịch nên đã được chuyển sang trạng thái Lưu trữ (Archived).',
        data: account,
      });
    }

    // Nếu chưa có giao dịch, xóa hẳn
    await Account.deleteOne({ id: account.id });

    res.json({
      success: true,
      message: 'Đã xóa ví tiền thành công.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
