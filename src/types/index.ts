// 商品カテゴリ
export type Category = {
  id: string;
  name: string;
  color: string;
};

// 商品
export type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  stock?: number; // 在庫数（undefined = 無制限）
  isAvailable: boolean;
};

// カート内のアイテム
export type CartItem = {
  product: Product;
  quantity: number;
};

// 決済方法
export type PaymentMethod = 'cash' | 'paypay' | 'other_electronic';

// 注文
export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  paymentMethod: PaymentMethod;
  receivedAmount?: number; // 現金の場合の受け取り金額
  change?: number; // お釣り
  createdAt: string; // ISO 8601形式
};

// 売上サマリー
export type SalesSummary = {
  totalSales: number;
  totalOrders: number;
  totalItems: number;
  byPaymentMethod: {
    cash: number;
    paypay: number;
    other_electronic: number;
  };
  byProduct: {
    productId: string;
    productName: string;
    quantity: number;
    total: number;
  }[];
  byHour: {
    hour: number;
    sales: number;
    orders: number;
  }[];
};

// ストアの状態
export type StoreState = {
  products: Product[];
  categories: Category[];
  orders: Order[];
};
