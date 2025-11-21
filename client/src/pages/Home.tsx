/**
 * WellNexus Home Dashboard
 * Features: Earnings Summary, 30-Day Challenge Progress, Referral Link
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Target,
  Copy,
  Check,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  currentUser,
  quests,
  formatCurrency,
  getChallengeProgress,
  getReferralLink,
  getLevelColor,
} from '../data/mockData';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const referralLink = getReferralLink(currentUser);
  const challengeProgress = getChallengeProgress();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-wellnexus-primary mb-1">
              Xin chào, {currentUser.name.split(' ').slice(-1)}! 👋
            </h2>
            <p className="text-gray-600">
              Hôm nay là ngày tuyệt vời để{' '}
              <span className="text-gradient font-semibold">Vươn tầm</span>
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(
                currentUser.level
              )} bg-gray-100`}
            >
              <Award className="w-4 h-4" />
              {currentUser.level}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Earnings Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 bg-gradient-brand relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />

        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Tổng thu nhập
          </p>
          <h3 className="text-4xl font-bold text-white mb-4">
            {formatCurrency(currentUser.totalEarnings)}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white/70 text-xs mb-1">Số dư khả dụng</p>
              <p className="text-white font-bold text-lg">
                {formatCurrency(currentUser.currentBalance)}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white/70 text-xs mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Đội nhóm
              </p>
              <p className="text-white font-bold text-lg">
                {currentUser.teamSize} người
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 30-Day Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-wellnexus-accent" />
            <h3 className="text-xl font-bold text-wellnexus-primary">
              Thử thách 30 ngày
            </h3>
          </div>
          <span className="text-2xl font-bold text-wellnexus-accent">
            {challengeProgress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar mb-6">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${challengeProgress}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Quest List */}
        <div className="space-y-3">
          {quests.map((quest, index) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                quest.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-wellnexus-accent'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{quest.badge}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-semibold ${
                        quest.completed
                          ? 'text-green-700 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {quest.title}
                    </h4>
                    {quest.completed && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {quest.description}
                  </p>

                  {/* Progress */}
                  {!quest.completed && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-wellnexus-accent transition-all duration-500"
                          style={{
                            width: `${(quest.progress / quest.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {quest.progress}/{quest.total}
                      </span>
                    </div>
                  )}

                  {/* Reward */}
                  <div className="flex items-center gap-1 text-wellnexus-accent text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    {quest.reward}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Referral Link - CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-bold text-wellnexus-primary mb-3">
          🔗 Link giới thiệu của bạn
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Chia sẻ link này để mời bạn bè cùng tham gia WellNexus và nhận hoa
          hồng 25%!
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-wellnexus-accent"
          />
          <motion.button
            onClick={handleCopyLink}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-wellnexus-accent text-wellnexus-primary hover:bg-wellnexus-accent-dark'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </motion.button>
        </div>

        {copied && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-green-600 font-medium"
          >
            ✓ Đã sao chép link!
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
