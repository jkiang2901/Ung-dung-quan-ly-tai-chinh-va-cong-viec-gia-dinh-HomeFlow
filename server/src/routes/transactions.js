import express from 'express';
import { Transaction } from '../models/Transaction.js';
import { Account } from '../models/Account.js';
import { Category } from '../models/Category.js';
import { TransactionTransfer } from '../models/TransactionTransfer.js';
import { HouseholdMember } from '../models/HouseholdMember.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Kiểm tra quyền truy cập vào ví (account)
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

// Helper: Lấy danh sách ID các ví mà user có quyền truy cập
const getAccessibleAccountIds = async (userId) => {
  const userAccounts = await Account.find({ owner_user_id: userId }).select('id');
  const userAccountIds = userAccounts.map((a) => a.id);

  const memberships = await HouseholdMember.find({ user_id: userId, status: 'active' }).select('household_id');
  const householdIds = memberships.map((m) => m.household_id);

  const householdAccounts = await Account.find({ household_id: { $in: householdIds } }).select('id');
  return [...new Set([...userAccountIds, ...householdAccounts.map((a) => a.id)])];
};

// Helper: Tính số dư động của ví dựa trên giao dịch
const getAccountBalance = async (accountId) => {
  const account = await Account.findOne({ id: accountId });
  if (!account) return 0;

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

  return (account.initial_balance || 0) + incomeTotal - expenseTotal;
};

// =============================================================================
// 1. GET /api/transactions - Xem danh sách giao dịch
// =============================================================================
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { account_id, category_id, household_id, type, start_date, end_date, limit = 50, page = 1 } = req.query;

    const filter = {};

    if (account_id) {
      const { hasAccess } = await userHasAccessToAccount(req.user.id, account_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập vào ví tiền này.',
        });
      }
      filter.account_id = account_id;
    } else if (household_id) {
      const isMember = await HouseholdMember.exists({
        household_id,
        user_id: req.user.id,
        status: 'active',
      });
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập vào gia đình này.',
        });
      }
      const householdAccounts = await Account.find({ household_id }).select('id');
      filter.account_id = { $in: householdAccounts.map((a) => a.id) };
    } else {
      const accessibleAccountIds = await getAccessibleAccountIds(req.user.id);
      filter.account_id = { $in: accessibleAccountIds };
    }

    if (category_id) {
      filter.category_id = category_id;
    }

    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Loại giao dịch phải là 'income' hoặc 'expense'.",
        });
      }
      filter.type = type;
    }

    if (start_date || end_date) {
      filter.transaction_date = {};
      if (start_date) {
        const start = new Date(start_date);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ success: false, message: 'start_date không hợp lệ.' });
        }
        filter.transaction_date.$gte = start;
      }
      if (end_date) {
        const end = new Date(end_date);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ success: false, message: 'end_date không hợp lệ.' });
        }
        if (!end_date.includes('T')) {
          end.setHours(23, 59, 59, 999);
        }
        filter.transaction_date.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ transaction_date: -1, created_at: -1 })
      .skip(skip)
      .limit(limitNum);

    // Gắn thêm thông tin chi tiết ví và danh mục
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
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// 2. GET /api/transactions/statistics - Thống kê thu chi
// Lưu ý: Đặt route này TRƯỚC /:id để Express không nhầm "statistics" là tham số ID
// =============================================================================
router.get('/statistics', requireAuth, async (req, res, next) => {
  try {
    const { account_id, household_id, start_date, end_date, group_by = 'month' } = req.query;

    let targetAccountIds = [];

    if (account_id) {
      const { hasAccess } = await userHasAccessToAccount(req.user.id, account_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập vào ví này.',
        });
      }
      targetAccountIds = [account_id];
    } else if (household_id) {
      const isMember = await HouseholdMember.exists({
        household_id,
        user_id: req.user.id,
        status: 'active',
      });
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập vào gia đình này.',
        });
      }
      const accs = await Account.find({ household_id }).select('id');
      targetAccountIds = accs.map((a) => a.id);
    } else {
      targetAccountIds = await getAccessibleAccountIds(req.user.id);
    }

    // Tiêu chí lọc MongoDB: Chỉ bao gồm ví người dùng có quyền và KHÔNG tính chuyển tiền nội bộ
    const matchFilter = {
      account_id: { $in: targetAccountIds },
      is_transfer: { $ne: true },
    };

    if (start_date || end_date) {
      matchFilter.transaction_date = {};
      if (start_date) {
        const start = new Date(start_date);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ success: false, message: 'start_date không hợp lệ.' });
        }
        matchFilter.transaction_date.$gte = start;
      }
      if (end_date) {
        const end = new Date(end_date);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ success: false, message: 'end_date không hợp lệ.' });
        }
        if (!end_date.includes('T')) {
          end.setHours(23, 59, 59, 999);
        }
        matchFilter.transaction_date.$lte = end;
      }
    }

    // 1. Thống kê tổng thu, tổng chi và số dư ròng
    const summaryAgg = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let total_income = 0;
    let total_expense = 0;
    let total_count = 0;

    for (const item of summaryAgg) {
      if (item._id === 'income') total_income = item.total;
      if (item._id === 'expense') total_expense = item.total;
      total_count += item.count;
    }

    const net_income = total_income - total_expense;

    // 2. Thống kê theo ngày / tuần / tháng
    let dateFormat = '%Y-%m';
    if (group_by === 'day') dateFormat = '%Y-%m-%d';
    else if (group_by === 'week') dateFormat = '%Y-W%U';
    else if (group_by === 'month') dateFormat = '%Y-%m';

    const periodAgg = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: dateFormat, date: '$transaction_date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.period': 1 } },
    ]);

    const periodMap = {};
    for (const item of periodAgg) {
      const periodKey = item._id.period;
      if (!periodMap[periodKey]) {
        periodMap[periodKey] = { period: periodKey, income: 0, expense: 0, net: 0, count: 0 };
      }
      if (item._id.type === 'income') {
        periodMap[periodKey].income += item.total;
      } else if (item._id.type === 'expense') {
        periodMap[periodKey].expense += item.total;
      }
      periodMap[periodKey].count += item.count;
      periodMap[periodKey].net = periodMap[periodKey].income - periodMap[periodKey].expense;
    }
    const breakdown = Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));

    // 3. Thống kê chi tiêu theo danh mục (expense)
    const categoryAgg = await Transaction.aggregate([
      { $match: { ...matchFilter, type: 'expense' } },
      {
        $group: {
          _id: '$category_id',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const by_category = await Promise.all(
      categoryAgg.map(async (catItem) => {
        let catName = 'Chưa phân loại';
        let catIcon = 'tag';
        let catColor = '#94a3b8';

        if (catItem._id) {
          const category = await Category.findOne({ id: catItem._id });
          if (category) {
            catName = category.name;
            catIcon = category.icon;
            catColor = category.color;
          }
        }

        const percentage = total_expense > 0 ? Number(((catItem.total / total_expense) * 100).toFixed(2)) : 0;

        return {
          category_id: catItem._id || null,
          category_name: catName,
          category_icon: catIcon,
          category_color: catColor,
          total: catItem.total,
          count: catItem.count,
          percentage,
        };
      })
    );

    // 4. Thống kê thu nhập theo danh mục (income)
    const incomeCategoryAgg = await Transaction.aggregate([
      { $match: { ...matchFilter, type: 'income' } },
      {
        $group: {
          _id: '$category_id',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const by_income_category = await Promise.all(
      incomeCategoryAgg.map(async (catItem) => {
        let catName = 'Thu nhập khác';
        let catIcon = 'trending-up';
        let catColor = '#10b981';

        if (catItem._id) {
          const category = await Category.findOne({ id: catItem._id });
          if (category) {
            catName = category.name;
            catIcon = category.icon;
            catColor = category.color;
          }
        }

        const percentage = total_income > 0 ? Number(((catItem.total / total_income) * 100).toFixed(2)) : 0;

        return {
          category_id: catItem._id || null,
          category_name: catName,
          category_icon: catIcon,
          category_color: catColor,
          total: catItem.total,
          count: catItem.count,
          percentage,
        };
      })
    );

    res.json({
      success: true,
      data: {
        filter: {
          account_id: account_id || null,
          household_id: household_id || null,
          start_date: start_date || null,
          end_date: end_date || null,
          group_by,
        },
        summary: {
          total_income,
          total_expense,
          net_income,
          transaction_count: total_count,
        },
        breakdown,
        by_category,
        by_income_category,
      },
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// 3. GET /api/transactions/:id - Xem chi tiết 1 giao dịch
// =============================================================================
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

// =============================================================================
// 4. POST /api/transactions - Thêm giao dịch thu chi mới
// =============================================================================
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { account_id, category_id, category: category_name_field, category_name, amount, type, note, transaction_date } = req.body;

    if (!account_id || amount === undefined || amount === null || !type) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: account_id, amount và type (income hoặc expense).',
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền giao dịch (amount) phải là số dương lớn hơn 0.',
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

    let finalCategoryId = null;
    const catInput = category_id || category_name || category_name_field;
    if (catInput) {
      let category = await Category.findOne({ id: catInput });
      if (!category) {
        category = await Category.findOne({ name: catInput });
      }
      if (!category) {
        // Tạo mới danh mục nếu chưa có
        category = await Category.create({
          name: catInput,
          type: type,
          owner_user_id: req.user.id,
          household_id: account.household_id || null,
          icon: type === 'income' ? 'trending-up' : 'shopping-bag',
          color: type === 'income' ? '#10b981' : '#f59e0b',
        });
      }
      finalCategoryId = category ? category.id : null;
    }

    let parsedDate = new Date();
    if (transaction_date) {
      parsedDate = new Date(transaction_date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Ngày giao dịch (transaction_date) không hợp lệ.',
        });
      }
    }

    const newTransaction = await Transaction.create({
      account_id,
      category_id: finalCategoryId,
      user_id: req.user.id,
      household_id: account.household_id || null,
      amount: parsedAmount,
      type,
      note: typeof note === 'string' ? note.trim() : '',
      transaction_date: parsedDate,
      is_transfer: false,
    });

    const currentBalance = await getAccountBalance(account.id);

    res.status(201).json({
      success: true,
      message: 'Tạo giao dịch thành công.',
      data: newTransaction,
      balance: currentBalance,
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// 5. PUT /api/transactions/:id - Cập nhật giao dịch
// =============================================================================
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

    if (category_id !== undefined) {
      if (category_id) {
        const category = await Category.findOne({ id: category_id });
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Danh mục (category_id) không tồn tại.',
          });
        }
      }
      transaction.category_id = category_id || null;
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Số tiền giao dịch phải lớn hơn 0.',
        });
      }
      transaction.amount = parsedAmount;
    }

    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Loại giao dịch phải là 'income' hoặc 'expense'.",
        });
      }
      transaction.type = type;
    }

    if (note !== undefined) {
      transaction.note = typeof note === 'string' ? note.trim() : '';
    }

    if (transaction_date !== undefined) {
      const parsedDate = new Date(transaction_date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Ngày giao dịch không hợp lệ.',
        });
      }
      transaction.transaction_date = parsedDate;
    }

    await transaction.save();

    const currentBalance = await getAccountBalance(transaction.account_id);

    res.json({
      success: true,
      message: 'Cập nhật giao dịch thành công.',
      data: transaction,
      balance: currentBalance,
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// 6. DELETE /api/transactions/:id - Xóa giao dịch
// =============================================================================
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

    const accountId = transaction.account_id;
    let otherAccountId = null;
    let otherBalance = null;

    if (transaction.transfer_id) {
      const otherTx = await Transaction.findOne({
        transfer_id: transaction.transfer_id,
        id: { $ne: transaction.id },
      });
      if (otherTx) {
        otherAccountId = otherTx.account_id;
      }
      await Transaction.deleteMany({ transfer_id: transaction.transfer_id });
      await TransactionTransfer.deleteOne({ id: transaction.transfer_id });
      if (otherAccountId) {
        otherBalance = await getAccountBalance(otherAccountId);
      }
    } else {
      await Transaction.deleteOne({ id: transaction.id });
    }

    // Cập nhật lại số dư ví thông qua cách tính số dư từ dữ liệu giao dịch
    const updatedBalance = await getAccountBalance(accountId);

    res.json({
      success: true,
      message: 'Xóa giao dịch thành công.',
      balance: updatedBalance,
      other_account_id: otherAccountId,
      other_balance: otherBalance,
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// 7. POST /api/transactions/transfer - Chuyển tiền giữa 2 ví
// =============================================================================
router.post('/transfer', requireAuth, async (req, res, next) => {
  try {
    const { from_account_id, to_account_id, amount, fee = 0, note, transfer_date } = req.body;

    if (!from_account_id || !to_account_id || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin chuyển tiền: from_account_id, to_account_id, amount.',
      });
    }

    const parsedAmount = Number(amount);
    const parsedFee = Number(fee) || 0;

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền chuyển phải là số dương lớn hơn 0.',
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

    let transferDate = new Date();
    if (transfer_date) {
      transferDate = new Date(transfer_date);
      if (isNaN(transferDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Ngày chuyển tiền không hợp lệ.',
        });
      }
    }

    // 1. Tạo bản ghi bảng transaction_transfers
    const transferRecord = await TransactionTransfer.create({
      from_account_id,
      to_account_id,
      amount: parsedAmount,
      fee: parsedFee,
      user_id: req.user.id,
      note: note ? note.trim() : '',
      transfer_date: transferDate,
    });

    // 2. Tạo giao dịch trừ tiền ở ví nguồn (được đánh dấu is_transfer: true để tách khỏi báo cáo thu chi thông thường)
    await Transaction.create({
      account_id: from_account_id,
      user_id: req.user.id,
      amount: parsedAmount + parsedFee,
      type: 'expense',
      note: `Chuyển đến ví ${toAccess.account.name}: ${note || ''}`.trim(),
      transaction_date: transferDate,
      is_transfer: true,
      transfer_id: transferRecord.id,
    });

    // 3. Tạo giao dịch cộng tiền ở ví đích
    await Transaction.create({
      account_id: to_account_id,
      user_id: req.user.id,
      amount: parsedAmount,
      type: 'income',
      note: `Nhận từ ví ${fromAccess.account.name}: ${note || ''}`.trim(),
      transaction_date: transferDate,
      is_transfer: true,
      transfer_id: transferRecord.id,
    });

    // Tính toán số dư mới của cả 2 ví
    const [fromBalance, toBalance] = await Promise.all([
      getAccountBalance(from_account_id),
      getAccountBalance(to_account_id),
    ]);

    res.status(201).json({
      success: true,
      message: 'Chuyển tiền giữa 2 ví thành công.',
      data: transferRecord,
      balances: {
        from_account_id,
        from_balance: fromBalance,
        to_account_id,
        to_balance: toBalance,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
