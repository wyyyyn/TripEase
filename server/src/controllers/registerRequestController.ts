import type { Request, Response } from 'express';
import { z } from 'zod';
import { success, fail } from '../utils/response.js';
import { createRegisterRequest } from '../services/registerRequestService.js';

const requestSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  phone: z.string().min(1, '请输入手机号码'),
  hotelName: z.string().min(1, '请输入酒店名称'),
  province: z.string().min(1, '请输入所在省份'),
  roomCount: z.number().optional(),
  managementNeeds: z.string().optional(),
});

export async function submitRegisterRequest(req: Request, res: Response) {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, parsed.error.errors[0].message);
  }

  const id = await createRegisterRequest(parsed.data);

  success(res, { id, message: '提交成功，销售顾问将在 1 小时内联系您' });
}
