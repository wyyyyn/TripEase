import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../../shared/store/authStore';

type Tab = 'login' | 'register';

export default function MobileAuth() {
  const navigate = useNavigate();

  // ---- 状态 ----
  const [tab, setTab] = useState<Tab>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 切换 tab 时清空表单
  function switchTab(t: Tab) {
    setTab(t);
    setError('');
    setPassword('');
    setConfirmPwd('');
    setShowPwd(false);
    setShowConfirmPwd(false);
  }

  // 提交表单
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (tab === 'register' && password !== confirmPwd) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result =
        tab === 'login'
          ? await login(username.trim(), password)
          : await register(username.trim(), password, 'customer');

      if (result.ok) {
        navigate('/', { replace: true });
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-dvh relative flex flex-col overflow-hidden">
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
          <span className="material-symbols-rounded text-dark text-3xl">travel_explore</span>
        </div>
        <h1 className="text-[28px] font-bold text-white tracking-wide">TripEase</h1>
        <p className="text-white/60 text-sm mt-1">Your journey begins here</p>
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
                {t === 'login' ? 'Log In' : 'Sign Up'}
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
            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              person
            </span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl text-sm text-dark placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-accent/40 transition"
            />
          </div>

          {/* -- 密码 -- */}
          <div className="relative">
            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              lock
            </span>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Password"
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
              <span className="material-symbols-rounded text-xl">
                {showPwd ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>

          {/* -- 确认密码（仅注册） -- */}
          {tab === 'register' && (
            <div className="relative animate-fade-in">
              <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                lock
              </span>
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                placeholder="Confirm Password"
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
                <span className="material-symbols-rounded text-xl">
                  {showConfirmPwd ? 'visibility' : 'visibility_off'}
                </span>
              </button>
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
                {tab === 'login' ? 'Logging in…' : 'Creating account…'}
              </span>
            ) : tab === 'login' ? (
              'Log In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* ====== 卡片外底部区域 ====== */}
        <div className="flex flex-col items-center mt-6 gap-4">
          {/* 商家入口 */}
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="inline-flex items-center gap-1.5 text-white/50 text-xs hover:text-white/80 transition"
          >
            <span className="material-symbols-rounded text-sm">storefront</span>
            Business Portal
          </button>

          {/* Terms & Privacy */}
          <p className="text-white/35 text-[11px] text-center leading-relaxed">
            By signing in, you agree to our{' '}
            <span className="underline underline-offset-2">Terms</span> &{' '}
            <span className="underline underline-offset-2">Privacy</span>
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
