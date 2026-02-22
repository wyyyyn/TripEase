import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../shared/store/authStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // 请求进行中的加载状态

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('请填写用户名和密码');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate('/admin');
  };

  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-accent text-3xl">luggage</span>
            <span className="text-2xl font-bold text-dark">TripEase</span>
          </div>
          <p className="text-gray-500 text-sm">管理后台登录</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:border-accent focus:outline-none transition-colors"
              placeholder="请输入用户名"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:border-accent focus:outline-none transition-colors"
              placeholder="请输入密码"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark hover:bg-dark-hover text-white font-bold py-3 px-6 rounded-2xl transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          还没有账号？{' '}
          <Link to="/admin/register" className="text-accent font-semibold hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
