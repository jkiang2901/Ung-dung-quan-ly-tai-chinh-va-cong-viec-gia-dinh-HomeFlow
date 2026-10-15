import mongoose from 'mongoose';

const householdMemberSchema = new mongoose.Schema(
  {
    household_id: {
      type: String,
      required: true,
      ref: 'Household',
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      ref: 'Profile',
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['active', 'left', 'removed'],
      default: 'active',
    },
    joined_at: {
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

// Compound primary key / unique index to avoid duplicate membership
householdMemberSchema.index({ household_id: 1, user_id: 1 }, { unique: true });

export const HouseholdMember = mongoose.model('HouseholdMember', householdMemberSchema, 'household_members');
