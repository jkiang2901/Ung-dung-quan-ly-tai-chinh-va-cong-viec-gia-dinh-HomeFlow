# 🏠 HomeFlow — Ứng Dụng Quản Lý Tài Chính & Công Việc Gia Đình

> **HomeFlow** là ứng dụng di động/web giúp các gia đình quản lý tài chính chung, phân công công việc nhà, và theo dõi chi tiêu một cách thông minh — tất cả trong một nền tảng.

---

## ✨ Tính Năng Chính

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 **Xác thực** | Đăng ký / Đăng nhập bảo mật bằng JWT |
| 👨‍👩‍👧‍👦 **Quản lý Gia đình** | Tạo nhóm gia đình, mời thành viên qua email, phân quyền (owner / admin / member) |
| 💰 **Ví tiền** | Quản lý nhiều ví (cá nhân + gia đình), theo dõi số dư thời gian thực |
| 💸 **Thu Chi** | Thêm, xem, lọc, xóa giao dịch thu/chi theo thời gian và danh mục |
| 📊 **Thống kê** | Biểu đồ tổng quan tài chính tháng, phân bổ chi tiêu theo danh mục |
| ✅ **Việc nhà** | CRUD công việc, giao việc cho thành viên, đánh dấu hoàn thành, lọc theo trạng thái |
| 👤 **Hồ sơ** | Cập nhật thông tin cá nhân, avatar, tên hiển thị |

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend (App)
- **React Native** + **Expo** — chạy được trên Web, Android, iOS
- **TypeScript** — đảm bảo type-safe
- **Expo Router / React Navigation** — điều hướng màn hình

### Backend (API Server)
- **Node.js** + **Express.js** — REST API
- **MongoDB Atlas** — cơ sở dữ liệu đám mây
- **Mongoose** — ODM cho MongoDB
- **JWT (JSON Web Token)** — xác thực người dùng
- **bcrypt** — mã hóa mật khẩu

---

## 📁 Cấu Trúc Dự Án

```
HomeFlow/
├── src/                            # Source code Frontend (React Native)
│   ├── App.tsx                     # Root component, quản lý state toàn cục
│   ├── components/                 # Các UI component tái sử dụng
│   │   ├── auth/                   # Màn hình đăng ký / đăng nhập
│   │   ├── modals/                 # Các modal (thêm giao dịch, ví, công việc...)
│   │   ├── tabs/                   # Các tab: Thống kê, Gia đình, Công việc
│   │   ├── Header.tsx              # Thanh tiêu đề
│   │   ├── TodayTasks.tsx          # Danh sách công việc hôm nay
│   │   ├── RecentTransactions.tsx  # Giao dịch gần đây
│   │   └── ...
│   ├── services/
│   │   └── api.ts                  # Tất cả hàm gọi API Backend
│   └── types/
│       └── index.ts                # Các TypeScript interface/type
│
├── server/                         # Source code Backend (Node.js)
│   ├── src/
│   │   ├── index.js                # Entry point — khởi động Express server
│   │   ├── config/
│   │   │   └── db.js               # Kết nối MongoDB Atlas
│   │   ├── middleware/
│   │   │   ├── auth.js             # Middleware xác thực JWT
│   │   │   └── errorHandler.js     # Xử lý lỗi tập trung
│   │   ├── models/                 # Mongoose Schema/Models
│   │   │   ├── Profile.js
│   │   │   ├── Household.js
│   │   │   ├── HouseholdMember.js
│   │   │   ├── HouseholdInvitation.js
│   │   │   ├── Account.js
│   │   │   ├── Category.js
│   │   │   ├── Transaction.js
│   │   │   ├── TransactionTransfer.js
│   │   │   └── Task.js
│   │   ├── routes/                 # Express Route handlers
│   │   │   ├── auth.js             # /api/auth
│   │   │   ├── accounts.js         # /api/accounts
│   │   │   ├── categories.js       # /api/categories
│   │   │   ├── transactions.js     # /api/transactions
│   │   │   ├── households.js       # /api/households
│   │   │   └── tasks.js            # /api/tasks
│   │   └── utils/
│   │       └── seedDefaultCategories.js
│   ├── .env.example                # Mẫu biến môi trường
│   └── package.json
│
├── package.json                    # Scripts chính của dự án
└── README.md
```

---

## 🚀 Cài Đặt & Khởi Động

### Yêu Cầu Hệ Thống

- **Node.js** >= 18.x ([tải tại đây](https://nodejs.org))
- **npm** >= 9.x (đi kèm Node.js)
- **Git**
- Connection string **MongoDB Atlas** (nhận từ trưởng nhóm)

---

### Bước 1 — Clone dự án về máy

```bash
git clone https://github.com/jkiang2901/Ung-dung-quan-ly-tai-chinh-va-cong-viec-gia-dinh-HomeFlow.git
cd Ung-dung-quan-ly-tai-chinh-va-cong-viec-gia-dinh-HomeFlow
```

---

### Bước 2 — Cài đặt toàn bộ thư viện

```bash
npm run install:all
```

> Hoặc cài thủ công:
> ```bash
> npm install        # Frontend
> cd server && npm install  # Backend
> ```

---

### Bước 3 — Cấu hình biến môi trường

```bash
# Windows PowerShell
Copy-Item server/.env.example server/.env

# macOS / Linux
cp server/.env.example server/.env
```

Mở `server/.env` và điền thông tin:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.kotp36b.mongodb.net/homeflow?retryWrites=true&w=majority
JWT_SECRET=homeflow_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
```

> ⚠️ **Lỗi IP bị chặn?** Vào MongoDB Atlas → **Network Access** → **Add IP Address** → chọn **Allow Access from Anywhere (`0.0.0.0/0`)**.

---

### Bước 4 — Khởi động hệ thống

Mở **2 terminal riêng biệt**:

#### 💻 Terminal 1 — Backend API Server

```bash
npm run server:dev
```

Kiểm tra server hoạt động:
```
GET http://localhost:5000/api/health
→ {"status":"ok","timestamp":"..."}
```

#### 📱 Terminal 2 — Frontend App

```bash
npm run web      # Chạy trên Web browser (khuyến nghị khi dev)
npm start        # Expo Metro Bundler (quét QR bằng Expo Go)
npm run android  # Android Emulator
```

---

## 📜 Các Lệnh Hữu Ích

| Lệnh | Mô tả |
|------|-------|
| `npm run install:all` | Cài đặt tất cả dependencies |
| `npm run server:dev` | Chạy backend (tự reload khi sửa code) |
| `npm run server` | Chạy backend bản production |
| `npm run web` | Chạy app trên Web browser |
| `npm start` | Khởi động Expo (Mobile + Web) |
| `npm run android` | Chạy trên Android Emulator |
| `npm run ios` | Chạy trên iOS Simulator |
| `npm run lint` | Kiểm tra lỗi code style (oxlint) |

---

## 📡 Tài Liệu API

> Tất cả API (trừ đăng ký/đăng nhập) yêu cầu header:
> ```
> Authorization: Bearer <jwt_token>
> ```

---

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `POST` | `/register` | Đăng ký tài khoản mới | ❌ |
| `POST` | `/login` | Đăng nhập, nhận JWT token | ❌ |
| `GET` | `/me` | Lấy thông tin user hiện tại | ✅ |
| `PATCH` | `/me` | Cập nhật hồ sơ cá nhân | ✅ |
| `PATCH` | `/me/password` | Đổi mật khẩu | ✅ |

**Đăng ký:**
```json
POST /api/auth/register
{ "email": "user@example.com", "password": "123456", "display_name": "Nguyễn Văn A" }
```

**Đăng nhập:**
```json
POST /api/auth/login
{ "email": "user@example.com", "password": "123456" }
// Response: { "token": "eyJ...", "user": { ... } }
```

---

### 💰 Accounts (Ví tiền) — `/api/accounts`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Danh sách ví của user |
| `POST` | `/` | Tạo ví mới |
| `PATCH` | `/:id` | Cập nhật ví |
| `DELETE` | `/:id` | Xóa ví |

---

### 💸 Transactions (Thu Chi) — `/api/transactions`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Danh sách giao dịch (hỗ trợ lọc) |
| `POST` | `/` | Thêm giao dịch thu/chi |
| `GET` | `/:id` | Chi tiết giao dịch |
| `PATCH` | `/:id` | Cập nhật giao dịch |
| `DELETE` | `/:id` | Xóa giao dịch |
| `GET` | `/stats/summary` | Thống kê tổng hợp (tháng/năm) |
| `GET` | `/stats/by-category` | Thống kê theo danh mục |
| `POST` | `/transfer` | Chuyển tiền giữa 2 ví |

**Query params lọc:**
```
?type=income|expense
?account_id=<id>
?category_id=<id>
?start_date=2026-01-01&end_date=2026-12-31
?page=1&limit=20
```

---

### 📂 Categories (Danh Mục) — `/api/categories`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Danh sách danh mục (mặc định + tuỳ chỉnh) |
| `POST` | `/` | Tạo danh mục tuỳ chỉnh |
| `PATCH` | `/:id` | Cập nhật danh mục |
| `DELETE` | `/:id` | Xóa danh mục tuỳ chỉnh |

---

### 👨‍👩‍👧 Households (Gia Đình) — `/api/households`

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| `GET` | `/` | Danh sách gia đình của user | member |
| `POST` | `/` | Tạo gia đình mới | tất cả |
| `PATCH` | `/:id` | Cập nhật tên/currency | owner/admin |
| `DELETE` | `/:id` | Xóa gia đình | owner |
| `GET` | `/:id/members` | Danh sách thành viên | member |
| `PATCH` | `/:id/members/:userId/role` | Thay đổi quyền thành viên | owner/admin |
| `DELETE` | `/:id/members/:userId` | Kick hoặc tự rời gia đình | owner/admin / self |
| `POST` | `/:id/invitations` | Gửi lời mời qua email | owner/admin |
| `GET` | `/:id/invitations` | Xem lời mời đang chờ | owner/admin |
| `DELETE` | `/:id/invitations/:invId` | Hủy lời mời | owner/admin |
| `POST` | `/invitations/accept` | Chấp nhận lời mời bằng token | tất cả |

**Phân quyền thành viên:**
- `owner` — Chủ hộ: toàn quyền kể cả xóa gia đình
- `admin` — Quản trị viên: mời người, kick member, đổi role member
- `member` — Thành viên thường: xem và tự rời gia đình

---

### ✅ Tasks (Công Việc Nhà) — `/api/tasks`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Danh sách công việc (hỗ trợ lọc) |
| `GET` | `/:id` | Chi tiết công việc |
| `POST` | `/` | Tạo công việc mới |
| `PATCH` | `/:id` | Cập nhật thông tin công việc |
| `PUT` | `/:id/toggle` | Đánh dấu hoàn thành / mở lại |
| `PUT` | `/:id/assign` | Giao việc cho thành viên |
| `DELETE` | `/:id` | Xóa công việc |

**Query params lọc:**
```
?status=completed|pending
?assigned_to=<userId>
?household_id=<id>
?tag=<tag>
?priority=true|false
```

**Body tạo/cập nhật task:**
```json
{
  "title": "Dọn nhà",
  "description": "Dọn phòng khách và bếp",
  "tag": "Dọn dẹp",
  "priority": true,
  "due_date": "2026-10-30",
  "assigned_to_user_id": "<userId>",
  "household_id": "<householdId>"
}
```

---

## 🗄️ Cơ Sở Dữ Liệu (MongoDB Atlas)

**Database name:** `homeflow`

| Collection | Mô tả |
|-----------|-------|
| `profiles` | Hồ sơ người dùng |
| `households` | Thông tin các gia đình |
| `household_members` | Thành viên + role trong từng gia đình |
| `household_invitations` | Lời mời gia đình (token-based, 7 ngày) |
| `accounts` | Ví tiền |
| `categories` | Danh mục thu/chi |
| `transactions` | Giao dịch thu/chi |
| `transaction_transfers` | Lịch sử chuyển tiền giữa ví |
| `tasks` | Công việc nhà |

---

## 🌿 Git Workflow

```
main                    ← Branch ổn định (production)
feature/next-sprint     ← Branch phát triển chính hiện tại
feature/<tên-tính-năng> ← Branch riêng cho từng tính năng
```

**Quy trình làm việc:**
```bash
# 1. Kéo code mới nhất
git pull origin feature/next-sprint

# 2. Tạo branch riêng
git checkout -b feature/ten-tinh-nang

# 3. Code và commit
git add -A
git commit -m "feat: mô tả thay đổi"

# 4. Push và tạo Pull Request
git push origin feature/ten-tinh-nang
```

---

## 👥 Thành Viên Nhóm

> Cập nhật danh sách thành viên tại đây.

---

## 📄 License

MIT License © 2026 HomeFlow Team


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
