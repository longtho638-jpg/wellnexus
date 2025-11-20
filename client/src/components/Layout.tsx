/**
 * WellNexus Layout Component
 * Mobile-first design with Bottom Navigation (thumb-friendly)
 */

import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, BookOpen, Wallet, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/shop', icon: ShoppingBag, label: 'Cửa hàng' },
    { path: '/learn', icon: BookOpen, label: 'Đào tạo' },
    { path: '/wallet', icon: Wallet, label: 'Ví tiền' },
    { path: '/profile', icon: User, label: 'Cá nhân' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-wellnexus-bg">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-wellnexus-primary">
                WellNexus
              </h1>
              <p className="text-xs text-gray-500">Vững tin Vươn tầm</p>
            </div>
          </div>

          {/* Notification Bell (future feature) */}
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-wellnexus-accent rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation (Mobile-First, Thumb-Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-gray-200">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200"
              >
                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-wellnexus-primary/10 rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className="relative z-10">
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      active
                        ? 'text-wellnexus-primary'
                        : 'text-gray-400'
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>

                {/* Label */}
                <span
                  className={`relative z-10 text-xs font-medium transition-colors ${
                    active
                      ? 'text-wellnexus-primary'
                      : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Dot */}
                {active && (
                  <motion.div
                    className="absolute -top-1 w-1 h-1 bg-wellnexus-accent rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
