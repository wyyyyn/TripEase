import type { ManagedHotel, HotelFormData, ReviewStatus } from '../types/admin';
import type { Hotel } from '../types/hotel';
import { hotels as seedHotels } from '../data/mockData';

const STORAGE_KEY = 'tripease_hotels';
const SEED_FLAG = 'tripease_seeded';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

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

export function getAllHotels(): ManagedHotel[] {
  seedIfNeeded();
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(hotels: ManagedHotel[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
  notifyChange();
}

export function getPublishedHotels(): Hotel[] {
  return getAllHotels()
    .filter((h) => h.status === 'published')
    .map(({ ownerId, status, rejectReason, createdAt, updatedAt, ...hotel }) => hotel);
}

export function getHotelsByOwner(ownerId: string): ManagedHotel[] {
  return getAllHotels().filter((h) => h.ownerId === ownerId);
}

export function getHotelById(id: string): ManagedHotel | undefined {
  return getAllHotels().find((h) => h.id === id);
}

export function createHotel(ownerId: string, data: HotelFormData, submit: boolean): ManagedHotel {
  const now = new Date().toISOString();
  const hotel: ManagedHotel = {
    id: generateId(),
    name: data.name,
    rating: 0,
    reviewCount: 0,
    address: data.address,
    distanceFromCenter: '',
    pricePerNight: data.rooms.length > 0 ? Math.min(...data.rooms.map((r) => r.pricePerNight)) : 0,
    currency: '¥',
    images: data.images,
    tags: data.tags,
    amenities: data.amenities,
    starRating: data.starRating,
    rooms: data.rooms.map((r) => ({
      id: r.id || generateId(),
      name: r.name,
      description: r.description,
      pricePerNight: r.pricePerNight,
      originalPrice: r.originalPrice,
      currency: '¥',
      image: r.image,
      bedType: r.bedType,
      size: r.size,
      features: r.features,
    })),
    ownerId,
    status: submit ? 'pending' : 'draft',
    createdAt: now,
    updatedAt: now,
  };
  const all = getAllHotels();
  all.push(hotel);
  saveAll(all);
  return hotel;
}

export function updateHotel(
  id: string,
  data: HotelFormData,
  submit: boolean,
): ManagedHotel | undefined {
  const all = getAllHotels();
  const idx = all.findIndex((h) => h.id === id);
  if (idx === -1) return undefined;
  const existing = all[idx];
  const updated: ManagedHotel = {
    ...existing,
    name: data.name,
    address: data.address,
    starRating: data.starRating,
    images: data.images,
    tags: data.tags,
    amenities: data.amenities,
    pricePerNight: data.rooms.length > 0 ? Math.min(...data.rooms.map((r) => r.pricePerNight)) : 0,
    rooms: data.rooms.map((r) => ({
      id: r.id || generateId(),
      name: r.name,
      description: r.description,
      pricePerNight: r.pricePerNight,
      originalPrice: r.originalPrice,
      currency: '¥',
      image: r.image,
      bedType: r.bedType,
      size: r.size,
      features: r.features,
    })),
    status: submit ? 'pending' : existing.status === 'rejected' ? 'draft' : existing.status,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  saveAll(all);
  return updated;
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
