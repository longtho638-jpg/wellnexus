/**
 * WellNexus Shop Page
 * Features: ANIMA 119 Product Display, Share to Sell, Direct Purchase
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  ShoppingCart,
  DollarSign,
  Package,
  Sparkles,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { products, formatCurrency } from '../data/mockData';

export default function Shop() {
  const [shareModal, setShareModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);

  const handleShare = (product: typeof products[0]) => {
    setSelectedProduct(product);
    setShareModal(true);

    // Web Share API (for mobile)
    if (navigator.share) {
      navigator
        .share({
          title: `${product.name} - WellNexus`,
          text: `🌿 ${product.description}\n💰 Giá chỉ ${formatCurrency(product.price)}\n🎁 Bạn nhận ${formatCurrency(product.commission)} hoa hồng!`,
          url: `https://wellnexus.vn/product/${product.id}`,
        })
        .then(() => console.log('Shared successfully'))
        .catch(() => setShareModal(true)); // Fallback to modal if share fails
    }
  };

  const handleBuyNow = (product: typeof products[0]) => {
    alert(
      `🛒 Chức năng "Mua ngay" đang được phát triển!\n\nSản phẩm: ${product.name}\nGiá: ${formatCurrency(product.price)}\n\n✨ MVP Demo: Tính năng checkout sẽ sớm ra mắt!`
    );
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-wellnexus-primary mb-2">
          Cửa hàng 🛍️
        </h1>
        <p className="text-gray-600">
          Chọn sản phẩm để{' '}
          <span className="font-semibold text-wellnexus-accent">
            chia sẻ & kiếm hoa hồng
          </span>{' '}
          hoặc mua cho bản thân
        </p>
      </motion.div>

      {/* Featured Product Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 bg-gradient-to-br from-wellnexus-accent/20 to-wellnexus-primary/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-wellnexus-accent animate-pulse" />
          <span className="text-sm font-bold text-wellnexus-primary">
            SẢN PHẨM NỔI BẬT
          </span>
        </div>
        <p className="text-sm text-gray-700">
          <strong>ANIMA 119</strong> đang là best-seller với{' '}
          <span className="text-wellnexus-accent font-semibold">
            25% hoa hồng trực tiếp
          </span>
          !
        </p>
      </motion.div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass-card overflow-hidden hover:shadow-glass-hover transition-shadow"
          >
            {/* Product Image */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-wellnexus-accent text-wellnexus-primary px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                25% Hoa hồng
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="inline-block bg-white/90 text-wellnexus-primary px-3 py-1 rounded-full text-xs font-semibold">
                  {product.category === 'health' && '🩺 Sức khỏe'}
                  {product.category === 'wellness' && '🧘 Wellness'}
                  {product.category === 'beauty' && '💄 Làm đẹp'}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-5">
              <h3 className="text-2xl font-bold text-wellnexus-primary mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Price & Commission */}
              <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-wellnexus-primary/5 to-wellnexus-accent/5 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Giá bán</p>
                  <p className="text-2xl font-bold text-wellnexus-primary">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1 flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3" />
                    Bạn nhận
                  </p>
                  <p className="text-xl font-bold text-wellnexus-accent">
                    {formatCurrency(product.commission)}
                  </p>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-4 text-sm">
                <Package className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">
                  Còn <strong>{product.stock}</strong> sản phẩm
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => handleShare(product)}
                  className="btn-accent flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="w-5 h-5" />
                  <span>Bán ngay</span>
                </motion.button>
                <motion.button
                  onClick={() => handleBuyNow(product)}
                  className="btn-outline flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Mua ngay</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShareModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="glass-card max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-wellnexus-primary">
                    Link đã tạo!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chia sẻ ngay để kiếm hoa hồng
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Link giới thiệu của bạn:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`https://wellnexus.vn/product/${selectedProduct.id}?ref=WELLNEXUS-MINHANH`}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white rounded text-xs font-mono border border-gray-200"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://wellnexus.vn/product/${selectedProduct.id}?ref=WELLNEXUS-MINHANH`
                      );
                      alert('✓ Đã sao chép link!');
                    }}
                    className="px-3 py-2 bg-wellnexus-accent text-wellnexus-primary rounded font-semibold text-sm hover:bg-wellnexus-accent-dark transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold text-gray-700">
                  💰 Bạn sẽ nhận:
                </p>
                <p className="text-2xl font-bold text-wellnexus-accent">
                  {formatCurrency(selectedProduct.commission)}
                </p>
                <p className="text-xs text-gray-500">
                  khi khách hàng mua qua link của bạn
                </p>
              </div>

              <button
                onClick={() => setShareModal(false)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Chia sẻ trên mạng xã hội
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
