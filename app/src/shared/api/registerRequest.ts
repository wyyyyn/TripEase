import { apiClient } from './client';

export interface RegisterRequestData {
  name: string;
  phone: string;
  hotelName: string;
  province: string;
  roomCount?: number;
  managementNeeds?: string;
}

export async function submitRegisterRequestAPI(data: RegisterRequestData) {
  return apiClient<{ id: number; message: string }>('/api/register-request', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
