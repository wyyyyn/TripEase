// ──────────────────────────────────────────────
// 审核相关的类型定义
// 包括：状态转换规则、数据库行类型、API 响应类型
// ──────────────────────────────────────────────

import type { HotelStatus } from './hotel.js';

// ===== 状态转换规则 =====
// 就像交通信号灯：绿灯只能变黄灯，黄灯只能变红灯
// 不是所有状态之间都能随意切换，必须按规则来
//
// pending（待审核）  → approved（通过）或 rejected（拒绝）
// approved（已通过） → published（上架）
// published（已上架）→ offline（下线）
// offline（已下线）  → published（重新上架）

export const VALID_TRANSITIONS: Partial<Record<HotelStatus, HotelStatus[]>> = {
  pending:   ['approved', 'rejected'],
  approved:  ['published'],
  published: ['offline'],
  offline:   ['published'],
};

// ===== 数据库行类型 =====

/** review_logs 表的一行（SELECT 出来长什么样） */
export interface ReviewLogRow {
  id: number;
  hotel_id: number;
  operator_id: number;
  from_status: HotelStatus;
  to_status: HotelStatus;
  reason: string | null;
  created_at: Date;
}

// ===== Dashboard 统计 =====

/**
 * 仪表板统计数据
 * 类比：酒店管理首页上方的"一排数字卡片"，
 * 告诉你总共有多少家酒店、几家在审核中、几家已上线等。
 */
export interface DashboardStats {
  total: number;      // 酒店总数
  draft: number;      // 草稿
  pending: number;    // 待审核
  approved: number;   // 已通过（待发布）
  rejected: number;   // 已拒绝
  published: number;  // 已上架
  offline: number;    // 已下线
}

// ===== API 响应类型 =====

/** 返回给前端的审核日志（含操作人姓名） */
export interface ReviewLogItem {
  id: number;
  hotelId: number;
  operatorId: number;
  operatorName: string;     // JOIN users 表拿到的名字
  fromStatus: HotelStatus;
  toStatus: HotelStatus;
  reason: string | null;
  createdAt: string;        // ISO 日期字符串
}
