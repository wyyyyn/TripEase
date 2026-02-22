// ──────────────────────────────────────────────
// C 端公开接口的类型定义
//
// 这些类型专门给"不需要登录"的公开接口用：
//   - 酒店搜索列表（轻量摘要，不含完整房间数据）
//   - 分页参数和结果
//   - 城市 + 地标
// ──────────────────────────────────────────────

import type { BadgeColor } from './hotel.js';

// ===== 分页 =====

/** 通用分页结果包装器，类比：翻书时每一页的信息 */
export interface PaginatedResult<T> {
  items: T[];       // 当前页的数据
  total: number;    // 总共有多少条
  page: number;     // 当前第几页
  limit: number;    // 每页几条
  totalPages: number; // 总共几页
}

// ===== 酒店搜索 =====

/** 搜索/筛选参数 */
export interface PublicSearchParams {
  keyword?: string;       // 关键词搜索（酒店名 / 英文名 / 地址）
  minPrice?: number;      // 最低房价
  maxPrice?: number;      // 最高房价
  minRating?: number;     // 最低评分
  starRating?: number;    // 星级（精确匹配）
  tags?: string[];        // 按标签筛选
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'default';
  page?: number;          // 页码，默认 1
  limit?: number;         // 每页条数，默认 20
}

/**
 * 酒店列表摘要（给列表页用，比完整详情轻量很多）
 *
 * 类比：你在携程搜索结果看到的"一张卡片"就是一个 Summary，
 * 只有首图、价格、评分等关键信息，不包含所有房型详情。
 */
export interface PublicHotelSummary {
  id: number;
  name: string;
  address: string;
  starRating: number;
  distanceFromCenter: string | null;
  pricePerNight: number | null;     // 酒店主表上的参考价
  originalPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  badge: string | null;
  badgeColor: BadgeColor | null;
  firstImage: string | null;        // 只取第一张图（列表页够用了）
  tags: string[];                   // 标签数组
  roomCount: number;                // 房型数量
  lowestRoomPrice: number | null;   // 最低房价（从 rooms 表算）
  hasBreakfast: boolean;            // 是否有早餐（方便前端筛选）
  hasFreeCancel: boolean;           // 是否免费取消（方便前端筛选）
}

// ===== 城市 =====

/** 城市地标 */
export interface LandmarkInfo {
  id: number;
  name: string;
  label: string;
  icon: string;
}

/** 城市（含地标列表） */
export interface CityWithLandmarks {
  id: number;
  name: string;
  pinyin: string;
  isHot: boolean;
  sortOrder: number;
  landmarks: LandmarkInfo[];
}
