import express from 'express';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { HouseholdMember } from '../models/HouseholdMember.js';
import { Household } from '../models/Household.js';
import { Profile } from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Calculate dynamic balance of an account
const getAccountBalance = async (accountId, initialBalance, householdId = null) => {
  // Tìm tất cả transactions khớp với account_id
  const matchConditions = [{ account_id: accountId }];

  // Nếu là ví gia đình có householdId, tính cả các transactions đóng góp vào household này mà có thể gắn theo household_id
  if (householdId) {
    matchConditions.push({ household_id: householdId, account_id: accountId });
  }

  const transactions = await Transaction.aggregate([
    { $match: { $or: matchConditions } },
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

  return (Number(initialBalance) || 0) + incomeTotal - expenseTotal;
};

// @route   GET /api/accounts
// @desc    Lấy danh sách các ví tiền (cá nhân hoặc theo gia đình)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { household_id, include_archived } = req.query;

    // 1. Lấy danh sách household mà user tham gia
    let userMemberships = await HouseholdMember.find({
      user_id: req.user.id,
      status: 'active',
    });

    // Nếu user chưa tham gia household nào, tự động tạo một household mặc định cho user
    if (userMemberships.length === 0) {
      const userProfile = await Profile.findOne({ id: req.user.id });
      const displayName = userProfile?.display_name || 'Tôi';
      const defaultHh = await Household.create({
        name: `Gia đình của ${displayName}`,
        created_by: req.user.id,
        currency: 'VND',
      });
      const member = await HouseholdMember.create({
        household_id: defaultHh.id,
        user_id: req.user.id,
        role: 'owner',
        status: 'active',
      });
      userMemberships = [member];
    }

    const allowedHouseholdIds = userMemberships.map((m) => m.household_id);

    // 2. Đảm bảo và Hợp nhất chỉ có DUY NHẤT 1 ví "Quỹ gia đình chung" trong bảng accounts
    for (const hhId of allowedHouseholdIds) {
      const fundAccounts = await Account.find({
        $or: [
          { household_id: hhId },
          { name: /quỹ/i },
          { name: /quy/i },
          { owner_user_id: req.user.id, name: /quỹ gia đình chung/i },
        ],
      }).sort({ created_at: 1 });

      if (fundAccounts.length > 1) {
        // Giữ lại 1 ví chính thức
        const mainFund = fundAccounts.find((a) => a.household_id === hhId) || fundAccounts[0];
        mainFund.household_id = hhId;
        mainFund.owner_user_id = null;
        mainFund.name = 'Quỹ gia đình chung';
        mainFund.type = 'bank';
        await mainFund.save();

        // Chuyển toàn bộ giao dịch từ các ví trùng lặp về ví chính, rồi xóa các ví thừa
        for (const dup of fundAccounts) {
          if (dup.id !== mainFund.id) {
            await Transaction.updateMany(
              { account_id: dup.id },
              { $set: { account_id: mainFund.id, household_id: hhId } }
            );
            await Account.deleteOne({ id: dup.id });
          }
        }
      } else if (fundAccounts.length === 1) {
        const mainFund = fundAccounts[0];
        let needSave = false;
        if (mainFund.household_id !== hhId) {
          mainFund.household_id = hhId;
          needSave = true;
        }
        if (mainFund.owner_user_id) {
          mainFund.owner_user_id = null;
          needSave = true;
        }
        if (mainFund.name !== 'Quỹ gia đình chung') {
          mainFund.name = 'Quỹ gia đình chung';
          needSave = true;
        }
        if (needSave) {
          await mainFund.save();
        }
      } else {
        await Account.create({
          name: 'Quỹ gia đình chung',
          type: 'bank',
          initial_balance: 0,
          currency: 'VND',
          household_id: hhId,
          owner_user_id: null,
        });
      }
    }

    // 3. Đảm bảo user có ít nhất 1 ví cá nhân trong bảng accounts
    const existingPersonal = await Account.findOne({ owner_user_id: req.user.id });
    if (!existingPersonal) {
      await Account.create({
        name: 'Ví tiền mặt',
        type: 'cash',
        initial_balance: 0,
        currency: 'VND',
        owner_user_id: req.user.id,
        household_id: null,
      });
    }

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
      // Mặc định lấy ví cá nhân của user hoặc ví gia đình mà user tham gia, hoặc ví quỹ gia đình chung
      filter.$or = [
        { owner_user_id: req.user.id },
        { household_id: { $in: allowedHouseholdIds } },
        { name: /quỹ/i },
        { name: /quy/i },
      ];
    }

    let accounts = await Account.find(filter).sort({ created_at: -1 });

    // Đảm bảo luôn có ít nhất 1 ví Quỹ gia đình chung trong danh sách
    const hasFundAccount = accounts.some(
      (a) => a.household_id || (a.name && (a.name.toLowerCase().includes('quỹ') || a.name.toLowerCase().includes('quy')))
    );

    if (!hasFundAccount && allowedHouseholdIds.length > 0) {
      const primaryHhId = allowedHouseholdIds[0];
      const newFund = await Account.create({
        name: 'Quỹ gia đình chung',
        type: 'bank',
        initial_balance: 0,
        currency: 'VND',
        household_id: primaryHhId,
        owner_user_id: null,
      });
      accounts = [newFund, ...accounts];
    }

    // Gắn thêm số dư hiện tại (balance) tính từ initial_balance và transactions
    const accountsWithBalance = await Promise.all(
      accounts.map(async (acc) => {
        const currentBalance = await getAccountBalance(acc.id, acc.initial_balance, acc.household_id);
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
