/**
 * WellNexus Profile Page
 * Features: User info, level, team stats, settings
 */

import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { currentUser, formatCurrency } from '../data/mockData';

const settingsMenu = [
  {
    icon: Settings,
    label: 'Cài đặt tài khoản',
    description: 'Thay đổi thông tin cá nhân',
  },
  {
    icon: Bell,
    label: 'Thông báo',
    description: 'Quản lý thông báo ứng dụng',
  },
  {
    icon: Shield,
    label: 'Bảo mật',
    description: 'Đổi mật khẩu và xác thực 2FA',
  },
  {
    icon: HelpCircle,
    label: 'Trung tâm trợ giúp',
    description: 'FAQ và hướng dẫn sử dụng',
  },
  {
    icon: FileText,
    label: 'Điều khoản & Chính sách',
    description: 'Quy định sử dụng dịch vụ',
  },
];

export default function Profile() {
  const joinDuration = Math.floor(
    (new Date().getTime() - new Date(currentUser.joinedDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-wellnexus-primary mb-2">
          Cá nhân 👤
        </h1>
        <p className="text-gray-600">Thông tin tài khoản và cài đặt</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 bg-gradient-brand relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
              <span className="text-3xl font-bold text-white">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {currentUser.name}
              </h2>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white`}
              >
                <Award className="w-4 h-4" />
                Cấp {currentUser.level}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-white/80 mx-auto mb-1" />
              <p className="text-white/80 text-xs mb-1">Tổng thu nhập</p>
              <p className="text-white font-bold text-sm">
                {formatCurrency(currentUser.totalEarnings).replace('₫', '')}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-white/80 mx-auto mb-1" />
              <p className="text-white/80 text-xs mb-1">Đội nhóm</p>
              <p className="text-white font-bold text-lg">
                {currentUser.teamSize}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <Calendar className="w-5 h-5 text-white/80 mx-auto mb-1" />
              <p className="text-white/80 text-xs mb-1">Tham gia</p>
              <p className="text-white font-bold text-sm">
                {joinDuration} ngày
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-bold text-wellnexus-primary mb-4">
          Thông tin cá nhân
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-wellnexus-primary" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-wellnexus-primary" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
              <p className="font-medium text-gray-900">{currentUser.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <UserIcon className="w-5 h-5 text-wellnexus-primary" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Mã giới thiệu</p>
              <p className="font-medium text-gray-900 font-mono text-sm">
                {currentUser.referralCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-wellnexus-primary" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Ngày tham gia</p>
              <p className="font-medium text-gray-900">
                {new Date(currentUser.joinedDate).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-bold text-wellnexus-primary mb-4">
          Cài đặt & Hỗ trợ
        </h3>

        <div className="space-y-2">
          {settingsMenu.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() =>
                alert(
                  `🚧 MVP Demo: Tính năng "${item.label}" đang được phát triển!`
                )
              }
            >
              <div className="p-2 bg-wellnexus-primary/10 rounded-lg">
                <item.icon className="w-5 h-5 text-wellnexus-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={() =>
            alert('🚧 MVP Demo: Tính năng đăng xuất đang được phát triển!')
          }
          className="w-full flex items-center justify-center gap-2 p-4 glass-card text-red-600 font-semibold hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </motion.div>

      {/* App Version */}
      <p className="text-center text-xs text-gray-400">
        WellNexus MVP v1.0.0 • Made with ❤️ for Vibe Coding
      </p>
    </div>
  );
}
