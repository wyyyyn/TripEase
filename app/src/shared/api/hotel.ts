// ============================================================
// 酒店 API —— 商户端酒店 CRUD 接口
// ============================================================
// 类比：这个文件就像商户的"管理面板遥控器"。
// 每个函数就是遥控器上的一个按钮：
//   创建酒店 → createHotelAPI
//   查看我的酒店 → getMyHotelsAPI
//   查看单个酒店 → getHotelByIdAPI
//   修改酒店 → updateHotelAPI
//   删除酒店 → deleteHotelAPI
// ============================================================

import { apiClient } from './client';
import type { HotelFormData } from '../types/admin';

// ---------- 后端响应类型 ----------

/** 后端统一的响应包装格式 */
interface ApiResult<T> {
  ok: boolean;
  data: T;
}

/** 商户酒店列表中的一项 */
export interface HotelListItem {
  id: number;
  name: string;
  englishName: string | null;
  address: string;
  starRating: number;
  status: string;
  rejectReason: string | null;
  roomCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 酒店完整详情 */
export interface HotelDetailResponse {
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
  rooms: RoomDetailResponse[];
}

/** 房间详情 */
export interface RoomDetailResponse {
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

// ---------- API 函数 ----------

/**
 * 创建酒店
 * @param data   - 酒店表单数据
 * @param submit - true=提交审核，false=保存草稿
 */
export async function createHotelAPI(
  data: HotelFormData,
  submit: boolean,
): Promise<HotelDetailResponse> {
  const result = await apiClient<ApiResult<HotelDetailResponse>>(
    `/api/hotels?submit=${submit}`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return result.data;
}

/** 查询当前商户的所有酒店 */
export async function getMyHotelsAPI(): Promise<HotelListItem[]> {
  const result = await apiClient<ApiResult<HotelListItem[]>>('/api/hotels/my');
  return result.data;
}

/** 查询单个酒店详情 */
export async function getHotelByIdAPI(id: number): Promise<HotelDetailResponse> {
  const result = await apiClient<ApiResult<HotelDetailResponse>>(`/api/hotels/${id}`);
  return result.data;
}

/**
 * 更新酒店
 * @param id     - 酒店 ID
 * @param data   - 酒店表单数据
 * @param submit - true=提交审核，false=保存草稿
 */
export async function updateHotelAPI(
  id: number,
  data: HotelFormData,
  submit: boolean,
): Promise<HotelDetailResponse> {
  const result = await apiClient<ApiResult<HotelDetailResponse>>(
    `/api/hotels/${id}?submit=${submit}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
  return result.data;
}

/** 删除酒店 */
export async function deleteHotelAPI(id: number): Promise<void> {
  await apiClient<ApiResult<{ message: string }>>(`/api/hotels/${id}`, {
    method: 'DELETE',
  });
}
