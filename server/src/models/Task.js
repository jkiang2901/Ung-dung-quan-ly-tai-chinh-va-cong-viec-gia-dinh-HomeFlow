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
    time: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      default: 0,
    },
    assigned_to: {
      type: String,
      default: 'Tôi',
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
