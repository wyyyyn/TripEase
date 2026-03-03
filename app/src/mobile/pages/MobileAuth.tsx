import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login, register } from '../../shared/store/authStore';
import type { UserRole } from '../../shared/types/admin';

type Tab = 'login' | 'register';
type Mode = 'mobile' | 'pc';

const ROLE_OPTIONS: { value: UserRole; label: string; icon: string }[] = [
  { value: 'customer', label: '普通用户', icon: 'person' },
  { value: 'merchant', label: '商户', icon: 'storefront' },
  { value: 'admin', label: '管理员', icon: 'shield_person' },
];

export default function MobileAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab: Tab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  // ---- 状态 ----
  const [mode, setMode] = useState<Mode>('mobile');
  const [tab, setTab] = useState<Tab>(initialTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('customer');
  const [rememberMe, setRememberMe] = useState(false);

  // 切换 tab 时清空表单
  function switchTab(t: Tab) {
    setTab(t);
    setError('');
    setPassword('');
    setConfirmPwd('');
    setShowPwd(false);
    setShowConfirmPwd(false);
    setRole('customer');
  }

  // 提交表单
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('请填写所有字段');
      return;
    }
    if (tab === 'register' && password !== confirmPwd) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const result =
        tab === 'login'
          ? await login(username.trim(), password)
          : await register(username.trim(), password, role);

      if (result.ok) {
        const target = result.user.role === 'customer' ? '/' : '/admin';
        navigate(target, { replace: true });
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  // ==================== PC 端布局 ====================
  if (mode === 'pc') {
    return (
      <div className="flex min-h-dvh w-full flex-col lg:flex-row bg-[#f6f7f8]">
        {/* ====== 左半屏：品牌展示 ====== */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-[#FAF8F5] relative overflow-hidden">
          {/* Logo */}
          <div className="absolute top-12 left-12 flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1978e5] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white font-bold text-xl">apartment</span>
            </div>
            <span className="text-2xl font-bold text-[#1a2b4b] tracking-tight">TripEase</span>
          </div>

          <div className="max-w-md z-10">
            {/* 酒店图片 */}
            <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
              <img
                alt="Luxury hotel lobby"
                className="w-full h-auto object-cover aspect-[4/3]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuURIw4ZL5oBMhKBVy4vLlCivax1AzElMfn5eCW-FvduOkTZi7p4zFlZKBfUEjvN6KuLH59UgJRReAJEkNYqCGNqqtTtoQq64-crprt8_4dbo71-TLdY1qHjlPgZSNOa9p0kcNfHTyJ9i1cuYw7n1DGEC0ox0G67pQBFspoZ5pWUNLhoi7TzrdJBcJy9oT41_Pw2KHiw2AQFssZ2KAmbpDunQF_oE4196IZOCWmzgt9b-HKY4vjFqf7czvMOBY2fUHPbyfGAcuC8g"
              />
            </div>
            <h1 className="text-4xl font-bold text-[#1a2b4b] leading-tight mb-4">
              掌控酒店运营，从这里开始
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              专为独立业主与连锁品牌打造的智能管理中枢
            </p>
            {/* 数据指标 */}
            <div className="mt-12 flex gap-8">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#1a2b4b]">2,500+</span>
                <span className="text-sm text-slate-500">酒店正在使用</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#1a2b4b]">99.9%</span>
                <span className="text-sm text-slate-500">系统稳定在线</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#1a2b4b]">7×24 小时</span>
                <span className="text-sm text-slate-500">专属支持</span>
              </div>
            </div>
          </div>

          {/* 装饰光晕 */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#1978e5]/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1978e5]/5 rounded-full blur-3xl" />
        </div>

        {/* ====== 右半屏：登录表单 ====== */}
        <div className="flex flex-1 flex-col justify-center items-center p-6 lg:p-12">
          {/* 移动端显示 logo（PC 端 logo 在左侧） */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#1978e5] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white font-bold text-xl">apartment</span>
            </div>
            <span className="text-2xl font-bold text-[#1a2b4b] tracking-tight">TripEase</span>
          </div>

          <div className="w-full max-w-[520px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 lg:p-10">
            {/* 标题 */}
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#1a2b4b]">
                {tab === 'login' ? '欢迎回来' : '创建账户'}
              </h2>
              <p className="text-slate-500 mt-2">
                {tab === 'login' ? '请登录您的账户' : '注册一个新账户'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 错误提示 */}
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2.5 px-3">
                  {error}
                </div>
              )}

              {/* 用户名 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1a2b4b]">用户名</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-[#1978e5] text-[#1a2b4b] placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* 密码 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[#1a2b4b]">密码</label>
                  {tab === 'login' && (
                    <a className="text-xs text-[#1978e5] font-medium hover:underline cursor-pointer">
                      忘记密码？
                    </a>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    lock
                  </span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="在此输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-[#1978e5] text-[#1a2b4b] placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPwd ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 确认密码（仅注册） */}
              {tab === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1a2b4b]">确认密码</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      lock
                    </span>
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      placeholder="再次输入密码"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      autoComplete="new-password"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-[#1978e5] text-[#1a2b4b] placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showConfirmPwd ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 角色选择（仅注册） */}
              {tab === 'register' && (
                <div>
                  <p className="text-sm font-semibold text-[#1a2b4b] mb-2">选择角色</p>
                  <div className="grid grid-cols-3 gap-3">
                    {ROLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRole(opt.value)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          role === opt.value
                            ? 'bg-[#1978e5]/10 text-[#1978e5] ring-1 ring-[#1978e5]/30'
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 记住我 */}
              {tab === 'login' && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="remember_me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#1a2b4b] focus:ring-[#1978e5] cursor-pointer"
                  />
                  <label htmlFor="remember_me" className="text-sm text-slate-500 cursor-pointer">
                    记住我（7天内免登录）
                  </label>
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a2b4b] hover:bg-[#1a2b4b]/90 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {tab === 'login' ? '登录中…' : '注册中…'}
                  </span>
                ) : (
                  <>
                    {tab === 'login' ? '登录账户' : '创建账户'} <span>➜</span>
                  </>
                )}
              </button>

              {/* 切换登录/注册 */}
              <p className="text-center text-sm text-slate-500 mt-6">
                {tab === 'login' ? (
                  <>新用户？ <button type="button" onClick={() => switchTab('register')} className="text-[#1978e5] font-semibold hover:underline">前往注册</button></>
                ) : (
                  <>已有账户？ <button type="button" onClick={() => switchTab('login')} className="text-[#1978e5] font-semibold hover:underline">返回登录</button></>
                )}
              </p>
            </form>
          </div>

          {/* 底部链接 + 切换回手机端 */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setMode('mobile')}
              className="text-sm text-[#1978e5] font-medium hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">smartphone</span>
              切换手机端登录
            </button>
            <div className="flex gap-6 text-xs text-slate-400 font-medium">
              <a className="hover:text-[#1a2b4b] transition-colors cursor-pointer">帮助中心</a>
              <a className="hover:text-[#1a2b4b] transition-colors cursor-pointer">联系我们</a>
              <a className="hover:text-[#1a2b4b] transition-colors cursor-pointer">语言: 简体中文</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 移动端布局 ====================
  return (
    <div className="max-w-[430px] mx-auto min-h-dvh relative flex flex-col overflow-x-hidden">
      {/* ====== 深色渐变背景 ====== */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(165deg, #0B1026 0%, #162544 35%, #1B3A5C 55%, #1A4A6E 70%, #2C7A8E 85%, #1B3A5C 100%)',
        }}
      />
      {/* 底部微光晕 —— 模拟水面反光 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[45%] -z-10 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 120% 60% at 50% 100%, rgba(78,205,196,0.35) 0%, transparent 70%)',
        }}
      />

      {/* ====== Logo + 品牌 ====== */}
      <header className="flex flex-col items-center pt-16 pb-8 animate-fade-in">
        {/* 黄色圆形图标 */}
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg mb-3">
          <span className="material-symbols-outlined text-dark text-3xl">travel_explore</span>
        </div>
        <h1 className="text-[28px] font-bold text-white tracking-wide">TripEase</h1>
        <p className="text-white/60 text-sm mt-1">轻松开启你的旅程</p>
      </header>

      {/* ====== 白色卡片表单 ====== */}
      <main className="flex-1 px-6 pb-6 flex flex-col animate-slide-up">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[24px] shadow-soft px-6 pt-6 pb-8 flex flex-col gap-5"
        >
          {/* -- Tab 切换 -- */}
          <div className="flex bg-gray-100 rounded-full p-1">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                  tab === t
                    ? 'bg-accent text-dark shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          {/* -- 错误提示 -- */}
          {error && (
            <div className="text-red-500 text-xs text-center bg-red-50 rounded-lg py-2 px-3">
              {error}
            </div>
          )}

          {/* -- 用户名 -- */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              person
            </span>
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl text-sm text-dark placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-accent/40 transition"
            />
          </div>

          {/* -- 密码 -- */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              lock
            </span>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 rounded-xl text-sm text-dark placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-accent/40 transition"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-xl">
                {showPwd ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>

          {/* -- 确认密码（仅注册） -- */}
          {tab === 'register' && (
            <div className="relative animate-fade-in">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                lock
              </span>
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                placeholder="确认密码"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                autoComplete="new-password"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 rounded-xl text-sm text-dark placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-accent/40 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-xl">
                  {showConfirmPwd ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          )}

          {/* -- 角色选择（仅注册） -- */}
          {tab === 'register' && (
            <div className="animate-fade-in">
              <p className="text-xs text-gray-500 mb-2 font-medium">选择角色</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      role === opt.value
                        ? 'bg-accent/15 text-accent ring-1 ring-accent/40'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* -- 提交按钮 -- */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-accent hover:bg-accent-hover active:scale-[0.98] text-dark font-bold text-base rounded-xl shadow-sm transition-all duration-150 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                {tab === 'login' ? '登录中…' : '注册中…'}
              </span>
            ) : tab === 'login' ? (
              '登录'
            ) : (
              '注册'
            )}
          </button>
        </form>

        {/* ====== 卡片外底部区域 ====== */}
        <div className="flex flex-col items-center mt-6 gap-4">
          <button
            type="button"
            onClick={() => setMode('pc')}
            className="w-full max-w-[280px] py-3 rounded-xl border border-white/30 bg-white/10 text-white text-sm font-semibold backdrop-blur-sm hover:bg-white/20 transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">desktop_windows</span>
            切换电脑端登录
          </button>

          {/* Terms & Privacy */}
          <p className="text-white/35 text-[11px] text-center leading-relaxed">
            登录即表示你同意我们的{' '}
            <span className="underline underline-offset-2">服务条款</span> 和{' '}
            <span className="underline underline-offset-2">隐私政策</span>
          </p>
        </div>
      </main>

      {/* ====== 内联动画关键帧 ====== */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out both;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out 0.15s both;
        }
      `}</style>
    </div>
  );
}
