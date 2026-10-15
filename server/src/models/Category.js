import mongoose from 'mongoose';
import crypto from 'crypto';

const categorySchema = new mongoose.Schema(
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
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Loại danh mục (income hoặc expense) là bắt buộc'],
    },
    icon: {
      type: String,
      default: 'tag',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    is_default: {
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

export const Category = mongoose.model('Category', categorySchema, 'categories');
