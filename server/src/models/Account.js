import mongoose from 'mongoose';
import crypto from 'crypto';

const accountSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
      index: true,
    },
    owner_user_id: {
      type: String,
      default: null,
      ref: 'Profile',
      index: true,
    },
    household_id: {
      type: String,
      default: null,
      ref: 'Household',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Tên ví là bắt buộc'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['cash', 'bank', 'e_wallet', 'savings', 'other'],
      default: 'cash',
    },
    initial_balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'VND',
      maxlength: 3,
    },
    is_archived: {
      type: Boolean,
      default: false,
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

// Ràng buộc CHECK: Phải có ĐÚNG 1 trong 2: hoặc owner_user_id HOẶC household_id
accountSchema.pre('validate', function (next) {
  const hasOwner = Boolean(this.owner_user_id);
  const hasHousehold = Boolean(this.household_id);

  if ((hasOwner && hasHousehold) || (!hasOwner && !hasHousehold)) {
    return next(
      new Error('Mỗi ví chỉ thuộc một không gian: cá nhân (owner_user_id) hoặc gia đình (household_id), không được để trống cả hai hoặc có cả hai!')
    );
  }
  next();
});

export const Account = mongoose.model('Account', accountSchema, 'accounts');
