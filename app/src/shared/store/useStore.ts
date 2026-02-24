import { useSyncExternalStore } from 'react';
import { getCurrentUser } from './authStore';
import type { AuthUser } from '../types/admin';

function subscribe(cb: () => void): () => void {
  window.addEventListener('tripease_store_change', cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener('tripease_store_change', cb);
    window.removeEventListener('storage', cb);
  };
}

export function useAuth(): AuthUser | null {
  return useSyncExternalStore(subscribe, () => getCurrentUser());
}
