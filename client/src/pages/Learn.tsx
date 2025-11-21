/**
 * WellNexus Learn Page
 * Features: Training courses, sales skills, mentor access
 */

import { motion } from 'framer-motion';
import { Play, Lock, CheckCircle, Award, Star } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Khởi đầu với WellNexus',
    description: 'Tìm hiểu nền tảng và cách bắt đầu kiếm tiền',
    duration: '15 phút',
    lessons: 3,
    completed: true,
    locked: false,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
  },
  {
    id: 2,
    title: 'Kỹ năng bán hàng cơ bản',
    description: 'Học cách tư vấn sản phẩm và chốt đơn hiệu quả',
    duration: '30 phút',
    lessons: 5,
    completed: true,
    locked: false,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  },
  {
    id: 3,
    title: 'Marketing trên mạng xã hội',
    description: 'Chiến lược bán hàng qua Facebook, Zalo, TikTok',
    duration: '45 phút',
    lessons: 7,
    completed: true,
    locked: false,
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
  },
  {
    id: 4,
    title: 'Xây dựng đội nhóm hiệu quả',
    description: 'Cách mời và quản lý team để tăng thu nhập thụ động',
    duration: '60 phút',
    lessons: 8,
    completed: false,
    locked: false,
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
  },
  {
    id: 5,
    title: 'Chăm sóc khách hàng chuyên nghiệp',
    description: 'Giữ chân khách cũ và tạo khách hàng trung thành',
    duration: '40 phút',
    lessons: 6,
    completed: false,
    locked: false,
    thumbnail: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=400',
  },
  {
    id: 6,
    title: 'Chiến lược tăng doanh số x10',
    description: 'Bí quyết của Top Seller WellNexus',
    duration: '90 phút',
    lessons: 10,
    completed: false,
    locked: true,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    unlockCondition: 'Đạt cấp Gold để mở khóa',
  },
];

export default function Learn() {
  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-wellnexus-primary mb-2">
          Đào tạo 📚
        </h1>
        <p className="text-gray-600">
          Nâng cao kỹ năng để{' '}
          <span className="font-semibold text-wellnexus-accent">
            kiếm nhiều hơn
          </span>
        </p>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 bg-gradient-to-br from-wellnexus-primary/10 to-wellnexus-accent/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-wellnexus-accent" />
            <h3 className="text-lg font-bold text-wellnexus-primary">
              Tiến độ học tập
            </h3>
          </div>
          <span className="text-2xl font-bold text-wellnexus-accent">
            3/5
          </span>
        </div>

        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-wellnexus-accent to-wellnexus-accent-light transition-all duration-500"
            style={{ width: '60%' }}
          />
        </div>

        <p className="text-sm text-gray-600">
          Hoàn thành thêm <strong>2 khóa học</strong> để nhận{' '}
          <strong className="text-wellnexus-accent">Certificate</strong> và mở
          khóa Live Chat với Mentor
        </p>
      </motion.div>

      {/* Courses Grid */}
      <div className="space-y-4">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`glass-card overflow-hidden ${
              course.locked
                ? 'opacity-70'
                : 'hover:shadow-glass-hover cursor-pointer'
            }`}
          >
            <div className="flex gap-4 p-4">
              {/* Thumbnail */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.locked ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                ) : course.completed ? (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                ) : null}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-wellnexus-primary mb-1 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {course.lessons} bài học
                  </span>
                  <span>•</span>
                  <span>{course.duration}</span>
                </div>

                {course.locked && (
                  <p className="text-xs text-wellnexus-accent font-semibold mt-2">
                    🔒 {course.unlockCondition}
                  </p>
                )}

                {course.completed && (
                  <div className="flex items-center gap-1 text-green-600 text-xs font-semibold mt-2">
                    <CheckCircle className="w-3 h-3" />
                    Đã hoàn thành
                  </div>
                )}
              </div>

              {/* Action */}
              {!course.locked && !course.completed && (
                <div className="flex items-center">
                  <button className="px-4 py-2 bg-wellnexus-accent text-wellnexus-primary font-semibold rounded-lg hover:bg-wellnexus-accent-dark transition-colors">
                    Học ngay
                  </button>
                </div>
              )}

              {course.completed && (
                <div className="flex items-center">
                  <button className="px-4 py-2 border-2 border-wellnexus-primary text-wellnexus-primary font-semibold rounded-lg hover:bg-wellnexus-primary hover:text-white transition-colors">
                    Xem lại
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mentor Access CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card p-6 bg-gradient-brand relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-6 h-6 text-yellow-300" />
            <h3 className="text-xl font-bold text-white">
              Cần hỗ trợ từ Mentor?
            </h3>
          </div>
          <p className="text-white/90 text-sm mb-4">
            Hoàn thành 5 khóa học để mở khóa tính năng Live Chat 1-1 với các
            Mentor hàng đầu của WellNexus
          </p>
          <button
            disabled
            className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold opacity-60 cursor-not-allowed"
          >
            🔒 Chưa mở khóa (3/5 khóa)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
