import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TaskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    time: {
      type: String,
      default: '',
    },
    due_date: {
      type: Date,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    assigned_to: {
      type: String,
      default: 'Tôi',
    },
    // user_id của người được giao (dùng để filter và resolve profile)
    assigned_to_user_id: {
      type: String,
      default: null,
      index: true,
    },
    avatar_url: {
      type: String,
      default: '',
    },
    tag: {
      type: String,
      default: 'Gia đình',
    },
    priority: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completed_at: {
      type: Date,
      default: null,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    household_id: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model('Task', TaskSchema);

