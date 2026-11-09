import express from 'express';
import { Debt } from '../models/Debt.js';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { requireAuth } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// @route   GET /api/debts
// @desc    Lấy danh sách các khoản công nợ của user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const filter = { user_id: req.user.id };

    if (type && ['lend', 'borrow'].includes(type)) {
      filter.type = type;
    }
    if (status && ['pending', 'partial', 'completed'].includes(status)) {
      filter.status = status;
    }

    const debts = await Debt.find(filter).sort({ created_at: -1 });

    // Lấy thông tin tên ví nếu có wallet_id
    const walletIds = debts.map((d) => d.wallet_id).filter(Boolean);
    const accounts = await Account.find({ id: { $in: walletIds } }).select('id name');
    const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

    const result = debts.map((d) => {
      const json = d.toJSON();
      return {
        ...json,
        remaining_amount: Math.max(0, json.amount - (json.paid_amount || 0)),
        wallet_name: accountMap.get(json.wallet_id) || null,
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

// @route   POST /api/debts
// @desc    Tạo khoản công nợ mới
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const {
      type,
      person_name,
      phone_number,
      amount,
      start_date,
      due_date,
      note,
      wallet_id,
      affect_wallet,
    } = req.body;

    if (!type || !['lend', 'borrow'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Loại công nợ không hợp lệ (lend: cho vay, borrow: đi vay).',
      });
    }

    if (!person_name || !person_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên người liên quan không được để trống.',
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền công nợ phải lớn hơn 0.',
      });
    }

    let parsedStartDate = new Date();
    if (start_date) {
      const d = new Date(start_date);
      if (!isNaN(d.getTime())) parsedStartDate = d;
    }

    let parsedDueDate = null;
    if (due_date) {
      const d = new Date(due_date);
      if (!isNaN(d.getTime())) parsedDueDate = d;
    }

    const newDebt = await Debt.create({
      user_id: req.user.id,
      type,
      person_name: person_name.trim(),
      phone_number: phone_number ? phone_number.trim() : '',
      amount: parsedAmount,
      paid_amount: 0,
      start_date: parsedStartDate,
      due_date: parsedDueDate,
      note: note ? note.trim() : '',
      status: 'pending',
      wallet_id: wallet_id || null,
    });

    // Nếu người dùng chọn ảnh hưởng ví (affect_wallet = true):
    // Cho vay -> trừ tiền ví (expense), Đi vay -> cộng tiền ví (income)
    if (affect_wallet && wallet_id) {
      const account = await Account.findOne({ id: wallet_id });
      if (account) {
        await Transaction.create({
          account_id: wallet_id,
          user_id: req.user.id,
          amount: parsedAmount,
          type: type === 'lend' ? 'expense' : 'income',
          note: type === 'lend'
            ? `Cho ${person_name.trim()} vay tiền: ${note || ''}`.trim()
            : `Vay tiền từ ${person_name.trim()}: ${note || ''}`.trim(),
          transaction_date: parsedStartDate,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Tạo khoản công nợ thành công.',
      data: {
        ...newDebt.toJSON(),
        remaining_amount: parsedAmount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/debts/:id/pay
// @desc    Ghi nhận thanh toán trả nợ / thu nợ
router.post('/:id/pay', requireAuth, async (req, res, next) => {
  try {
    const { amount, note, wallet_id, affect_wallet } = req.body;
    const debt = await Debt.findOne({ id: req.params.id, user_id: req.user.id });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản công nợ.',
      });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền thanh toán phải lớn hơn 0.',
      });
    }

    const remaining = debt.amount - debt.paid_amount;
    if (payAmount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Số tiền thanh toán (${payAmount.toLocaleString('vi-VN')} đ) vượt quá số tiền còn lại (${remaining.toLocaleString('vi-VN')} đ).`,
      });
    }

    const paymentRecord = {
      id: uuidv4(),
      amount: payAmount,
      date: new Date(),
      note: note ? note.trim() : '',
      wallet_id: wallet_id || null,
    };

    debt.payments.push(paymentRecord);
    debt.paid_amount += payAmount;

    if (debt.paid_amount >= debt.amount) {
      debt.status = 'completed';
    } else {
      debt.status = 'partial';
    }

    await debt.save();

    // Nếu chọn ảnh hưởng số dư ví:
    // Thu nợ (lend) -> tiền cộng vào ví (income)
    // Trả nợ (borrow) -> tiền trừ khỏi ví (expense)
    if (affect_wallet && wallet_id) {
      const account = await Account.findOne({ id: wallet_id });
      if (account) {
        await Transaction.create({
          account_id: wallet_id,
          user_id: req.user.id,
          amount: payAmount,
          type: debt.type === 'lend' ? 'income' : 'expense',
          note: debt.type === 'lend'
            ? `Thu nợ từ ${debt.person_name}: ${note || ''}`.trim()
            : `Trả nợ cho ${debt.person_name}: ${note || ''}`.trim(),
          transaction_date: new Date(),
        });
      }
    }

    res.json({
      success: true,
      message: debt.status === 'completed' ? 'Khoản nợ đã được thanh toán toàn bộ!' : 'Ghi nhận thanh toán thành công.',
      data: {
        ...debt.toJSON(),
        remaining_amount: Math.max(0, debt.amount - debt.paid_amount),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/debts/:id
// @desc    Cập nhật thông tin khoản nợ
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { person_name, phone_number, amount, due_date, note } = req.body;
    const debt = await Debt.findOne({ id: req.params.id, user_id: req.user.id });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản công nợ.',
      });
    }

    if (person_name) debt.person_name = person_name.trim();
    if (phone_number !== undefined) debt.phone_number = phone_number.trim();
    if (note !== undefined) debt.note = note.trim();
    if (due_date !== undefined) {
      debt.due_date = due_date ? new Date(due_date) : null;
    }
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (parsedAmount > 0 && parsedAmount >= debt.paid_amount) {
        debt.amount = parsedAmount;
        if (debt.paid_amount >= debt.amount) {
          debt.status = 'completed';
        } else if (debt.paid_amount > 0) {
          debt.status = 'partial';
        } else {
          debt.status = 'pending';
        }
      }
    }

    await debt.save();

    res.json({
      success: true,
      message: 'Cập nhật công nợ thành công.',
      data: {
        ...debt.toJSON(),
        remaining_amount: Math.max(0, debt.amount - debt.paid_amount),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/debts/:id
// @desc    Xóa khoản công nợ
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const debt = await Debt.findOneAndDelete({ id: req.params.id, user_id: req.user.id });
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản công nợ.',
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa khoản công nợ thành công.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

