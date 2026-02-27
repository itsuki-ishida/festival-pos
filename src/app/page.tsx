'use client';

import { useState } from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import { PaymentModal } from '@/components/PaymentModal';
import { Category } from '@/types';

export default function POSPage() {
  const {
    products,
    categories,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartSubtotal,
    isInitialized,
  } = useStoreContext();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-xl text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory && p.isAvailable)
    : products.filter((p) => p.isAvailable);

  const subtotal = getCartSubtotal();

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* 左側: 商品選択エリア */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* カテゴリフィルター */}
        <div className="flex space-x-2 mb-4 flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {categories.map((category: Category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-colors`}
              style={{
                backgroundColor:
                  selectedCategory === category.id ? category.color : 'white',
                color: selectedCategory === category.id ? 'white' : '#374151',
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 商品グリッド */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-shadow text-left border-l-4"
                style={{ borderLeftColor: getCategoryColor(product.categoryId) }}
              >
                <div className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </div>
                <div className="text-xl font-bold text-blue-600">
                  ¥{product.price.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 右側: カート */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        <div className="p-4 bg-gray-800 text-white">
          <h2 className="text-xl font-bold">カート</h2>
        </div>

        {/* カートアイテム */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              商品を選択してください
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900 flex-1">
                      {item.product.name}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                      >
                        ＋
                      </button>
                    </div>
                    <div className="font-bold text-gray-900">
                      ¥{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 合計・操作エリア */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg text-gray-600">合計</span>
            <span className="text-3xl font-bold text-gray-900">
              ¥{subtotal.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              お会計へ
            </button>
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              カートをクリア
            </button>
          </div>
        </div>
      </div>

      {/* 決済モーダル */}
      {showPayment && (
        <PaymentModal
          subtotal={subtotal}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
