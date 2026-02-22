import { useSyncExternalStore } from 'react';
import { getAllHotels, getPublishedHotels, getHotelsByOwner } from './hotelStore';
import { getCurrentUser } from './authStore';
import type { ManagedHotel } from '../types/admin';
import type { AuthUser } from '../types/admin';
import type { Hotel } from '../types/hotel';

function subscribe(cb: () => void): () => void {
  window.addEventListener('tripease_store_change', cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener('tripease_store_change', cb);
    window.removeEventListener('storage', cb);
  };
}

let _hotelCache: ManagedHotel[] | null = null;
let _publishedCache: Hotel[] | null = null;
let _merchantCache: { ownerId: string; data: ManagedHotel[] } | null = null;

function invalidateCache() {
  _hotelCache = null;
  _publishedCache = null;
  _merchantCache = null;
}

window.addEventListener('tripease_store_change', invalidateCache);
window.addEventListener('storage', invalidateCache);

export function useHotels(): ManagedHotel[] {
  return useSyncExternalStore(subscribe, () => {
    if (!_hotelCache) _hotelCache = getAllHotels();
    return _hotelCache;
  });
}

export function usePublishedHotels(): Hotel[] {
  return useSyncExternalStore(subscribe, () => {
    if (!_publishedCache) _publishedCache = getPublishedHotels();
    return _publishedCache;
  });
}

export function useMerchantHotels(): ManagedHotel[] {
  const user = getCurrentUser();
  const ownerId = user?.id ?? '';
  return useSyncExternalStore(subscribe, () => {
    if (!_merchantCache || _merchantCache.ownerId !== ownerId) {
      _merchantCache = { ownerId, data: getHotelsByOwner(ownerId) };
    }
    return _merchantCache.data;
  });
}

export function useAuth(): AuthUser | null {
  return useSyncExternalStore(subscribe, () => getCurrentUser());
}
