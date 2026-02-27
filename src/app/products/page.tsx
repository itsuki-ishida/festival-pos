'use client';

import { useState } from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import { Product } from '@/types';

export default function ProductsPage() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    resetAllData,
    isInitialized,
  } = useStoreContext();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    isAvailable: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(formData.price);
    if (!formData.name || isNaN(price) || !formData.categoryId) {
      alert('すべての項目を入力してください');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        price,
        categoryId: formData.categoryId,
        isAvailable: formData.isAvailable,
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: formData.name,
        price,
        categoryId: formData.categoryId,
        isAvailable: formData.isAvailable,
      });
      setShowAddForm(false);
    }

    setFormData({ name: '', price: '', categoryId: '', isAvailable: true });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price),
      categoryId: product.categoryId,
      isAvailable: product.isAvailable,
    });
    setShowAddForm(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('この商品を削除しますか？')) {
      deleteProduct(productId);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowAddForm(false);
    setFormData({ name: '', price: '', categoryId: '', isAvailable: true });
  };

  const handleResetAll = () => {
    if (window.confirm('すべてのデータ（商品・売上）をリセットしますか？この操作は取り消せません。')) {
      resetAllData();
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || '不明';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280';
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-xl text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 商品追加
          </button>
          <button
            onClick={handleResetAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            初期化
          </button>
        </div>
      </div>

      {/* 追加・編集フォーム */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingProduct ? '商品を編集' : '新しい商品を追加'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: 焼きそば"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格（円）
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: 300"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">販売中</span>
                </label>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingProduct ? '更新' : '追加'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 商品一覧 */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">商品名</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">カテゴリ</th>
              <th className="text-right py-3 px-4 text-gray-600 font-medium">価格</th>
              <th className="text-center py-3 px-4 text-gray-600 font-medium">状態</th>
              <th className="text-center py-3 px-4 text-gray-600 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: getCategoryColor(product.categoryId) }}
                    />
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {getCategoryName(product.categoryId)}
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900">
                  ¥{product.price.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => updateProduct(product.id, { isAvailable: !product.isAvailable })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {product.isAvailable ? '販売中' : '停止中'}
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* カテゴリ一覧 */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">カテゴリ</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="px-4 py-2 rounded-full text-white font-medium"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
