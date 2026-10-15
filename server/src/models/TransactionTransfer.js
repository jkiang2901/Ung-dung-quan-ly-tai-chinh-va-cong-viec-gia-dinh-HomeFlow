import mongoose from 'mongoose';
import crypto from 'crypto';

const transactionTransferSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
      index: true,
    },
    from_account_id: {
      type: String,
      required: true,
      ref: 'Account',
      index: true,
    },
    to_account_id: {
      type: String,
      required: true,
      ref: 'Account',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Số tiền chuyển phải lớn hơn 0'],
    },
    fee: {
      type: Number,
      default: 0,
    },
    user_id: {
      type: String,
      required: true,
      ref: 'Profile',
      index: true,
    },
    note: {
      type: String,
      default: '',
    },
    transfer_date: {
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

export const TransactionTransfer = mongoose.model('TransactionTransfer', transactionTransferSchema, 'transaction_transfers');
