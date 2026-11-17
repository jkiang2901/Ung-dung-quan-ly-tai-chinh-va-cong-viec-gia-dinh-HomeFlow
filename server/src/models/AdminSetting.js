import mongoose from 'mongoose';

const adminSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    updated_by: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const AdminSetting = mongoose.model('AdminSetting', adminSettingSchema, 'admin_settings');
