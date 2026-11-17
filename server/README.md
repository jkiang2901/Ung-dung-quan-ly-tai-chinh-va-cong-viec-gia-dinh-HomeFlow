# HomeFlow Backend API (Node.js + Express + MongoDB Atlas)

Hệ thống API backend cho ứng dụng quản lý tài chính và công việc gia đình **HomeFlow**, kết nối với cơ sở dữ liệu **MongoDB Atlas** (`homeflow`).

---

## 1. Cấu hình Connection String MongoDB Atlas

1. Mở file [server/.env](file:///d:/HomeFlow/server/.env) (hoặc copy từ [server/.env.example](file:///d:/HomeFlow/server/.env.example)).
2. Cập nhật `MONGODB_URI` và `JWT_SECRET` theo môi trường triển khai:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/homeflow
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAILS=admin@example.com
```

`ADMIN_EMAILS` là danh sách email được phép dùng API quản trị, phân cách bằng dấu phẩy. Chỉ tài khoản đã đăng ký/đăng nhập và có email trong danh sách mới truy cập được `/api/admin`. Không dùng vai trò admin của hộ gia đình thay cho quyền quản trị hệ thống. Có thể cấu hình thêm giới hạn IP trong Admin → Cài đặt; hãy thêm IP hiện tại trước khi lưu để tránh tự khóa.

Các thiết lập email, push, Telegram và 2FA chưa có dịch vụ/provider tích hợp. Dashboard không hiển thị thành công giả cho các thao tác đó; sao lưu hiện tải JSON các collection và không thay thế MongoDB Atlas snapshot.

> **Lưu ý**: Database chỉ định là `/homeflow`. Đảm bảo trong MongoDB Atlas mục **Network Access** đã cho phép IP máy của bạn (hoặc `0.0.0.0/0` khi phát triển).

---

## 2. Cách khởi động Server

### Cách 1: Chạy từ thư mục gốc `HomeFlow`
```bash
npm run server       # Chạy server thông thường
# hoặc
npm run server:dev   # Chạy tự động reload khi sửa code (nodemon)
```

### Cách 2: Chạy trong thư mục `server`
```bash
cd server
npm run dev
```

Server sẽ chạy tại địa chỉ: `http://localhost:5000`

---

## 3. Cấu trúc CSDL và Collections (Theo quy định)

| Nhóm | Collection | Chức năng |
| :--- | :--- | :--- |
| **Người dùng & Gia đình** | `profiles` | Hồ sơ người dùng, email, mật khẩu băm, timezone, avatar |
| | `households` | Không gian gia đình, mã tiền tệ |
| | `household_members` | Thành viên gia đình (owner, admin, member) |
| | `household_invitations` | Lời mời thành viên qua email kèm token |
| **Tài chính** | `accounts` | Ví tiền & tài khoản (cash, bank, e_wallet, savings, other). Ràng buộc đúng 1 chủ sở hữu (cá nhân hoặc gia đình). |
| | `categories` | Danh mục thu chi mặc định và tùy chỉnh |
| | `transactions` | Giao dịch thu và chi tiền |
| | `transaction_transfers` | Chuyển khoản qua lại giữa 2 ví |

---

## 4. Danh sách API Endpoints

### 🔐 4.1. Xác thực (Auth)

| Phương thức | Endpoint | Mô tả | Yêu cầu Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới (lưu vào `profiles`) | Không |
| `POST` | `/api/auth/login` | Đăng nhập và nhận JWT token | Không |
| `GET` | `/api/auth/me` | Lấy thông tin tài khoản hiện tại | Có (Bearer) |
| `PUT` | `/api/auth/profile` | Cập nhật `display_name`, `avatar_url`, `timezone` | Có (Bearer) |

#### Body mẫu Đăng ký (`POST /api/auth/register`):
```json
{
  "email": "giang@example.com",
  "password": "password123",
  "display_name": "Nguyễn Trường Giang",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

#### Response mẫu:
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "e44d32a0-c3d5-419b-ba2d-45dbfa2674e1",
    "email": "giang@example.com",
    "display_name": "Nguyễn Trường Giang",
    "timezone": "Asia/Ho_Chi_Minh"
  }
}
```

---

### 💳 4.2. Quản lý Ví tiền (Accounts)

> Tất cả các API này yêu cầu Header: `Authorization: Bearer <token>`

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/accounts` | Lấy danh sách ví (có tính toán số dư hiện tại `balance`) |
| `GET` | `/api/accounts/:id` | Lấy chi tiết ví kèm lịch sử giao dịch gần nhất |
| `POST` | `/api/accounts` | Tạo ví mới (cá nhân hoặc gia đình) |
| `PUT` | `/api/accounts/:id` | Cập nhật tên ví, loại ví, số dư ban đầu, trạng thái lưu trữ |
| `DELETE` | `/api/accounts/:id` | Xóa ví (nếu đã có giao dịch sẽ chuyển sang `is_archived: true`) |

#### Body mẫu tạo ví (`POST /api/accounts`):
```json
{
  "name": "MB Bank Cá Nhân",
  "type": "bank",
  "initial_balance": 15000000,
  "currency": "VND"
}
```
*(Nếu muốn tạo ví chung cho gia đình, truyền thêm `"household_id": "uuid-gia-dinh"`)*

---

### 💸 4.3. Quản lý Thu chi & Chi tiêu (Transactions)

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/transactions` | Lọc giao dịch theo ví (`account_id`), loại (`type`), ngày tháng |
| `GET` | `/api/transactions/:id` | Chi tiết một giao dịch |
| `POST` | `/api/transactions` | Tạo giao dịch mới (chi tiêu `expense` hoặc thu nhập `income`) |
| `PUT` | `/api/transactions/:id` | Sửa giao dịch |
| `DELETE` | `/api/transactions/:id` | Xóa giao dịch |
| `POST` | `/api/transactions/transfer` | Chuyển tiền từ ví A sang ví B |

#### Body mẫu ghi một khoản chi (`POST /api/transactions`):
```json
{
  "account_id": "account-uuid-here",
  "category_id": "category-uuid-here",
  "amount": 75000,
  "type": "expense",
  "note": "Ăn trưa cơm văn phòng",
  "transaction_date": "2026-10-15T12:00:00.000Z"
}
```

#### Body mẫu chuyển tiền giữa 2 ví (`POST /api/transactions/transfer`):
```json
{
  "from_account_id": "id-vi-nguon",
  "to_account_id": "id-vi-dich",
  "amount": 2000000,
  "fee": 0,
  "note": "Rút tiền từ MB Bank về tiền mặt"
}
```

---

### 🏷️ 4.4. Quản lý Danh mục (Categories)

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/categories` | Lấy danh sách danh mục (hệ thống + cá nhân) |
| `POST` | `/api/categories` | Tạo danh mục tùy chỉnh mới |
| `PUT` | `/api/categories/:id` | Sửa danh mục cá nhân |
| `DELETE` | `/api/categories/:id` | Xóa danh mục cá nhân |

---

### 👨‍👩‍👧 4.5. Gia đình & Thành viên (Households)

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/households` | Danh sách gia đình người dùng đang tham gia |
| `POST` | `/api/households` | Tạo gia đình mới (người tạo tự động là `owner`) |
| `GET` | `/api/households/:id/members` | Danh sách thành viên |
| `POST` | `/api/households/:id/invitations` | Mời thành viên qua email (chỉ `owner`/`admin`) |

---

## 5. Kết nối từ ứng dụng HomeFlow Frontend

Đã tạo sẵn service API client tại [src/services/api.ts](file:///d:/HomeFlow/src/services/api.ts).

Ví dụ sử dụng trong React Native Component:
```typescript
import { api } from '../services/api';

// 1. Đăng nhập
const res = await api.auth.login({ email: 'giang@example.com', password: 'password123' });
api.setToken(res.token);

// 2. Lấy danh sách ví tiền
const walletsRes = await api.accounts.list();
console.log(walletsRes.data);

// 3. Thêm khoản chi tiêu mới
await api.transactions.create({
  account_id: 'uuid-vi-tien',
  amount: 50000,
  type: 'expense',
  note: 'Cà phê sáng',
});
```
