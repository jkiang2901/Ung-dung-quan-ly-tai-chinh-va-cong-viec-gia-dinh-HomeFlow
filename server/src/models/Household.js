import mongoose from 'mongoose';
import crypto from 'crypto';

const householdSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    created_by: {
      type: String,
      required: true,
      ref: 'Profile',
      index: true,
    },
    currency: {
      type: String,
      default: 'VND',
      maxlength: 3,
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

export const Household = mongoose.model('Household', householdSchema, 'households');
