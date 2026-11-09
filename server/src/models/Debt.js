import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const DebtPaymentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    wallet_id: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const DebtSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['lend', 'borrow'], // lend: cho vay (cần thu), borrow: đi vay (phải trả)
      required: true,
    },
    person_name: {
      type: String,
      required: true,
      trim: true,
    },
    phone_number: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paid_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    due_date: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed'],
      default: 'pending',
      index: true,
    },
    wallet_id: {
      type: String,
      default: null,
    },
    payments: [DebtPaymentSchema],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

DebtSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const Debt = mongoose.model('Debt', DebtSchema);

