/**
 * WellNexus Wallet Page
 * Features: Balance Display, Transaction History, Auto-Tax Calculation (10% TNCN)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  ShoppingBag,
  AlertCircle,
  Calculator,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
  currentUser,
  transactions,
  formatCurrency,
  calculateWithdrawalTax,
} from '../data/mockData';

export default function Wallet() {
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const taxInfo = calculateWithdrawalTax(Number(withdrawAmount) || 0);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'commission':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'bonus':
        return <Gift className="w-5 h-5 text-wellnexus-accent" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
      case 'purchase':
        return <ShoppingBag className="w-5 h-5 text-gray-600" />;
      default:
        return <ArrowDownLeft className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'commission':
      case 'bonus':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (amount <= 0) {
      alert('❌ Vui lòng nhập số tiền hợp lệ!');
      return;
    }
    if (amount > currentUser.currentBalance) {
      alert('❌ Số dư không đủ để rút!');
      return;
    }

    const tax = calculateWithdrawalTax(amount);
    alert(
      `✅ MVP Demo: Yêu cầu rút tiền đã được gửi!\n\n💰 Số tiền yêu cầu: ${formatCurrency(
        amount
      )}\n📊 Thuế TNCN (10%): ${formatCurrency(tax.taxAmount)}\n💵 Bạn sẽ nhận: ${formatCurrency(
        tax.netAmount
      )}\n\n🚀 Tính năng thanh toán thực tế sắp ra mắt!`
    );
    setWithdrawModal(false);
    setWithdrawAmount('');
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-wellnexus-primary mb-2">
          Ví tiền 💰
        </h1>
        <p className="text-gray-600">
          Quản lý thu nhập và lịch sử giao dịch
        </p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 bg-gradient-brand relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <WalletIcon className="w-6 h-6 text-white/80" />
            <p className="text-white/80 text-sm">Số dư khả dụng</p>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6">
            {formatCurrency(currentUser.currentBalance)}
          </h2>

          <motion.button
            onClick={() => setWithdrawModal(true)}
            className="w-full bg-white text-wellnexus-primary font-bold py-4 rounded-wellnexus hover:bg-gray-100 active:scale-98 transition-all flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <ArrowUpRight className="w-5 h-5" />
            Rút tiền về ngân hàng
          </motion.button>
        </div>
      </motion.div>

      {/* Tax Info Alert */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 bg-yellow-50 border-l-4 border-wellnexus-accent"
      >
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-wellnexus-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-1">
              📊 Lưu ý về thuế TNCN
            </p>
            <p className="text-gray-700">
              Hệ thống <strong>tự động khấu trừ 10% thuế</strong> cho mỗi lần
              rút tiền <strong>trên 2.000.000 VNĐ</strong> theo quy định của
              pháp luật Việt Nam.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Tổng thu nhập</p>
          </div>
          <p className="text-2xl font-bold text-wellnexus-primary">
            {formatCurrency(currentUser.totalEarnings)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-wellnexus-accent" />
            <p className="text-sm text-gray-600">Tháng này</p>
          </div>
          <p className="text-2xl font-bold text-wellnexus-accent">
            {formatCurrency(2_250_000)}
          </p>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-bold text-wellnexus-primary mb-4">
          Lịch sử giao dịch
        </h3>

        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Icon */}
              <div className="p-2 bg-gray-100 rounded-full">
                {getTransactionIcon(tx.type)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {tx.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(tx.date)}
                    </p>
                  </div>
                  <p
                    className={`font-bold text-lg ${getTransactionColor(
                      tx.type
                    )}`}
                  >
                    {tx.type === 'withdrawal' ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>

                {/* Tax Info for Withdrawals */}
                {tx.type === 'withdrawal' && tx.taxDeducted !== undefined && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
                    {tx.taxDeducted > 0 ? (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span>Số tiền rút:</span>
                          <span>{formatCurrency(tx.amount)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span className="flex items-center gap-1">
                            <Calculator className="w-3 h-3" />
                            Thuế TNCN (10%):
                          </span>
                          <span>-{formatCurrency(tx.taxDeducted)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-green-600 pt-1 border-t">
                          <span>Thực nhận:</span>
                          <span>{formatCurrency(tx.netAmount!)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-600">
                        ✓ Không thu thuế (dưới 2.000.000 VNĐ)
                      </p>
                    )}
                  </div>
                )}

                {/* Status Badge */}
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {tx.status === 'completed' && '✓ Hoàn thành'}
                    {tx.status === 'pending' && '⏳ Đang xử lý'}
                    {tx.status === 'failed' && '✗ Thất bại'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {withdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setWithdrawModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="glass-card max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-wellnexus-primary mb-4">
                Rút tiền
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền muốn rút (VNĐ)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-wellnexus-accent focus:outline-none text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số dư khả dụng: {formatCurrency(currentUser.currentBalance)}
                </p>
              </div>

              {/* Tax Calculator */}
              {Number(withdrawAmount) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg mb-4 ${
                    taxInfo.taxAmount > 0
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-5 h-5 text-wellnexus-primary" />
                    <p className="font-semibold text-gray-900">
                      Chi tiết rút tiền
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền yêu cầu:</span>
                      <span className="font-semibold">
                        {formatCurrency(taxInfo.grossAmount)}
                      </span>
                    </div>

                    {taxInfo.taxAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Thuế TNCN (10%):</span>
                        <span className="font-semibold">
                          -{formatCurrency(taxInfo.taxAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-900">
                        Bạn sẽ nhận:
                      </span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(taxInfo.netAmount)}
                      </span>
                    </div>
                  </div>

                  {taxInfo.taxAmount === 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Không thu thuế (dưới 2.000.000 VNĐ)
                    </p>
                  )}
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setWithdrawModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-wellnexus font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 btn-primary"
                  disabled={!withdrawAmount || Number(withdrawAmount) <= 0}
                >
                  Xác nhận rút
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
