'use client';

import { useState } from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import { PaymentModal } from '@/components/PaymentModal';
import { Category } from '@/types';

const categoryIcons: Record<string, string> = {
  food: '🍜',
  drink: '🥤',
  dessert: '🍰',
  set: '🎁',
};

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
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-slate-600 font-medium">読み込み中...</div>
        </div>
      </div>
    );
  }

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory && p.isAvailable)
    : products.filter((p) => p.isAvailable);

  const subtotal = getCartSubtotal();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const getCategoryIcon = (categoryId: string) => {
    return categoryIcons[categoryId] || '📦';
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-slate-100 via-slate-50 to-white">
      {/* 左側: 商品選択エリア */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* カテゴリフィルター */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-400/30'
                : 'bg-white text-slate-600 hover:bg-slate-50 shadow-md hover:shadow-lg'
            }`}
          >
            ✨ すべて
          </button>
          {categories.map((category: Category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              style={{
                background:
                  selectedCategory === category.id
                    ? `linear-gradient(135deg, ${category.color}, ${category.color}dd)`
                    : 'white',
                color: selectedCategory === category.id ? 'white' : '#475569',
                boxShadow:
                  selectedCategory === category.id
                    ? `0 10px 20px -5px ${category.color}50`
                    : undefined,
              }}
            >
              {getCategoryIcon(category.id)} {category.name}
            </button>
          ))}
        </div>

        {/* 商品グリッド */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const color = getCategoryColor(product.categoryId);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 text-left overflow-hidden"
                >
                  {/* カテゴリカラーのアクセント */}
                  <div
                    className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                  />

                  {/* カテゴリアイコン */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${color}15` }}
                  >
                    {getCategoryIcon(product.categoryId)}
                  </div>

                  {/* 商品名 */}
                  <div className="font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">
                    {product.name}
                  </div>

                  {/* 価格 */}
                  <div
                    className="text-2xl font-black"
                    style={{ color }}
                  >
                    ¥{product.price.toLocaleString()}
                  </div>

                  {/* ホバー時の追加エフェクト */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"
                    style={{ background: color }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 右側: カート */}
      <div className="w-[380px] bg-white shadow-2xl flex flex-col rounded-l-3xl overflow-hidden">
        {/* カートヘッダー */}
        <div className="p-5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                🛒
              </div>
              <h2 className="text-xl font-bold">カート</h2>
            </div>
            {cartItemCount > 0 && (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                {cartItemCount}点
              </div>
            )}
          </div>
        </div>

        {/* カートアイテム */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="text-6xl mb-4 opacity-50">🛒</div>
              <div className="text-lg font-medium">カートは空です</div>
              <div className="text-sm mt-1">商品をタップして追加</div>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-lg">
                        {getCategoryIcon(item.product.categoryId)}
                      </span>
                      <div className="font-semibold text-slate-800 leading-tight">
                        {item.product.name}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-9 h-9 rounded-full bg-white shadow-sm hover:shadow flex items-center justify-center font-bold text-slate-600 hover:text-slate-900 transition-all"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-9 h-9 rounded-full bg-white shadow-sm hover:shadow flex items-center justify-center font-bold text-slate-600 hover:text-slate-900 transition-all"
                      >
                        ＋
                      </button>
                    </div>
                    <div className="font-bold text-lg text-slate-800">
                      ¥{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 合計・操作エリア */}
        <div className="p-5 bg-gradient-to-t from-slate-100 to-white border-t border-slate-200">
          <div className="flex justify-between items-center mb-5">
            <span className="text-lg text-slate-500 font-medium">合計金額</span>
            <div className="text-right">
              <span className="text-4xl font-black bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                ¥{subtotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl font-bold text-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              💰 お会計へ
            </button>
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-semibold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
