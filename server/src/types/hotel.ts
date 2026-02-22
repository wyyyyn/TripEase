// ──────────────────────────────────────────────
// 酒店相关的类型定义
// 分三类：数据库行类型、API 请求体、API 响应体
// ──────────────────────────────────────────────

// ===== 数据库行类型（SELECT 出来的一行长什么样）=====

export type HotelStatus =
  | 'draft'       // 草稿：商户还没提交
  | 'pending'     // 待审核：提交了，等管理员审
  | 'approved'    // 已通过：管理员批准了
  | 'rejected'    // 已拒绝：管理员打回了
  | 'published'   // 已上架：C 端用户能看到
  | 'offline';    // 已下架：管理员手动下线

export type BadgeColor = 'red' | 'dark' | 'green' | 'accent';

/** hotels 表的一行 */
export interface HotelRow {
  id: number;
  owner_id: number;
  name: string;
  english_name: string | null;
  address: string;
  star_rating: number;
  open_date: string | null;
  distance_from_center: string | null;
  price_per_night: number | null;
  original_price: number | null;
  currency: string;
  rating: number;
  review_count: number;
  badge: string | null;
  badge_color: BadgeColor | null;
  status: HotelStatus;
  reject_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

/** rooms 表的一行 */
export interface RoomRow {
  id: number;
  hotel_id: number;
  name: string;
  description: string | null;
  price_per_night: number;
  original_price: number | null;
  currency: string;
  image: string | null;
  bed_type: string;
  size: string | null;
  badge: string | null;
  badge_color: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// ===== API 请求体（前端传过来的数据结构）=====

/** 房间表单数据 */
export interface RoomInput {
  name: string;
  description: string;
  pricePerNight: number;
  originalPrice?: number;
  image: string;
  bedType: string;
  size: string;
  features: string[];
}

/** 创建/更新酒店的请求体 */
export interface HotelInput {
  name: string;
  englishName: string;
  address: string;
  starRating: number;
  openDate: string;
  images: string[];
  tags: string[];
  amenities: string[];
  rooms: RoomInput[];
}

// ===== API 响应体（返回给前端的数据结构）=====

/** 商户酒店列表中的一项（不含完整 rooms 详情） */
export interface HotelListItem {
  id: number;
  name: string;
  englishName: string | null;
  address: string;
  starRating: number;
  status: HotelStatus;
  rejectReason: string | null;
  roomCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 酒店完整详情（含 rooms, images, tags, amenities） */
export interface HotelDetail {
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
  badgeColor: BadgeColor | null;
  status: HotelStatus;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  images: string[];
  tags: string[];
  amenities: string[];
  rooms: RoomDetail[];
}

/** 房间详情 */
export interface RoomDetail {
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
