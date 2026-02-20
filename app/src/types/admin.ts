import type { Hotel, Room } from './hotel';

export type UserRole = 'merchant' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
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
  ownerId: string;
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
  description: string;
  pricePerNight: number;
  originalPrice?: number;
  image: string;
  bedType: string;
  size: string;
  features: string[];
}
