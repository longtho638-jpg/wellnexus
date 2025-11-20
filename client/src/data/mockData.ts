/**
 * WellNexus Mock Data
 * Simulates Firebase Firestore for MVP demo
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedDate: string;
  referralCode: string;
  referredBy?: string;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  totalEarnings: number;
  currentBalance: number;
  teamSize: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  commission: number; // 25% = 375,000 VNĐ
  category: 'health' | 'beauty' | 'wellness';
  imageUrl: string;
  stock: number;
}

export interface Transaction {
  id: string;
  type: 'commission' | 'bonus' | 'withdrawal' | 'purchase';
  amount: number;
  taxDeducted?: number; // 10% TNCN auto-deduction for withdrawals > 2M
  netAmount?: number;   // Amount after tax
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  completed: boolean;
  badge?: string;
}

// ===== MOCK USER =====
export const currentUser: User = {
  id: 'user_001',
  name: 'Nguyễn Minh Anh',
  phone: '0901234567',
  email: 'minhanh@example.com',
  joinedDate: '2024-10-25',
  referralCode: 'WELLNEXUS-MINHANH',
  level: 'Silver',
  totalEarnings: 8_750_000, // 8.75M VNĐ
  currentBalance: 2_450_000, // 2.45M VNĐ (available for withdrawal)
  teamSize: 12,
};

// ===== MOCK PRODUCTS =====
export const products: Product[] = [
  {
    id: 'prod_001',
    name: 'ANIMA 119',
    description: 'Combo sức khỏe toàn diện: Vitamin C + Omega-3 + Collagen. Giúp tăng cường miễn dịch, đẹp da từ bên trong.',
    price: 1_500_000, // 1.5M VNĐ
    commission: 375_000, // 25% direct commission
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800',
    stock: 248,
  },
  {
    id: 'prod_002',
    name: 'VITALITY BOOST',
    description: 'Năng lượng suốt ngày với Ginseng & B-Complex',
    price: 950_000,
    commission: 237_500,
    category: 'wellness',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
    stock: 156,
  },
];

// ===== MOCK TRANSACTIONS =====
export const transactions: Transaction[] = [
  {
    id: 'tx_007',
    type: 'withdrawal',
    amount: 3_000_000,
    taxDeducted: 300_000, // 10% TNCN tax (> 2M threshold)
    netAmount: 2_700_000,
    description: 'Rút tiền về ngân hàng VCB **** 9876',
    date: '2024-11-18T14:30:00',
    status: 'completed',
  },
  {
    id: 'tx_006',
    type: 'bonus',
    amount: 500_000,
    description: 'Thưởng nhóm - Team đạt 10 người',
    date: '2024-11-17T10:00:00',
    status: 'completed',
  },
  {
    id: 'tx_005',
    type: 'commission',
    amount: 375_000,
    description: 'Hoa hồng bán ANIMA 119 - KH: Lê Văn B',
    date: '2024-11-16T16:45:00',
    status: 'completed',
  },
  {
    id: 'tx_004',
    type: 'commission',
    amount: 375_000,
    description: 'Hoa hồng bán ANIMA 119 - KH: Trần Thị C',
    date: '2024-11-15T09:20:00',
    status: 'completed',
  },
  {
    id: 'tx_003',
    type: 'commission',
    amount: 375_000,
    description: 'Hoa hồng bán ANIMA 119 - KH: Phạm Văn D',
    date: '2024-11-14T11:15:00',
    status: 'completed',
  },
  {
    id: 'tx_002',
    type: 'withdrawal',
    amount: 1_800_000,
    taxDeducted: 0, // No tax (< 2M threshold)
    netAmount: 1_800_000,
    description: 'Rút tiền về ngân hàng MB **** 5432',
    date: '2024-11-12T13:00:00',
    status: 'completed',
  },
  {
    id: 'tx_001',
    type: 'commission',
    amount: 375_000,
    description: 'Hoa hồng bán ANIMA 119 - KH: Hoàng Thị E',
    date: '2024-11-10T15:30:00',
    status: 'completed',
  },
];

// ===== MOCK QUESTS (30-Day Challenge) =====
export const quests: Quest[] = [
  {
    id: 'quest_001',
    title: 'Hoàn thành hồ sơ',
    description: 'Điền đầy đủ thông tin cá nhân và xác minh số điện thoại',
    reward: '50.000 VNĐ',
    progress: 1,
    total: 1,
    completed: true,
    badge: '✅',
  },
  {
    id: 'quest_002',
    title: 'Bán sản phẩm đầu tiên',
    description: 'Chia sẻ link và có đơn hàng đầu tiên',
    reward: 'Mở khóa "Dashboard Nâng cao"',
    progress: 1,
    total: 1,
    completed: true,
    badge: '🎯',
  },
  {
    id: 'quest_003',
    title: 'Mời 3 người tham gia',
    description: 'Giới thiệu 3 người mới đăng ký qua link của bạn',
    reward: '200.000 VNĐ + Huy hiệu "Người mở đường"',
    progress: 2,
    total: 3,
    completed: false,
    badge: '🚀',
  },
  {
    id: 'quest_004',
    title: 'Đạt 10 đơn hàng',
    description: 'Bán thành công 10 sản phẩm trong tháng đầu',
    reward: 'Mở khóa cấp "Gold" + Bonus 500.000 VNĐ',
    progress: 7,
    total: 10,
    completed: false,
    badge: '🏆',
  },
  {
    id: 'quest_005',
    title: 'Học 5 bài đào tạo',
    description: 'Hoàn thành 5 bài học về kỹ năng bán hàng',
    reward: 'Certificate + Mở khóa "Live Chat với Mentor"',
    progress: 3,
    total: 5,
    completed: false,
    badge: '📚',
  },
];

// ===== HELPER FUNCTIONS =====

/**
 * Calculate tax for withdrawal (Auto-Tax Logic)
 * Rule: 10% TNCN if amount > 2,000,000 VNĐ
 */
export function calculateWithdrawalTax(amount: number): {
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  taxRate: number;
} {
  const TAX_THRESHOLD = 2_000_000;
  const TAX_RATE = 0.1; // 10%

  if (amount > TAX_THRESHOLD) {
    const taxAmount = Math.round(amount * TAX_RATE);
    return {
      grossAmount: amount,
      taxAmount,
      netAmount: amount - taxAmount,
      taxRate: TAX_RATE,
    };
  }

  return {
    grossAmount: amount,
    taxAmount: 0,
    netAmount: amount,
    taxRate: 0,
  };
}

/**
 * Format currency to VNĐ
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Calculate 30-Day Challenge completion percentage
 */
export function getChallengeProgress(): number {
  const completedQuests = quests.filter(q => q.completed).length;
  return Math.round((completedQuests / quests.length) * 100);
}

/**
 * Generate shareable referral link
 */
export function getReferralLink(user: User): string {
  return `https://wellnexus.vn/join/${user.referralCode}`;
}

/**
 * Get user level color
 */
export function getLevelColor(level: User['level']): string {
  const colors = {
    Bronze: 'text-amber-600',
    Silver: 'text-gray-400',
    Gold: 'text-yellow-500',
    Diamond: 'text-cyan-400',
  };
  return colors[level];
}
