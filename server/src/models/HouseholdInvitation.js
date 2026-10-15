import mongoose from 'mongoose';
import crypto from 'crypto';

const householdInvitationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
      index: true,
    },
    household_id: {
      type: String,
      required: true,
      ref: 'Household',
      index: true,
    },
    invited_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    invited_by: {
      type: String,
      required: true,
      ref: 'Profile',
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    token_hash: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    accepted_at: {
      type: Date,
      default: null,
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
        delete ret.token_hash;
        return ret;
      },
    },
  }
);

export const HouseholdInvitation = mongoose.model('HouseholdInvitation', householdInvitationSchema, 'household_invitations');
