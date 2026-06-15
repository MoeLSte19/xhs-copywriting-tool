/** 6 大分类常量定义 */
import type { CategoryTemplate } from '../types/index';

export const CATEGORIES: CategoryTemplate[] = [
  { id: 'beauty', name: '美妆', icon: '💄', description: '护肤、彩妆、美发', promptSuffix: '美妆护肤类' },
  { id: 'food', name: '美食', icon: '🍜', description: '餐厅、食谱、零食', promptSuffix: '美食探店类' },
  { id: 'fashion', name: '穿搭', icon: '👗', description: '穿搭、搭配、时尚', promptSuffix: '穿搭时尚类' },
  { id: 'travel', name: '旅行', icon: '✈️', description: '旅行、景点、攻略', promptSuffix: '旅行攻略类' },
  { id: 'shopping', name: '好物种草', icon: '🛍️', description: '好物推荐、种草', promptSuffix: '好物种草类' },
  { id: 'store', name: '探店', icon: '🏪', description: '店铺探店、体验', promptSuffix: '探店体验类' },
];
