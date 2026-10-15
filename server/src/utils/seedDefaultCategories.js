import { Category } from '../models/Category.js';

export const seedDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments({ is_default: true });
    if (count > 0) return;

    const defaultCategories = [
      { name: 'Ăn uống', type: 'expense', icon: 'utensils', color: '#ef4444', is_default: true },
      { name: 'Mua sắm', type: 'expense', icon: 'shopping-bag', color: '#f59e0b', is_default: true },
      { name: 'Hóa đơn & Tiện ích', type: 'expense', icon: 'file-text', color: '#3b82f6', is_default: true },
      { name: 'Di chuyển & Xe cộ', type: 'expense', icon: 'car', color: '#8b5cf6', is_default: true },
      { name: 'Y tế & Sức khỏe', type: 'expense', icon: 'heart', color: '#ec4899', is_default: true },
      { name: 'Giáo dục', type: 'expense', icon: 'book', color: '#10b981', is_default: true },
      { name: 'Lương & Thu nhập', type: 'income', icon: 'dollar-sign', color: '#22c55e', is_default: true },
      { name: 'Thưởng & Phụ cấp', type: 'income', icon: 'gift', color: '#06b6d4', is_default: true },
      { name: 'Đầu tư & Tiết kiệm', type: 'income', icon: 'trending-up', color: '#6366f1', is_default: true },
    ];

    await Category.insertMany(defaultCategories);
    console.log('✅ Đã khởi tạo các danh mục mặc định của hệ thống.');
  } catch (error) {
    console.error('Lỗi khi tạo danh mục mặc định:', error.message);
  }
};
