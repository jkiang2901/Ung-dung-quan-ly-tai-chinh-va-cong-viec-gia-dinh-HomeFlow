import express from 'express';
import { Transaction } from '../models/Transaction.js';
import { Account } from '../models/Account.js';
import { Category } from '../models/Category.js';
import { TransactionTransfer } from '../models/TransactionTransfer.js';
import { HouseholdMember } from '../models/HouseholdMember.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Check if user has access to account
const userHasAccessToAccount = async (userId, accountId) => {
  const account = await Account.findOne({ id: accountId });
  if (!account) return { hasAccess: false, account: null };

  if (account.owner_user_id === userId) {
    return { hasAccess: true, account };
  }

  if (account.household_id) {
    const isMember = await HouseholdMember.exists({
      household_id: account.household_id,
      user_id: userId,
      status: 'active',
    });
    if (isMember) return { hasAccess: true, account };
  }

  return { hasAccess: false, account };
};

// @route   GET /api/transactions
// @desc    Lấy danh sách giao dịch thu/chi với bộ lọc
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { account_id, category_id, household_id, type, start_date, end_date, limit = 50, page = 1 } = req.query;

    const filter = {};

    if (account_id) {
      filter.account_id = account_id;
    }

    if (category_id) {
      filter.category_id = category_id;
    }

    if (type) {
      filter.type = type;
    }

    if (household_id) {
      filter.household_id = household_id;
    } else if (!account_id) {
      // Nếu không lọc account cụ thể, lấy các giao dịch của user hoặc các ví user có quyền
      const userAccounts = await Account.find({ owner_user_id: req.user.id }).select('id');
      const userAccountIds = userAccounts.map((a) => a.id);

      const memberships = await HouseholdMember.find({ user_id: req.user.id, status: 'active' }).select('household_id');
      const householdIds = memberships.map((m) => m.household_id);

      const householdAccounts = await Account.find({ household_id: { $in: householdIds } }).select('id');
      const allAccessibleAccountIds = [...userAccountIds, ...householdAccounts.map((a) => a.id)];

      filter.account_id = { $in: allAccessibleAccountIds };
    }

    if (start_date || end_date) {
      filter.transaction_date = {};
      if (start_date) filter.transaction_date.$gte = new Date(start_date);
      if (end_date) filter.transaction_date.$lte = new Date(end_date);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ transaction_date: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Bổ sung thông tin account và category để frontend hiển thị đẹp
    const enriched = await Promise.all(
      transactions.map(async (t) => {
        const [acc, cat] = await Promise.all([
          Account.findOne({ id: t.account_id }).select('name type currency'),
          t.category_id ? Category.findOne({ id: t.category_id }).select('name icon color') : null,
        ]);

        return {
          ...t.toJSON(),
          account_name: acc?.name || null,
          category_name: cat?.name || null,
          category_icon: cat?.icon || null,
          category_color: cat?.color || null,
        };
      })
    );

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions/:id
// @desc    Lấy chi tiết 1 giao dịch
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ id: req.params.id });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch.',
      });
    }

    const { hasAccess } = await userHasAccessToAccount(req.user.id, transaction.account_id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem giao dịch này.',
      });
    }

    const [acc, cat] = await Promise.all([
      Account.findOne({ id: transaction.account_id }),
      transaction.category_id ? Category.findOne({ id: transaction.category_id }) : null,
    ]);

    res.json({
      success: true,
      data: {
        ...transaction.toJSON(),
        account: acc,
        category: cat,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/transactions
// @desc    Tạo giao dịch thu / chi mới
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { account_id, category_id, amount, type, note, transaction_date } = req.body;

    if (!account_id || !amount || !type) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ account_id, amount và type (income hoặc expense).',
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Loại giao dịch phải là 'income' hoặc 'expense'.",
      });
    }

    const { hasAccess, account } = await userHasAccessToAccount(req.user.id, account_id);
    if (!hasAccess || !account) {
      return res.status(403).json({
        success: false,
        message: 'Ví không tồn tại hoặc bạn không có quyền ghi giao dịch vào ví này.',
      });
    }

    const newTransaction = await Transaction.create({
      account_id,
      category_id: category_id || null,
      user_id: req.user.id,
      household_id: account.household_id || null,
      amount: Number(amount),
      type,
      note: note || '',
      transaction_date: transaction_date ? new Date(transaction_date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Tạo giao dịch thành công.',
      data: newTransaction,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/transactions/:id
// @desc    Cập nhật giao dịch
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ id: req.params.id });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch cần sửa.',
      });
    }

    const { hasAccess } = await userHasAccessToAccount(req.user.id, transaction.account_id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa giao dịch này.',
      });
    }

    const { account_id, category_id, amount, type, note, transaction_date } = req.body;

    if (account_id && account_id !== transaction.account_id) {
      const accessNewAcc = await userHasAccessToAccount(req.user.id, account_id);
      if (!accessNewAcc.hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chuyển sang ví đích này.',
        });
      }
      transaction.account_id = account_id;
      transaction.household_id = accessNewAcc.account.household_id || null;
    }

    if (category_id !== undefined) transaction.category_id = category_id;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type !== undefined) transaction.type = type;
    if (note !== undefined) transaction.note = note;
    if (transaction_date !== undefined) transaction.transaction_date = new Date(transaction_date);

    await transaction.save();

    res.json({
      success: true,
      message: 'Cập nhật giao dịch thành công.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Xóa giao dịch
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ id: req.params.id });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch.',
      });
    }

    const { hasAccess } = await userHasAccessToAccount(req.user.id, transaction.account_id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa giao dịch này.',
      });
    }

    await Transaction.deleteOne({ id: transaction.id });

    res.json({
      success: true,
      message: 'Xóa giao dịch thành công.',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/transactions/transfer
// @desc    Chuyển tiền giữa 2 ví (tạo 1 record chuyển tiền + 2 transactions thu/chi)
router.post('/transfer', requireAuth, async (req, res, next) => {
  try {
    const { from_account_id, to_account_id, amount, fee = 0, note, transfer_date } = req.body;

    if (!from_account_id || !to_account_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin chuyển tiền: from_account_id, to_account_id, amount.',
      });
    }

    if (from_account_id === to_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Ví nguồn và ví đích không thể giống nhau.',
      });
    }

    const [fromAccess, toAccess] = await Promise.all([
      userHasAccessToAccount(req.user.id, from_account_id),
      userHasAccessToAccount(req.user.id, to_account_id),
    ]);

    if (!fromAccess.hasAccess || !toAccess.hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập một trong hai ví tiền này.',
      });
    }

    const transferDate = transfer_date ? new Date(transfer_date) : new Date();

    // 1. Tạo bản ghi bảng transaction_transfers
    const transferRecord = await TransactionTransfer.create({
      from_account_id,
      to_account_id,
      amount: Number(amount),
      fee: Number(fee),
      user_id: req.user.id,
      note: note || '',
      transfer_date: transferDate,
    });

    // 2. Tạo giao dịch trừ tiền ở ví nguồn
    await Transaction.create({
      account_id: from_account_id,
      user_id: req.user.id,
      amount: Number(amount) + Number(fee),
      type: 'expense',
      note: `Chuyển đến ví ${toAccess.account.name}: ${note || ''}`,
      transaction_date: transferDate,
    });

    // 3. Tạo giao dịch cộng tiền ở ví đích
    await Transaction.create({
      account_id: to_account_id,
      user_id: req.user.id,
      amount: Number(amount),
      type: 'income',
      note: `Nhận từ ví ${fromAccess.account.name}: ${note || ''}`,
      transaction_date: transferDate,
    });

    res.status(201).json({
      success: true,
      message: 'Chuyển tiền giữa 2 ví thành công.',
      data: transferRecord,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
