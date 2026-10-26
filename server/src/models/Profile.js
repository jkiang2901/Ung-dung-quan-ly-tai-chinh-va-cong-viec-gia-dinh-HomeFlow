import mongoose from 'mongoose';
import crypto from 'crypto';

const profileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: true,
      select: false, // Don't return password_hash by default
    },
    display_name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh',
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
        delete ret.password_hash;
        return ret;
      },
    },
  }
);

export const Profile = mongoose.model('Profile', profileSchema, 'profiles');
