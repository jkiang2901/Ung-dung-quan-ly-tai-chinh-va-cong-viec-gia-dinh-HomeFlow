import mongoose from 'mongoose';
import crypto from 'crypto';

const transactionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
      index: true,
    },
    account_id: {
      type: String,
      required: [true, 'account_id là bắt buộc'],
      ref: 'Account',
      index: true,
    },
    category_id: {
      type: String,
      default: null,
      ref: 'Category',
      index: true,
    },
    user_id: {
      type: String,
      required: [true, 'user_id là bắt buộc'],
      ref: 'Profile',
      index: true,
    },
    household_id: {
      type: String,
      default: null,
      ref: 'Household',
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'amount (số tiền) là bắt buộc'],
      min: [0, 'Số tiền phải lớn hơn hoặc bằng 0'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Loại giao dịch (income hoặc expense) là bắt buộc'],
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    transaction_date: {
      type: Date,
      default: Date.now,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const Transaction = mongoose.model('Transaction', transactionSchema, 'transactions');
