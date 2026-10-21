import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler } from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/auth.js';
import accountRoutes from './src/routes/accounts.js';
import categoryRoutes from './src/routes/categories.js';
import transactionRoutes from './src/routes/transactions.js';
import householdRoutes from './src/routes/households.js';
import { seedDefaultCategories } from './src/utils/seedDefaultCategories.js';
import { Category } from './src/models/Category.js';

const PORT = process.env.TEST_PORT || 5099;
const BASE_URL = `http://localhost:${PORT}/api`;
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/homeflow_test';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_mock_key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/households', householdRoutes);
app.use(errorHandler);

let serverInstance;

const runTests = async () => {
  console.log('🧪 Bắt đầu kiểm thử toàn diện Backend API HomeFlow...\n');

  try {
    await mongoose.connect(TEST_DB_URI, { dbName: 'homeflow_test' });
    console.log('✅ Đã kết nối MongoDB Test Database thành công.');

    // Dọn dẹp dữ liệu cũ trong database test
    await mongoose.connection.dropDatabase();
    await seedDefaultCategories();
    console.log('✅ Khởi tạo danh mục mặc định thành công.\n');

    serverInstance = app.listen(PORT);
    console.log(`🚀 Test Server đang chạy tại port ${PORT}...\n`);

    let passedCount = 0;
    let failedCount = 0;

    const assert = (condition, title) => {
      if (condition) {
        console.log(`  ✅ PASS: ${title}`);
        passedCount++;
      } else {
        console.error(`  ❌ FAIL: ${title}`);
        failedCount++;
      }
    };

    // -------------------------------------------------------------
    // TEST 1: Xác thực Auth & JWT
    // -------------------------------------------------------------
    console.log('--- 1. Kiểm thử Đăng ký, Đăng nhập & Xác thực JWT ---');

    // 1.1 Đăng ký tài khoản User A
    const regResA = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'usera@homeflow.vn',
        password: 'password123',
        display_name: 'Nguyễn Văn A',
      }),
    });
    const regDataA = await regResA.json();
    assert(regResA.status === 201 && regDataA.token, 'Đăng ký User A trả về 201 và JWT token');
    const tokenA = regDataA.token;
    const userA = regDataA.user;

    // 1.2 Đăng ký tài khoản User B
    const regResB = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'userb@homeflow.vn',
        password: 'password123',
        display_name: 'Trần Thị B',
      }),
    });
    const regDataB = await regResB.json();
    assert(regResB.status === 201 && regDataB.token, 'Đăng ký User B trả về 201 và JWT token');
    const tokenB = regDataB.token;

    // 1.3 Đăng nhập User A
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'usera@homeflow.vn',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && !loginData.user.password_hash, 'Đăng nhập thành công và không để lộ password_hash');

    // 1.4 Thiếu token khi truy cập API được bảo vệ
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
    assert(noTokenRes.status === 401, 'Truy cập không token bị từ chối 401');

    // 1.5 Token sai
    const badTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer token_khong_hop_le' },
    });
    assert(badTokenRes.status === 401, 'Truy cập với token sai bị từ chối 401');

    // -------------------------------------------------------------
    // TEST 2: Cập nhật Profile (PUT /api/auth/profile)
    // -------------------------------------------------------------
    console.log('\n--- 2. Kiểm thử Cập nhật Profile (PUT /api/auth/profile) ---');

    // 2.1 Cố tình thay đổi trường cấm (email hoặc password)
    const hackProfileRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        email: 'hacked@homeflow.vn',
        password: 'newpassword',
      }),
    });
    assert(hackProfileRes.status === 400, 'Chặn thay đổi email/password qua PUT /profile trả về 400 Bad Request');

    // 2.2 Tên hiển thị rỗng
    const emptyNameRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        display_name: '   ',
      }),
    });
    assert(emptyNameRes.status === 400, 'Tên hiển thị rỗng bị từ chối 400 Bad Request');

    // 2.3 Cập nhật hợp lệ (display_name, avatar_url, timezone)
    const updateProfileRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        display_name: 'Nguyễn Văn A (Trưởng Gia Đình)',
        avatar_url: 'https://cdn.example.com/avatars/user_a.png',
        timezone: 'Asia/Ho_Chi_Minh',
      }),
    });
    const updateProfileData = await updateProfileRes.json();
    assert(
      updateProfileRes.status === 200 &&
        updateProfileData.user.display_name === 'Nguyễn Văn A (Trưởng Gia Đình)' &&
        !updateProfileData.user.password_hash,
      'Cập nhật profile thành công, dữ liệu an toàn không lộ hash'
    );

    // -------------------------------------------------------------
    // TEST 3: Quản lý Ví tiền & Quyền truy cập
    // -------------------------------------------------------------
    console.log('\n--- 3. Kiểm thử Ví tiền & Phân quyền ---');

    // Tạo ví cá nhân User A
    const walletARes = await fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        name: 'Ví tiền mặt A',
        type: 'cash',
        initial_balance: 1000000,
      }),
    });
    const walletAData = await walletARes.json();
    assert(walletARes.status === 201, 'Tạo ví cá nhân User A thành công');
    const walletAId = walletAData.data.id;

    // Tạo ví thứ hai của User A (Ví ngân hàng A) để test chuyển tiền
    const walletA2Res = await fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        name: 'Tài khoản Ngân hàng A',
        type: 'bank',
        initial_balance: 500000,
      }),
    });
    const walletA2Data = await walletA2Res.json();
    const walletA2Id = walletA2Data.data.id;

    // Tạo ví cá nhân User B
    const walletBRes = await fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        name: 'Ví tiền mặt B',
        type: 'cash',
        initial_balance: 2000000,
      }),
    });
    const walletBData = await walletBRes.json();
    assert(walletBRes.status === 201, 'Tạo ví cá nhân User B thành công');
    const walletBId = walletBData.data.id;

    // Lấy 1 danh mục có sẵn
    const defaultCat = await Category.findOne({ type: 'expense' });
    const defaultCatId = defaultCat ? defaultCat.id : null;

    // -------------------------------------------------------------
    // TEST 4: Thêm giao dịch thu chi (POST /api/transactions)
    // -------------------------------------------------------------
    console.log('\n--- 4. Kiểm thử Thêm giao dịch thu chi (POST /api/transactions) ---');

    // 4.1 Tạo giao dịch vào ví của User B bằng token của User A (Phải bị 403 Forbidden)
    const trespassRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        account_id: walletBId,
        amount: 100000,
        type: 'expense',
      }),
    });
    assert(trespassRes.status === 403, 'User A không có quyền ghi giao dịch vào ví của User B -> 403 Forbidden');

    // 4.2 Số tiền không hợp lệ (số âm hoặc = 0)
    const negativeRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        account_id: walletAId,
        amount: -50000,
        type: 'expense',
      }),
    });
    assert(negativeRes.status === 400, 'Số tiền âm bị từ chối 400 Bad Request');

    // 4.3 Danh mục không tồn tại
    const badCatRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        account_id: walletAId,
        category_id: 'non_existent_category_uuid',
        amount: 50000,
        type: 'expense',
      }),
    });
    assert(badCatRes.status === 400, 'Danh mục không tồn tại bị từ chối 400 Bad Request');

    // 4.4 Thêm khoản THU NHẬP (Income): +500,000 VND vào Ví A
    const incomeRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        account_id: walletAId,
        amount: 500000,
        type: 'income',
        note: 'Tiền thưởng dự án',
        transaction_date: new Date().toISOString(),
      }),
    });
    const incomeData = await incomeRes.json();
    assert(
      incomeRes.status === 201 && incomeData.balance === 1500000,
      `Tạo giao dịch thu nhập thành công, số dư ví tự động tăng lên 1,500,000 VND (Hiện tại: ${incomeData.balance})`
    );
    const incomeTxId = incomeData.data.id;

    // 4.5 Thêm khoản CHI TIÊU (Expense): -200,000 VND vào Ví A
    const expenseRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        account_id: walletAId,
        category_id: defaultCatId,
        amount: 200000,
        type: 'expense',
        note: 'Ăn uống gia đình cuối tuần',
        transaction_date: new Date().toISOString(),
      }),
    });
    const expenseData = await expenseRes.json();
    assert(
      expenseRes.status === 201 && expenseData.balance === 1300000,
      `Tạo giao dịch chi tiêu thành công, số dư ví tự động giảm còn 1,300,000 VND (Hiện tại: ${expenseData.balance})`
    );
    const expenseTxId = expenseData.data.id;

    // -------------------------------------------------------------
    // TEST 5: Xem danh sách & Chi tiết giao dịch
    // -------------------------------------------------------------
    console.log('\n--- 5. Kiểm thử Xem danh sách & Chi tiết giao dịch ---');

    // 5.1 Lấy danh sách giao dịch
    const listRes = await fetch(`${BASE_URL}/transactions`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const listData = await listRes.json();
    assert(listRes.status === 200 && listData.data.length >= 2, 'Lấy danh sách giao dịch trả về 200 và mảng dữ liệu');

    // 5.2 Lọc theo loại chi tiêu (type = expense)
    const filterRes = await fetch(`${BASE_URL}/transactions?type=expense`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const filterData = await filterRes.json();
    const allExpenses = filterData.data.every((t) => t.type === 'expense');
    assert(allExpenses && filterData.data.length >= 1, 'Bộ lọc type=expense chỉ trả về các khoản chi');

    // 5.3 User A xem chi tiết giao dịch của mình
    const detailRes = await fetch(`${BASE_URL}/transactions/${expenseTxId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(detailRes.status === 200, 'User A xem chi tiết giao dịch của mình thành công (200 OK)');

    // 5.4 User B xem giao dịch của User A (Phải bị 403 Forbidden)
    const forbiddenDetailRes = await fetch(`${BASE_URL}/transactions/${expenseTxId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(forbiddenDetailRes.status === 403, 'User B cố xem giao dịch của User A -> 403 Forbidden');

    // 5.5 Giao dịch không tồn tại
    const notFoundRes = await fetch(`${BASE_URL}/transactions/non_existent_uuid`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(notFoundRes.status === 404, 'Xem giao dịch không tồn tại trả về 404 Not Found');

    // -------------------------------------------------------------
    // TEST 6: Chuyển tiền nội bộ & Loại trừ khỏi Thống kê
    // -------------------------------------------------------------
    console.log('\n--- 6. Kiểm thử Chuyển tiền nội bộ & Thống kê thu chi ---');

    // Chuyển 100,000 VND từ Ví tiền mặt A sang Ví ngân hàng A
    const transferRes = await fetch(`${BASE_URL}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        from_account_id: walletAId,
        to_account_id: walletA2Id,
        amount: 100000,
        fee: 0,
        note: 'Nạp tiền vào tài khoản ngân hàng',
      }),
    });
    const transferData = await transferRes.json();
    assert(
      transferRes.status === 201 &&
        transferData.balances.from_balance === 1200000 &&
        transferData.balances.to_balance === 600000,
      'Chuyển tiền nội bộ thành công, cập nhật chính xác số dư cả 2 ví'
    );

    // -------------------------------------------------------------
    // TEST 7: Thống kê thu chi (GET /api/transactions/statistics)
    // -------------------------------------------------------------
    console.log('\n--- 7. Kiểm thử Thống kê thu chi (GET /api/transactions/statistics) ---');

    const statsRes = await fetch(`${BASE_URL}/transactions/statistics?group_by=month`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const statsData = await statsRes.json();

    assert(statsRes.status === 200, 'Gọi API thống kê trả về 200 OK');
    assert(
      statsData.data.summary.total_income === 500000,
      `Tổng thu chính xác: 500,000 VND (Thực tế: ${statsData.data.summary.total_income}) - KHÔNG bị tính trùng giao dịch chuyển tiền`
    );
    assert(
      statsData.data.summary.total_expense === 200000,
      `Tổng chi chính xác: 200,000 VND (Thực tế: ${statsData.data.summary.total_expense}) - KHÔNG bị tính trùng giao dịch chuyển tiền`
    );
    assert(
      statsData.data.summary.net_income === 300000,
      `Thu nhập ròng (net_income = thu - chi) chính xác: 300,000 VND (Thực tế: ${statsData.data.summary.net_income})`
    );
    assert(Array.isArray(statsData.data.breakdown) && statsData.data.breakdown.length > 0, 'Có phân tích theo chu kỳ thời gian (breakdown)');
    assert(Array.isArray(statsData.data.by_category) && statsData.data.by_category.length > 0, 'Có thống kê chi tiêu theo danh mục với tỷ lệ % (by_category)');

    // -------------------------------------------------------------
    // TEST 8: Xóa giao dịch (DELETE /api/transactions/:id)
    // -------------------------------------------------------------
    console.log('\n--- 8. Kiểm thử Xóa giao dịch & Hoàn trả số dư ---');

    // 8.1 User B cố xóa giao dịch của User A -> 403 Forbidden
    const unauthDelRes = await fetch(`${BASE_URL}/transactions/${expenseTxId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(unauthDelRes.status === 403, 'User B cố xóa giao dịch của User A -> 403 Forbidden');

    // 8.2 User A xóa khoản chi tiêu 200,000 VND -> Số dư ví tiền mặt A tăng lại từ 1,200,000 lên 1,400,000 VND
    const delRes = await fetch(`${BASE_URL}/transactions/${expenseTxId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const delData = await delRes.json();
    assert(
      delRes.status === 200 && delData.balance === 1400000,
      `Xóa giao dịch thành công, số dư ví tự động tính toán lại thành 1,400,000 VND (Thực tế: ${delData.balance})`
    );

    console.log(`\n=============================================================`);
    console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passedCount} PASS, ${failedCount} FAIL`);
    console.log(`=============================================================\n`);

    if (failedCount > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Lỗi khi chạy test:', err);
    process.exitCode = 1;
  } finally {
    if (serverInstance) serverInstance.close();
    await mongoose.disconnect();
    console.log('🏁 Hoàn tất phiên kiểm thử.');
  }
};

runTests();
