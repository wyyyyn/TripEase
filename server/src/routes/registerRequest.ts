import { Router } from 'express';
import { submitRegisterRequest } from '../controllers/registerRequestController.js';

const router = Router();

// POST /api/register-request — 提交注册请求（获取专属方案）
router.post('/', submitRegisterRequest);

export default router;
