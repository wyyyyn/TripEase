// ============================================================
// 酒店 Store —— 酒店数据的"中转站"
// ============================================================
// Step 5 改造：商户 CRUD 操作调用后端 API
// Step 6 改造：管理员审核操作调用后端 API（本次）
//
// 注意：getPublishedHotels 暂时保留 localStorage 逻辑，
// 等 Step 7（C 端公开接口）完成后再替换。
// ============================================================

import type { ManagedHotel, HotelFormData, ReviewStatus } from '../types/admin';
import type { Hotel } from '../types/hotel';
import { hotels as seedHotels } from '../../mobile/data/mockData';
import {
  createHotelAPI,
  getMyHotelsAPI,
  getHotelByIdAPI,
  updateHotelAPI,
  deleteHotelAPI,
  type HotelListItem,
  type HotelDetailResponse,
} from '../api/hotel';

// ─── C 端用的 localStorage（Step 7 会替换）──────────

const STORAGE_KEY = 'tripease_hotels';
const SEED_FLAG = 'tripease_seeded';

function seedIfNeeded(): void {
  if (localStorage.getItem(SEED_FLAG)) return;
  const managed: ManagedHotel[] = seedHotels.map((h) => ({
    ...h,
    ownerId: '__seed__',
    status: 'published' as ReviewStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(managed));
  localStorage.setItem(SEED_FLAG, '1');
}

/** C 端用：获取已发布的酒店（Step 7 会替换为 API） */
export function getPublishedHotels(): Hotel[] {
  seedIfNeeded();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const all: ManagedHotel[] = JSON.parse(raw);
    return all
      .filter((h) => h.status === 'published')
      .map(({ ownerId: _, status: _s, rejectReason: _r, createdAt: _c, updatedAt: _u, ...hotel }) => hotel);
  } catch {
    return [];
  }
}

// ─── 类型转换工具函数 ──────────────────────────────

/**
 * 把后端返回的 HotelDetailResponse 转换成前端 ManagedHotel 格式
 * 为什么要转换？前端组件已经用 ManagedHotel 类型了，保持接口一致
 */
export function toManagedHotel(h: HotelDetailResponse): ManagedHotel {
  return {
    id: String(h.id),
    ownerId: String(h.ownerId),
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
    badgeColor: (h.badgeColor as ManagedHotel['badgeColor']) ?? undefined,
    rooms: h.rooms.map((r) => ({
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
    })),
    status: h.status as ReviewStatus,
    rejectReason: h.rejectReason ?? undefined,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  };
}

/** 把 HotelListItem 转成简易的 ManagedHotel（没有 rooms 等详细信息） */
export function listItemToManagedHotel(h: HotelListItem): ManagedHotel {
  return {
    id: String(h.id),
    ownerId: '',
    name: h.name,
    rating: 0,
    reviewCount: 0,
    address: h.address,
    distanceFromCenter: '',
    pricePerNight: 0,
    currency: '¥',
    images: [],
    tags: [],
    amenities: [],
    starRating: h.starRating,
    rooms: [],
    status: h.status as ReviewStatus,
    rejectReason: h.rejectReason ?? undefined,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  };
}

// ─── 商户端 API 函数 ──────────────────────────────

/** 查询当前商户的所有酒店（调用 API） */
export async function getHotelsByOwnerAPI(): Promise<ManagedHotel[]> {
  const list = await getMyHotelsAPI();
  return list.map(listItemToManagedHotel);
}

/** 按 ID 查询单个酒店（调用 API） */
export async function getHotelByIdFromAPI(id: number): Promise<ManagedHotel | undefined> {
  try {
    const detail = await getHotelByIdAPI(id);
    return toManagedHotel(detail);
  } catch {
    return undefined;
  }
}

/** 创建酒店（调用 API） */
export async function createHotelFromAPI(
  data: HotelFormData,
  submit: boolean,
): Promise<ManagedHotel> {
  const detail = await createHotelAPI(data, submit);
  return toManagedHotel(detail);
}

/** 更新酒店（调用 API） */
export async function updateHotelFromAPI(
  id: number,
  data: HotelFormData,
  submit: boolean,
): Promise<ManagedHotel> {
  const detail = await updateHotelAPI(id, data, submit);
  return toManagedHotel(detail);
}

/** 删除酒店（调用 API） */
export async function deleteHotelFromAPI(id: number): Promise<void> {
  await deleteHotelAPI(id);
}
