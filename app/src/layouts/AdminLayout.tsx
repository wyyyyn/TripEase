import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../store/authStore';

export default function AdminLayout() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', icon: 'dashboard', label: '控制台', end: true },
    ...(user.role === 'merchant'
      ? [{ to: '/admin/hotels', icon: 'hotel', label: '我的酒店', end: false }]
      : []),
    ...(user.role === 'admin'
      ? [{ to: '/admin/review', icon: 'fact_check', label: '审核管理', end: false }]
      : []),
  ];

  return (
    <div className="flex min-h-dvh bg-cream">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-2xl">luggage</span>
            <span className="text-xl font-bold text-dark">TripEase</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {user.role === 'merchant' ? '商户管理' : '平台管理'}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-dark border-l-3 border-accent font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-dark border-l-3 border-transparent'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-accent text-lg">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark truncate">{user.username}</p>
              <p className="text-xs text-gray-500">
                {user.role === 'merchant' ? '商户' : '管理员'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2 px-2 py-1.5"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            退出登录
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
