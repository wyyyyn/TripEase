import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../shared/store/authStore';
import AuthLeftPanel from '../components/AuthLeftPanel';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.ok) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left panel */}
      <AuthLeftPanel title="掌控酒店运营，从这里开始" />

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-[520px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 lg:p-10">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1a2b4b]">欢迎回来</h2>
            <p className="text-slate-500 mt-2">请登录您的账户</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Username / email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1a2b4b]">邮箱地址</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  mail
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-[#1978e5] text-[#1a2b4b] placeholder:text-slate-400"
                  placeholder="example@tripease.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[#1a2b4b]">密码</label>
                <span className="text-xs text-[#1978e5] font-medium cursor-pointer hover:underline">
                  忘记密码？点击此处找回
                </span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-[#1978e5] text-[#1a2b4b] placeholder:text-slate-400"
                  placeholder="在此输入密码"
                  required
                />
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="remember_me"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#1a2b4b] focus:ring-[#1978e5] cursor-pointer"
              />
              <label htmlFor="remember_me" className="text-sm text-slate-500 cursor-pointer">
                记住我（7天内免登录）
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a2b4b] hover:bg-[#1a2b4b]/90 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
            >
              {loading ? '登录中...' : '登录账户 ➜'}
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              新用户？{' '}
              <Link to="/admin/register" className="text-[#1978e5] font-semibold hover:underline">
                联系销售获取专属服务
              </Link>
            </p>
          </form>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex gap-6 text-xs text-slate-400 font-medium">
          <span className="hover:text-[#1a2b4b] transition-colors cursor-pointer">帮助中心</span>
          <span className="hover:text-[#1a2b4b] transition-colors cursor-pointer">联系我们</span>
          <span className="hover:text-[#1a2b4b] transition-colors cursor-pointer">语言: 简体中文</span>
        </div>
      </div>
    </div>
  );
}
