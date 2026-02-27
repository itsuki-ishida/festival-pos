'use client';

import { useState } from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import { PaymentMethod } from '@/types';

type PaymentModalProps = {
  subtotal: number;
  onClose: () => void;
};

const quickAmounts = [100, 500, 1000, 5000, 10000];

export function PaymentModal({ subtotal, onClose }: PaymentModalProps) {
  const { completeOrder } = useStoreContext();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [showComplete, setShowComplete] = useState(false);
  const [change, setChange] = useState<number>(0);

  const received = parseInt(receivedAmount) || 0;
  const canComplete = paymentMethod !== 'cash' || received >= subtotal;
  const calculatedChange = received - subtotal;

  const handleQuickAmount = (amount: number) => {
    setReceivedAmount((prev) => {
      const current = parseInt(prev) || 0;
      return String(current + amount);
    });
  };

  const handleNumpad = (value: string) => {
    if (value === 'C') {
      setReceivedAmount('');
    } else if (value === 'AC') {
      setReceivedAmount('');
    } else if (value === '00') {
      setReceivedAmount((prev) => prev + '00');
    } else {
      setReceivedAmount((prev) => prev + value);
    }
  };

  const handleComplete = () => {
    const order = completeOrder(paymentMethod, paymentMethod === 'cash' ? received : undefined);
    setChange(order.change || 0);
    setShowComplete(true);
  };

  const handleFinish = () => {
    onClose();
  };

  if (showComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">会計完了</h2>

          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">お支払い</span>
              <span className="font-medium">¥{subtotal.toLocaleString()}</span>
            </div>
            {paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">お預かり</span>
                  <span className="font-medium">¥{received.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-blue-600">
                  <span>お釣り</span>
                  <span>¥{change.toLocaleString()}</span>
                </div>
              </>
            )}
            {paymentMethod !== 'cash' && (
              <div className="flex justify-between">
                <span className="text-gray-600">支払方法</span>
                <span className="font-medium">
                  {paymentMethod === 'paypay' ? 'PayPay' : 'その他電子マネー'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-700 transition-colors"
          >
            次のお客様へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">お会計</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* 合計金額 */}
          <div className="text-center mb-6">
            <div className="text-gray-500 mb-1">お支払い金額</div>
            <div className="text-4xl font-bold text-gray-900">
              ¥{subtotal.toLocaleString()}
            </div>
          </div>

          {/* 支払方法選択 */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-2">支払方法</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                  paymentMethod === 'cash'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💴 現金
              </button>
              <button
                onClick={() => setPaymentMethod('paypay')}
                className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                  paymentMethod === 'paypay'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📱 PayPay
              </button>
              <button
                onClick={() => setPaymentMethod('other_electronic')}
                className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                  paymentMethod === 'other_electronic'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💳 その他
              </button>
            </div>
          </div>

          {/* 現金入力 */}
          {paymentMethod === 'cash' && (
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">お預かり金額</div>

              {/* 金額表示 */}
              <div className="bg-gray-100 rounded-xl p-4 mb-3 text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ¥{received.toLocaleString() || '0'}
                </div>
              </div>

              {/* クイック金額ボタン */}
              <div className="flex gap-2 mb-3">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                  >
                    +¥{amount.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* テンキー */}
              <div className="grid grid-cols-3 gap-2">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '00'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleNumpad(key)}
                    className={`py-4 rounded-xl font-bold text-xl transition-colors ${
                      key === 'C'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* お釣り表示 */}
              {received > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">お釣り</span>
                    <span className={`text-2xl font-bold ${calculatedChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ¥{calculatedChange.toLocaleString()}
                    </span>
                  </div>
                  {calculatedChange < 0 && (
                    <div className="text-red-500 text-sm mt-1">
                      ※ お預かり金額が不足しています
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 電子マネーの場合 */}
          {paymentMethod !== 'cash' && (
            <div className="mb-6 p-6 bg-blue-50 rounded-xl text-center">
              <div className="text-lg text-gray-700 mb-2">
                {paymentMethod === 'paypay' ? 'PayPay' : 'その他電子マネー'}での決済
              </div>
              <div className="text-gray-500">
                お客様の決済が完了したことを確認してから
                <br />
                「会計を確定」ボタンを押してください
              </div>
            </div>
          )}

          {/* 確定ボタン */}
          <button
            onClick={handleComplete}
            disabled={!canComplete}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            会計を確定
          </button>
        </div>
      </div>
    </div>
  );
}
