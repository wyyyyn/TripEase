import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/store/useStore';
import {
  getDashboardStatsAPI,
  type DashboardStatsResponse,
} from '../../shared/api/admin';

export default function AdminDashboard() {
  const user = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 后端会根据角色自动判断：admin 看全部，merchant 看自己的
        const data = await getDashboardStatsAPI();
        setStats(data);
      } catch {
        // 静默处理，dashboard 只是展示统计数据
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  const statCards = [
    {
      icon: 'hotel',
      label: '酒店总数',
      value: stats?.total ?? 0,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: 'pending_actions',
      label: '待审核',
      value: stats?.pending ?? 0,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: 'check_circle',
      label: '已发布',
      value: stats?.published ?? 0,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: 'edit_note',
      label: '草稿',
      value: stats?.draft ?? 0,
      color: 'bg-gray-50 text-gray-600',
    },
    {
      icon: 'cancel',
      label: '已拒绝',
      value: stats?.rejected ?? 0,
      color: 'bg-red-50 text-red-600',
    },
    {
      icon: 'cloud_off',
      label: '已下线',
      value: stats?.offline ?? 0,
      color: 'bg-gray-50 text-gray-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">
          欢迎回来，{user?.username}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {user?.role === 'merchant' ? '管理您的酒店信息' : '平台酒店审核管理'}
        </p>
      </div>

      {loading ? (
        <p className="text-gray-400">加载中...</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                </div>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-dark">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
