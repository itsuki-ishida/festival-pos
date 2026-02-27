'use client';

import { useState, useMemo } from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import { SalesChart } from '@/components/SalesChart';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function SalesPage() {
  const { orders, getSalesSummary, clearOrders, isInitialized } = useStoreContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const summary = useMemo(() => getSalesSummary(selectedDate), [getSalesSummary, selectedDate]);

  const todayOrders = useMemo(() => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    return orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, selectedDate]);

  const exportCSV = () => {
    const headers = ['注文ID', '日時', '商品', '数量', '小計', '決済方法'];
    const rows: string[][] = [];

    todayOrders.forEach((order) => {
      order.items.forEach((item, index) => {
        rows.push([
          index === 0 ? order.id : '',
          index === 0 ? format(new Date(order.createdAt), 'yyyy/MM/dd HH:mm:ss') : '',
          item.product.name,
          String(item.quantity),
          index === 0 ? String(order.subtotal) : '',
          index === 0 ? (order.paymentMethod === 'cash' ? '現金' : order.paymentMethod === 'paypay' ? 'PayPay' : 'その他電子') : '',
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_${format(selectedDate, 'yyyyMMdd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearOrders = () => {
    if (window.confirm('本当にすべての売上データを削除しますか？この操作は取り消せません。')) {
      clearOrders();
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-xl text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">売上管理</h1>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          />
          <button
            onClick={exportCSV}
            disabled={todayOrders.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            CSV出力
          </button>
          <button
            onClick={handleClearOrders}
            disabled={orders.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            データクリア
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="text-gray-500 text-sm mb-1">売上合計</div>
          <div className="text-3xl font-bold text-blue-600">
            ¥{summary.totalSales.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="text-gray-500 text-sm mb-1">注文件数</div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.totalOrders}件
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="text-gray-500 text-sm mb-1">販売個数</div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.totalItems}個
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="text-gray-500 text-sm mb-1">平均客単価</div>
          <div className="text-3xl font-bold text-green-600">
            ¥{summary.totalOrders > 0 ? Math.round(summary.totalSales / summary.totalOrders).toLocaleString() : 0}
          </div>
        </div>
      </div>

      {/* 決済方法別 */}
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">決済方法別売上</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-700 text-sm mb-1">💴 現金</div>
            <div className="text-2xl font-bold text-green-700">
              ¥{summary.byPaymentMethod.cash.toLocaleString()}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-red-700 text-sm mb-1">📱 PayPay</div>
            <div className="text-2xl font-bold text-red-700">
              ¥{summary.byPaymentMethod.paypay.toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-700 text-sm mb-1">💳 その他電子</div>
            <div className="text-2xl font-bold text-purple-700">
              ¥{summary.byPaymentMethod.other_electronic.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 時間帯別グラフ */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-4">時間帯別売上</h2>
          <SalesChart data={summary.byHour} />
        </div>

        {/* 商品別売上 */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-4">商品別売上（上位10件）</h2>
          {summary.byProduct.length === 0 ? (
            <div className="text-center text-gray-500 py-8">データがありません</div>
          ) : (
            <div className="space-y-3">
              {summary.byProduct.slice(0, 10).map((item, index) => (
                <div key={item.productId} className="flex items-center">
                  <div className="w-8 text-gray-400 font-medium">{index + 1}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.productName}</div>
                    <div className="text-sm text-gray-500">{item.quantity}個</div>
                  </div>
                  <div className="font-bold text-gray-900">
                    ¥{item.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 注文履歴 */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          注文履歴（{format(selectedDate, 'yyyy年M月d日', { locale: ja })}）
        </h2>
        {todayOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">注文がありません</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-gray-600 font-medium">時刻</th>
                  <th className="text-left py-3 px-2 text-gray-600 font-medium">商品</th>
                  <th className="text-right py-3 px-2 text-gray-600 font-medium">金額</th>
                  <th className="text-center py-3 px-2 text-gray-600 font-medium">決済</th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-900">
                      {format(new Date(order.createdAt), 'HH:mm:ss')}
                    </td>
                    <td className="py-3 px-2 text-gray-900">
                      {order.items.map((item) => `${item.product.name}×${item.quantity}`).join(', ')}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900">
                      ¥{order.subtotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentMethod === 'cash'
                            ? 'bg-green-100 text-green-700'
                            : order.paymentMethod === 'paypay'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {order.paymentMethod === 'cash' ? '現金' : order.paymentMethod === 'paypay' ? 'PayPay' : 'その他'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
