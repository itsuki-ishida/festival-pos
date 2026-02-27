import { Category, Product } from '@/types';

export const defaultCategories: Category[] = [
  { id: 'food', name: 'フード', color: '#ef4444' },
  { id: 'drink', name: 'ドリンク', color: '#3b82f6' },
  { id: 'dessert', name: 'デザート', color: '#ec4899' },
  { id: 'set', name: 'セット', color: '#22c55e' },
];

export const defaultProducts: Product[] = [
  // フード
  { id: 'yakisoba', name: '焼きそば', price: 300, categoryId: 'food', isAvailable: true },
  { id: 'takoyaki', name: 'たこ焼き（6個）', price: 350, categoryId: 'food', isAvailable: true },
  { id: 'frankfurter', name: 'フランクフルト', price: 200, categoryId: 'food', isAvailable: true },
  { id: 'karaage', name: '唐揚げ（5個）', price: 300, categoryId: 'food', isAvailable: true },
  { id: 'poteto', name: 'フライドポテト', price: 250, categoryId: 'food', isAvailable: true },
  { id: 'onigiri', name: 'おにぎり', price: 150, categoryId: 'food', isAvailable: true },

  // ドリンク
  { id: 'ramune', name: 'ラムネ', price: 150, categoryId: 'drink', isAvailable: true },
  { id: 'cola', name: 'コーラ', price: 150, categoryId: 'drink', isAvailable: true },
  { id: 'orange', name: 'オレンジジュース', price: 150, categoryId: 'drink', isAvailable: true },
  { id: 'tea', name: 'お茶', price: 120, categoryId: 'drink', isAvailable: true },
  { id: 'water', name: '水', price: 100, categoryId: 'drink', isAvailable: true },

  // デザート
  { id: 'crepe', name: 'クレープ', price: 400, categoryId: 'dessert', isAvailable: true },
  { id: 'watagashi', name: 'わたがし', price: 200, categoryId: 'dessert', isAvailable: true },
  { id: 'kakigori', name: 'かき氷', price: 250, categoryId: 'dessert', isAvailable: true },
  { id: 'cookie', name: '手作りクッキー', price: 150, categoryId: 'dessert', isAvailable: true },

  // セット
  { id: 'set_a', name: 'セットA（焼きそば＋ドリンク）', price: 400, categoryId: 'set', isAvailable: true },
  { id: 'set_b', name: 'セットB（たこ焼き＋ドリンク）', price: 450, categoryId: 'set', isAvailable: true },
];
