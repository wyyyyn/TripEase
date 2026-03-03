import type { Hotel } from './hotel';

// 角色类型：与后端 ENUM('customer', 'merchant', 'admin') 对齐
export type UserRole = 'customer' | 'merchant' | 'admin';

export interface AuthUser {
  id: number;       // 数据库自增 ID（后端返回 number）
  username: string;
  displayName?: string;
  role: UserRole;
  createdAt: string;
}

export type ReviewStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'offline';

export interface ManagedHotel extends Hotel {
  ownerId: string; // Step 5 改造 hotelStore 时会统一改为 number
  ownerName?: string;
  status: ReviewStatus;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotelFormData {
  name: string;
  englishName: string;
  address: string;
  starRating: number;
  openDate: string;
  images: string[];
  tags: string[];
  amenities: string[];
  rooms: RoomFormData[];
}

export interface RoomFormData {
  id?: string;
  name: string;
  englishName: string;
  description: string;
  pricePerNight: number;
  originalPrice?: number;
  image: string;
  bedType: string;
  size: string;
  floor: string;
  maxGuests: number;
  roomCount: number;
  features: string[];
}
