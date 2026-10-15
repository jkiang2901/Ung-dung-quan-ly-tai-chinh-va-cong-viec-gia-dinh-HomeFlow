# 🏠 HomeFlow — Ứng Dụng Quản Lý Tài Chính & Công Việc Gia Đình

Hệ thống bao gồm:
- **Mobile/Web App**: React Native (Expo) + TypeScript
- **Backend API**: Node.js + Express
- **Database Online**: MongoDB Atlas (`homeflow`)

---

## 🚀 Hướng Dẫn Cho Thành Viên Mới Kéo Code Về

Khi thành viên kéo code về máy lần đầu, chỉ cần làm theo **4 bước đơn giản** sau:

### 1️⃣ Bước 1: Kéo code về máy
```bash
git clone <URL_REPO_CUA_NHOM>
cd HomeFlow
```

---

### 2️⃣ Bước 2: Cài đặt toàn bộ thư viện (Dependencies)
Chạy lệnh sau tại thư mục gốc để tự động cài cho cả App và Server Backend:
```bash
npm run install:all
```
*(Hoặc chạy thủ công: `npm install` ở thư mục gốc và `cd server && npm install`)*

---

### 3️⃣ Bước 3: Cấu hình biến môi trường Database (.env)

1. Vào thư mục `server/`, tạo file `.env` (hoặc copy từ `.env.example`):
   - **Windows PowerShell**: `cp server/.env.example server/.env`
   - **Hoặc tạo tay file**: `server/.env`
2. Mở file [server/.env](file:///d:/HomeFlow/server/.env) và điền mật khẩu Database của nhóm:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://giang6363:<db_password>@cluster0.kotp36b.mongodb.net/homeflow?retryWrites=true&w=majority&compressors=zlib
   JWT_SECRET=homeflow_super_secret_jwt_key_2026
   JWT_EXPIRES_IN=7d
   ```
   *(Thay `<db_password>` bằng mật khẩu MongoDB Atlas thật)*

> ⚠️ **LƯU Ý QUAN TRỌNG VỀ MONGODB ATLAS**:
> Nếu thành viên chạy bị lỗi kết nối `MongooseServerSelectionError` hoặc `IP not whitelisted`, chủ tài khoản MongoDB Atlas cần vào:
> **MongoDB Atlas** ➜ **Network Access** ➜ **Add IP Address** ➜ Chọn **Allow Access from Anywhere (`0.0.0.0/0`)** để tất cả thành viên trong nhóm đều truy cập được mà không bị chặn IP mạng nhà/công ty.

---

### 4️⃣ Bước 4: Khởi động hệ thống để làm việc

Bạn cần mở **2 cửa sổ Terminal**:

#### 💻 Terminal 1 — Chạy Backend API (Port 5000):
```bash
npm run server:dev
```
*(Server chạy tại `http://localhost:5000`)*

#### 📱 Terminal 2 — Chạy App HomeFlow (Giao diện):
```bash
# Chạy trên trình duyệt Web (khuyến nghị khi làm giao diện)
npm run web

# Hoặc khởi động Expo tổng hợp (quét QR bằng điện thoại Expo Go)
npm start
```

---

## 🛠️ Các lệnh hữu ích (Scripts)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run install:all` | Cài đặt dependencies cho cả dự án gốc và server |
| `npm run server:dev` | Chạy Backend với nodemon (tự reload khi sửa code server) |
| `npm run server` | Chạy Backend bản node tiêu chuẩn |
| `npm run web` | Mở ứng dụng trên Web browser |
| `npm start` | Chạy Expo Metro Bundler (Mobile & Web) |
| `npm run lint` | Kiểm tra lỗi cú pháp và code style (oxlint) |

---

## 📖 Tài Liệu Chi Tiết Về API
Xem danh sách đầy đủ các API Đăng ký, Đăng nhập, Ví tiền (Accounts), Thu chi (Transactions), Danh mục (Categories) và Gia đình tại:
👉 [server/README.md](file:///d:/HomeFlow/server/README.md)
