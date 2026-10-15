import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  if (uri.includes('<db_password>')) {
    console.warn('\n⚠️  CẢNH BÁO: Bạn chưa thay thế `<db_password>` bằng mật khẩu MongoDB Atlas thật trong file server/.env');
    console.warn('👉 Hãy mở file `server/.env` và sửa MONGODB_URI với mật khẩu Database User của bạn!\n');
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'homeflow',
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Don't exit process in dev to allow app to run while user edits credentials
  }
};
