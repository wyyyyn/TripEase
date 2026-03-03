import pool from '../config/db.js';
import type { ResultSetHeader } from 'mysql2';

export async function createRegisterRequest(data: {
  name: string;
  phone: string;
  hotelName: string;
  province: string;
  roomCount?: number;
  managementNeeds?: string;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO registration_requests (name, phone, hotel_name, province, room_count, management_needs)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.name, data.phone, data.hotelName, data.province, data.roomCount || null, data.managementNeeds || null],
  );
  return result.insertId;
}
