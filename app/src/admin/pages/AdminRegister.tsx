import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../shared/store/authStore';
import type { UserRole } from '../../shared/types/admin';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<UserRole>('merchant');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('请填写用户名和密码');
      return;
    }
    const result = register(username, password, role);
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
          <p className="text-gray-500 text-sm">创建管理账号</p>
        </div>

        {step === 'role' ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-dark text-center mb-4">选择账号类型</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setRole('merchant'); setStep('form'); }}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-2xl hover:border-accent hover:bg-accent/5 transition-colors group"
              >
                <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-accent transition-colors">
                  storefront
                </span>
                <div className="text-center">
                  <p className="font-bold text-dark text-sm">商户</p>
                  <p className="text-xs text-gray-500 mt-1">管理自己的酒店</p>
                </div>
              </button>
              <button
                onClick={() => { setRole('admin'); setStep('form'); }}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-2xl hover:border-accent hover:bg-accent/5 transition-colors group"
              >
                <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-accent transition-colors">
                  admin_panel_settings
                </span>
                <div className="text-center">
                  <p className="font-bold text-dark text-sm">管理员</p>
                  <p className="text-xs text-gray-500 mt-1">审核全部酒店</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role indicator */}
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-accent/10 rounded-xl">
              <span className="material-symbols-outlined text-accent text-lg">
                {role === 'merchant' ? 'storefront' : 'admin_panel_settings'}
              </span>
              <span className="text-sm font-medium text-dark">
                {role === 'merchant' ? '商户账号' : '管理员账号'}
              </span>
              <button
                type="button"
                onClick={() => setStep('role')}
                className="ml-auto text-xs text-gray-500 hover:text-dark transition-colors"
              >
                更换
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:border-accent focus:outline-none transition-colors"
                placeholder="请输入用户名"
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
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-dark hover:bg-dark-hover text-white font-bold py-3 px-6 rounded-2xl transition-colors"
            >
              注册
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          已有账号？{' '}
          <Link to="/admin/login" className="text-accent font-semibold hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
