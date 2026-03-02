// ============================================================
// API 客户端 —— 所有后端请求的"总调度员"
// ============================================================
// 类比：这个文件就像酒店前台的统一接待员。
// 不管客人（页面）要办什么事（注册、登录、查酒店），
// 都先经过这个接待员，由它统一：
//   1. 带上"身份证"（JWT token）
//   2. 翻译回复（解析 JSON）
//   3. 遇到问题时统一报告（错误处理）
// ============================================================

const TOKEN_KEY = 'tripease_token'; // localStorage 中存放 JWT 的键名

// ---------- Token 管理 ----------

/** 把服务器返回的 token 存到 localStorage */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** 读取已保存的 token（没有则返回 null） */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** 清除 token（退出登录时调用） */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------- 统一请求函数 ----------

/**
 * 向后端发请求的通用函数
 * @param endpoint  接口路径，如 "/api/auth/login"
 * @param options   fetch 的选项（method, body 等）
 * @returns         解析后的 JSON 数据
 *
 * 类比：apiClient 就是"快递员"。
 * 你只需告诉它"寄到哪里、里面放什么"，
 * 它会自动贴上身份标签（token）、帮你拆包裹（解析 JSON）、
 * 遇到问题就回来告诉你哪里出错了。
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // 1. 组装请求头：告诉服务器"我发的是 JSON 数据"
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  // 2. 如果有 token，带上它——相当于带上身份证
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. 发送请求
  const res = await fetch(endpoint, { ...options, headers });

  // 4. 解析响应体（如果后端挂了返回空内容，给出友好提示）
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error('服务器无响应，请稍后重试');
  }

  // 5. 如果服务器返回了错误状态码（如 400、401、500），抛出错误
  //    后端返回格式：{ error: "错误描述" }
  if (!res.ok) {
    throw new Error(data.error || `请求失败 (${res.status})`);
  }

  return data as T;
}
