import type { Response } from 'express';

/** 成功响应 */
export function success(res: Response, data: unknown = null) {
  res.json({ ok: true, data });
}

/** 失败响应 */
export function fail(res: Response, error: string, statusCode = 400) {
  res.status(statusCode).json({ ok: false, error });
}
