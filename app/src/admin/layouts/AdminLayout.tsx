import { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { logout, initAuth } from '../../shared/store/authStore';
import { useAuth } from '../../shared/store/useStore';
import { getDashboardStatsAPI } from '../../shared/api/admin';

export default function AdminLayout() {
  const user = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [hotelMenuOpen, setHotelMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // 应用挂载时，用 token 向后端确认登录状态
  useEffect(() => {
    initAuth().finally(() => setAuthChecked(true));
  }, []);

  // 如果当前路径是酒店相关，自动展开子菜单
  useEffect(() => {
    if (location.pathname.startsWith('/admin/hotels')) {
      setHotelMenuOpen(true);
    }
  }, [location.pathname]);

  // 管理员获取待审核数量
  useEffect(() => {
    if (user?.role === 'admin') {
      getDashboardStatsAPI()
        .then((stats) => setPendingCount(stats.pending))
        .catch(() => {});
    }
  }, [user]);

  // token 验证中 → 显示加载状态，避免闪烁到登录页
  if (!authChecked) {
    return (
      <div className="min-h-dvh bg-admin-bg flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-admin-primary text-4xl animate-spin">
            progress_activity
          </span>
          <p className="text-gray-500 text-sm mt-3">验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 验证完毕但没有用户 → 跳转登录页
  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isMerchant = user.role === 'merchant';
  const sidebarBg = isMerchant ? 'bg-admin-sidebar' : 'bg-admin-sidebar-dark';

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar */}
      <aside className={`w-60 ${sidebarBg} flex flex-col shrink-0`}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-admin-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">apartment</span>
            </div>
            <div>
              <span className="text-base font-bold text-white">TripEase</span>
              <p className="text-xs text-slate-400">
                {isMerchant ? '商户端' : '管理员'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2">
          {isMerchant ? (
            /* ---- Merchant Nav ---- */
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                    isActive
                      ? 'bg-admin-primary/20 text-white border-l-4 border-admin-primary font-semibold'
                      : 'text-slate-400 hover:bg-white/10 border-l-4 border-transparent'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">dashboard</span>
                控制台
              </NavLink>

              {/* Hotel parent menu */}
              <button
                onClick={() => setHotelMenuOpen(!hotelMenuOpen)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                  location.pathname.startsWith('/admin/hotels')
                    ? 'bg-admin-primary/20 text-white border-l-4 border-admin-primary font-semibold'
                    : 'text-slate-400 hover:bg-white/10 border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-xl">hotel</span>
                <span className="flex-1 text-left">酒店管理</span>
                <span
                  className={`material-symbols-outlined text-base transition-transform ${
                    hotelMenuOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Submenu */}
              {hotelMenuOpen && (
                <div className="ml-8 mb-1">
                  <NavLink
                    to="/admin/hotels/new"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'text-white font-medium'
                          : 'text-slate-500 hover:text-slate-300'
                      }`
                    }
                  >
                    新增酒店
                  </NavLink>
                  <NavLink
                    to="/admin/hotels"
                    end
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'text-white font-medium'
                          : 'text-slate-500 hover:text-slate-300'
                      }`
                    }
                  >
                    我的酒店
                  </NavLink>
                </div>
              )}
            </>
          ) : (
            /* ---- Admin Nav ---- */
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                    isActive
                      ? 'bg-admin-accent/10 text-admin-accent border-r-4 border-admin-accent font-semibold'
                      : 'text-slate-400 hover:bg-white/10 border-r-4 border-transparent'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">dashboard</span>
                仪表盘
              </NavLink>

              <NavLink
                to="/admin/review"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                    isActive
                      ? 'bg-admin-accent/10 text-admin-accent border-r-4 border-admin-accent font-semibold'
                      : 'text-slate-400 hover:bg-white/10 border-r-4 border-transparent'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">fact_check</span>
                <span className="flex-1 text-left">审核队列</span>
                {pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            </>
          )}
        </nav>

        {/* Bottom user card */}
        <div className="px-3 pb-4">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-admin-primary/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-admin-primary text-lg">person</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-500">
                  {isMerchant ? '商户' : '管理员'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-sm text-slate-500 hover:text-red-400 transition-colors flex items-center gap-2 px-1 py-1"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              退出登录
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-admin-bg">
        <Outlet />
      </main>
    </div>
  );
}
