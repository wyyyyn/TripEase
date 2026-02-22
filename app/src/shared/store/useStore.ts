import { useSyncExternalStore } from 'react';
import { getPublishedHotels } from './hotelStore';
import { getCurrentUser } from './authStore';
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

// C 端用：获取已发布的酒店（Step 7 会替换为 API）
let _publishedCache: Hotel[] | null = null;
function invalidateCache() {
  _publishedCache = null;
}

window.addEventListener('tripease_store_change', invalidateCache);
window.addEventListener('storage', invalidateCache);

export function usePublishedHotels(): Hotel[] {
  return useSyncExternalStore(subscribe, () => {
    if (!_publishedCache) _publishedCache = getPublishedHotels();
    return _publishedCache;
  });
}

export function useAuth(): AuthUser | null {
  return useSyncExternalStore(subscribe, () => getCurrentUser());
}
