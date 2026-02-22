export interface Hotel {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  distanceFromCenter: string;
  pricePerNight: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  tags: string[];
  amenities: string[];
  starRating: number;
  badge?: string;
  badgeColor?: 'red' | 'dark' | 'green' | 'accent';
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  originalPrice?: number;
  currency: string;
  image: string;
  bedType: string;
  size: string;
  badge?: string;
  badgeColor?: string;
  features: string[];
}

export interface SearchParams {
  city: string;
  citySubtext?: string;
  checkIn: string;
  checkInDay: string;
  checkOut: string;
  checkOutDay: string;
  nights: number;
  guests: number;
  keyword?: string;
}
