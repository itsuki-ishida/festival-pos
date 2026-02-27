'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, Category, Order, CartItem, StoreState, PaymentMethod, SalesSummary } from '@/types';
import { defaultProducts, defaultCategories } from '@/data/sampleData';

const STORAGE_KEY = 'festival-pos-data';

function loadFromStorage(): StoreState {
  if (typeof window === 'undefined') {
    return {
      products: defaultProducts,
      categories: defaultCategories,
      orders: [],
    };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        products: parsed.products || defaultProducts,
        categories: parsed.categories || defaultCategories,
        orders: parsed.orders || [],
      };
    } catch {
      return {
        products: defaultProducts,
        categories: defaultCategories,
        orders: [],
      };
    }
  }

  return {
    products: defaultProducts,
    categories: defaultCategories,
    orders: [],
  };
}

export function useStore() {
  const [state, setState] = useState<StoreState>(loadFromStorage);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // クライアントサイドで初期化完了をマーク（SSRハイドレーション対応）
  useEffect(() => {
    // eslint-disable-next-line
    setIsInitialized(true);
  }, []);

  // 状態変更時にローカルストレージに保存
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isInitialized]);

  // カートに商品を追加
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  // カートから商品を削除
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  // カート内の商品数量を更新
  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  // カートをクリア
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // カートの小計を計算
  const getCartSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // 注文を確定
  const completeOrder = useCallback((paymentMethod: PaymentMethod, receivedAmount?: number) => {
    const subtotal = getCartSubtotal();
    const change = paymentMethod === 'cash' && receivedAmount ? receivedAmount - subtotal : undefined;

    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      items: [...cart],
      subtotal,
      paymentMethod,
      receivedAmount: paymentMethod === 'cash' ? receivedAmount : undefined,
      change,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      orders: [...prev.orders, order],
    }));

    clearCart();
    return order;
  }, [cart, getCartSubtotal, clearCart]);

  // 注文を取り消し
  const cancelOrder = useCallback((orderId: string) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.filter((order) => order.id !== orderId),
    }));
  }, []);

  // 商品を追加
  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `product-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };
    setState((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
    return newProduct;
  }, []);

  // 商品を更新
  const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  // 商品を削除
  const deleteProduct = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
  }, []);

  // カテゴリを追加
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: `category-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    return newCategory;
  }, []);

  // 売上サマリーを取得
  const getSalesSummary = useCallback((date?: Date): SalesSummary => {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayOrders = state.orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });

    const byProduct: Map<string, { productName: string; quantity: number; total: number }> = new Map();
    const byHour: Map<number, { sales: number; orders: number }> = new Map();

    // 時間帯の初期化（9時〜18時）
    for (let h = 9; h <= 18; h++) {
      byHour.set(h, { sales: 0, orders: 0 });
    }

    let totalItems = 0;
    const byPaymentMethod = { cash: 0, paypay: 0, other_electronic: 0 };

    dayOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      const hourData = byHour.get(hour) || { sales: 0, orders: 0 };
      hourData.sales += order.subtotal;
      hourData.orders += 1;
      byHour.set(hour, hourData);

      byPaymentMethod[order.paymentMethod] += order.subtotal;

      order.items.forEach((item) => {
        totalItems += item.quantity;
        const existing = byProduct.get(item.product.id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.total += item.product.price * item.quantity;
        } else {
          byProduct.set(item.product.id, {
            productName: item.product.name,
            quantity: item.quantity,
            total: item.product.price * item.quantity,
          });
        }
      });
    });

    return {
      totalSales: dayOrders.reduce((sum, order) => sum + order.subtotal, 0),
      totalOrders: dayOrders.length,
      totalItems,
      byPaymentMethod,
      byProduct: Array.from(byProduct.entries()).map(([productId, data]) => ({
        productId,
        ...data,
      })).sort((a, b) => b.total - a.total),
      byHour: Array.from(byHour.entries()).map(([hour, data]) => ({
        hour,
        ...data,
      })).sort((a, b) => a.hour - b.hour),
    };
  }, [state.orders]);

  // データをリセット
  const resetAllData = useCallback(() => {
    setState({
      products: defaultProducts,
      categories: defaultCategories,
      orders: [],
    });
    setCart([]);
  }, []);

  // 注文履歴をクリア（商品データは保持）
  const clearOrders = useCallback(() => {
    setState((prev) => ({
      ...prev,
      orders: [],
    }));
  }, []);

  return {
    // 状態
    products: state.products,
    categories: state.categories,
    orders: state.orders,
    cart,
    isInitialized,

    // カート操作
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartSubtotal,

    // 注文操作
    completeOrder,
    cancelOrder,

    // 商品操作
    addProduct,
    updateProduct,
    deleteProduct,

    // カテゴリ操作
    addCategory,

    // 集計
    getSalesSummary,

    // データ管理
    resetAllData,
    clearOrders,
  };
}
