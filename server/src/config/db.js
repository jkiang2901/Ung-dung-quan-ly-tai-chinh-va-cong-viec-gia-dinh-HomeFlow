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
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    // Luôn ẩn mật khẩu và thông tin xác thực nếu có xuất hiện trong thông điệp lỗi
    const sanitizedMsg = error.message.replace(/mongodb(\+srv)?:\/\/[^@]+@/i, 'mongodb$1://***:***@');
    console.error(`❌ MongoDB connection error: ${sanitizedMsg}`);

    if (error.name === 'MongooseServerSelectionError') {
      console.warn('💡 Gợi ý: Hãy kiểm tra cấu hình "Network Access" (IP Access List) trên MongoDB Atlas (thêm IP 0.0.0.0/0 để cho phép truy cập từ mọi nơi khi phát triển).');
    }
    // Không tắt tiến trình để server vẫn có thể phản hồi trạng thái lỗi phù hợp
    return null;
  }
};
