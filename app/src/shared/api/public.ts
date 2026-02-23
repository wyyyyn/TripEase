// ============================================================
// 公开 API —— C 端用户查看酒店、城市的接口
// ============================================================
// 类比：这是"游客信息中心"的遥控器。
// 不需要登录就能使用：
//   搜索酒店     → searchPublicHotels
//   查看酒店详情 → getPublicHotelDetail
//   获取城市列表 → getCities
//
// 还包含两个"数据翻译器"（adapter）：
//   summaryToHotel  → 把后端列表摘要 → 前端 Hotel 格式
//   detailToHotel   → 把后端完整详情 → 前端 Hotel 格式
//
// 为什么需要翻译器？
// → 后端返回 id: number，前端期望 id: string
// → 后端用 null 表示"没有"，前端用 undefined
// → 后端字段名和前端不完全一样
// ============================================================

import { apiClient } from './client';
import type { Hotel, Room } from '../types/hotel';

// ---------- 后端响应类型 ----------

/** 后端统一响应格式 */
interface ApiResult<T> {
  ok: boolean;
  data: T;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** 酒店列表摘要（后端返回的精简版） */
export interface PublicHotelSummary {
  id: number;
  name: string;
  address: string;
  starRating: number;
  distanceFromCenter: string | null;
  pricePerNight: number | null;
  originalPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  badge: string | null;
  badgeColor: string | null;
  firstImage: string | null;
  tags: string[];
  roomCount: number;
  lowestRoomPrice: number | null;
  hasBreakfast: boolean;
  hasFreeCancel: boolean;
}

/** 酒店完整详情（后端返回的完整版） */
export interface PublicHotelDetail {
  id: number;
  ownerId: number;
  name: string;
  englishName: string | null;
  address: string;
  starRating: number;
  openDate: string | null;
  distanceFromCenter: string | null;
  pricePerNight: number | null;
  originalPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  badge: string | null;
  badgeColor: string | null;
  status: string;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  images: string[];
  tags: string[];
  amenities: string[];
  rooms: PublicRoomDetail[];
}

/** 房间详情（后端格式） */
interface PublicRoomDetail {
  id: number;
  name: string;
  description: string | null;
  pricePerNight: number;
  originalPrice: number | null;
  currency: string;
  image: string | null;
  bedType: string;
  size: string | null;
  badge: string | null;
  badgeColor: string | null;
  features: string[];
}

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

// ---------- 搜索参数 ----------

export interface SearchHotelsParams {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  starRating?: number;
  tags?: string[];
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'default';
  page?: number;
  limit?: number;
}

// ---------- API 函数 ----------

/**
 * 搜索已发布酒店（分页）
 *
 * 类比：在 TripEase 搜索框输入条件，点"搜索"，
 * 这个函数就帮你把搜索请求发给后端。
 */
export async function searchPublicHotels(
  params: SearchHotelsParams = {},
): Promise<PaginatedResponse<PublicHotelSummary>> {
  // 把参数拼成 URL query string
  const query = new URLSearchParams();

  if (params.keyword) query.set('keyword', params.keyword);
  if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params.minRating !== undefined) query.set('minRating', String(params.minRating));
  if (params.starRating !== undefined) query.set('starRating', String(params.starRating));
  if (params.tags && params.tags.length > 0) query.set('tags', params.tags.join(','));
  if (params.sort) query.set('sort', params.sort);
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));

  const qs = query.toString();
  const url = `/api/public/hotels${qs ? `?${qs}` : ''}`;

  const result = await apiClient<ApiResult<PaginatedResponse<PublicHotelSummary>>>(url);
  return result.data;
}

/**
 * 获取单个酒店详情（仅已发布）
 */
export async function getPublicHotelDetail(
  id: number,
): Promise<PublicHotelDetail> {
  const result = await apiClient<ApiResult<PublicHotelDetail>>(
    `/api/public/hotels/${id}`,
  );
  return result.data;
}

/**
 * 获取城市列表（含地标）
 */
export async function getCities(): Promise<CityWithLandmarks[]> {
  const result = await apiClient<ApiResult<CityWithLandmarks[]>>(
    '/api/public/cities',
  );
  return result.data;
}

// ---------- 数据适配器（翻译器） ----------

/**
 * 把后端的酒店列表摘要 → 前端 Hotel 类型
 *
 * 为什么需要这个函数？
 * → 前端已有的页面组件（HotelList.tsx）期望 Hotel 类型，
 *   但后端返回的 PublicHotelSummary 格式不完全一样。
 *   这个函数就是"翻译器"，把后端数据翻译成前端能理解的格式。
 *
 * 主要差异：
 *   - id: 后端 number → 前端 string
 *   - null → undefined（前端用 optional ? 而不是 null）
 *   - 列表摘要没有 rooms 和 amenities（详情页才需要）
 */
export function summaryToHotel(s: PublicHotelSummary): Hotel {
  return {
    id: String(s.id),
    name: s.name,
    rating: s.rating,
    reviewCount: s.reviewCount,
    address: s.address,
    distanceFromCenter: s.distanceFromCenter ?? '',
    pricePerNight: s.lowestRoomPrice ?? s.pricePerNight ?? 0,
    originalPrice: s.originalPrice ?? undefined,
    currency: s.currency,
    images: s.firstImage ? [s.firstImage] : [],
    tags: s.tags,
    amenities: [],       // 列表摘要不包含设施信息
    starRating: s.starRating,
    badge: s.badge ?? undefined,
    badgeColor: (s.badgeColor as Hotel['badgeColor']) ?? undefined,
    rooms: [],           // 列表摘要不包含房型信息
  };
}

/**
 * 把后端的酒店完整详情 → 前端 Hotel 类型
 *
 * 这个用于详情页（HotelDetail.tsx），包含完整的 rooms 和 amenities。
 */
export function detailToHotel(h: PublicHotelDetail): Hotel {
  return {
    id: String(h.id),
    name: h.name,
    rating: h.rating,
    reviewCount: h.reviewCount,
    address: h.address,
    distanceFromCenter: h.distanceFromCenter ?? '',
    pricePerNight: h.pricePerNight ?? 0,
    originalPrice: h.originalPrice ?? undefined,
    currency: h.currency,
    images: h.images,
    tags: h.tags,
    amenities: h.amenities,
    starRating: h.starRating,
    badge: h.badge ?? undefined,
    badgeColor: (h.badgeColor as Hotel['badgeColor']) ?? undefined,
    rooms: h.rooms.map(
      (r): Room => ({
        id: String(r.id),
        name: r.name,
        description: r.description ?? '',
        pricePerNight: r.pricePerNight,
        originalPrice: r.originalPrice ?? undefined,
        currency: r.currency,
        image: r.image ?? '',
        bedType: r.bedType,
        size: r.size ?? '',
        badge: r.badge ?? undefined,
        badgeColor: r.badgeColor ?? undefined,
        features: r.features,
      }),
    ),
  };
}
