// ============================================================
// 酒店 Store —— 酒店数据的"中转站"
// ============================================================
// 改造前：所有数据存在 localStorage（浏览器本地存储）
// 改造后：商户的 CRUD 操作调用后端 API
//
// 注意：getAllHotels / getPublishedHotels / changeStatus 暂时保留
// localStorage 逻辑，等 Step 6（管理员审核 API）和 Step 7（C 端 API）
// 完成后再替换。
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

function notifyChange(): void {
  window.dispatchEvent(new CustomEvent('tripease_store_change'));
}

// ─── 暂保留的 localStorage 函数（Step 6/7 会替换）──────────

export function getAllHotels(): ManagedHotel[] {
  seedIfNeeded();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAll(hotels: ManagedHotel[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
  notifyChange();
}

export function getPublishedHotels(): Hotel[] {
  return getAllHotels()
    .filter((h) => h.status === 'published')
    .map(({ ownerId: _, status: _s, rejectReason: _r, createdAt: _c, updatedAt: _u, ...hotel }) => hotel);
}

export function changeStatus(
  id: string,
  status: ReviewStatus,
  rejectReason?: string,
): ManagedHotel | undefined {
  const all = getAllHotels();
  const idx = all.findIndex((h) => h.id === id);
  if (idx === -1) return undefined;
  all[idx] = {
    ...all[idx],
    status,
    rejectReason: status === 'rejected' ? rejectReason : all[idx].rejectReason,
    updatedAt: new Date().toISOString(),
  };
  saveAll(all);
  return all[idx];
}

// ─── 新的 API 函数（替代旧的 localStorage 操作）──────────

/**
 * 把后端返回的 HotelDetailResponse 转换成前端 ManagedHotel 格式
 * 为什么要转换？前端组件已经用 ManagedHotel 类型了，保持接口一致
 */
function toManagedHotel(h: HotelDetailResponse): ManagedHotel {
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
function listItemToManagedHotel(h: HotelListItem): ManagedHotel {
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
