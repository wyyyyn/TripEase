// ============================================================
// 管理员 API —— 审核相关的后端接口
// ============================================================
// 类比：这个文件就像管理员的"审核遥控器"。
// 每个函数是遥控器上的一个按钮：
//   查看所有酒店 → getAdminHotelsAPI
//   查看酒店详情 → getAdminHotelDetailAPI
//   变更状态    → changeHotelStatusAPI
//   查看审核日志 → getReviewLogsAPI
// ============================================================

import { apiClient } from './client';
import type { HotelListItem, HotelDetailResponse } from './hotel';

/** 后端统一的响应包装格式 */
interface ApiResult<T> {
  ok: boolean;
  data: T;
}

/** 仪表板统计数据 */
export interface DashboardStatsResponse {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
  offline: number;
}

/** 审核日志条目 */
export interface ReviewLogResponse {
  id: number;
  hotelId: number;
  operatorId: number;
  operatorName: string;
  fromStatus: string;
  toStatus: string;
  reason: string | null;
  createdAt: string;
}

// ---------- API 函数 ----------

/**
 * 仪表板统计（admin 看全部，merchant 看自己的）
 *
 * 后端用 GROUP BY 直接在数据库算好了每种状态的数量，
 * 只返回几个数字，比拉全部酒店列表高效得多。
 */
export async function getDashboardStatsAPI(): Promise<DashboardStatsResponse> {
  const result = await apiClient<ApiResult<DashboardStatsResponse>>(
    '/api/admin/stats',
  );
  return result.data;
}

/**
 * 管理员：查询所有酒店（可按状态筛选）
 * @param status - 可选，筛选状态（如 'pending' 只看待审核的）
 */
export async function getAdminHotelsAPI(
  status?: string,
): Promise<HotelListItem[]> {
  const query = status ? `?status=${status}` : '';
  const result = await apiClient<ApiResult<HotelListItem[]>>(
    `/api/admin/hotels${query}`,
  );
  return result.data;
}

/**
 * 管理员：查询单个酒店详情
 * @param id - 酒店 ID
 */
export async function getAdminHotelDetailAPI(
  id: number,
): Promise<HotelDetailResponse> {
  const result = await apiClient<ApiResult<HotelDetailResponse>>(
    `/api/admin/hotels/${id}`,
  );
  return result.data;
}

/**
 * 管理员：变更酒店状态
 * @param id     - 酒店 ID
 * @param status - 目标状态（approved / rejected / published / offline）
 * @param reason - 拒绝原因（拒绝时必填）
 */
export async function changeHotelStatusAPI(
  id: number,
  status: string,
  reason?: string,
): Promise<HotelDetailResponse> {
  const result = await apiClient<ApiResult<HotelDetailResponse>>(
    `/api/admin/hotels/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    },
  );
  return result.data;
}

/**
 * 管理员：查询审核日志
 * @param id - 酒店 ID
 */
export async function getReviewLogsAPI(
  id: number,
): Promise<ReviewLogResponse[]> {
  const result = await apiClient<ApiResult<ReviewLogResponse[]>>(
    `/api/admin/hotels/${id}/logs`,
  );
  return result.data;
}
