import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/store/useStore';
import { getAdminHotelsAPI } from '../../shared/api/admin';
import { getHotelsByOwnerAPI } from '../../shared/store/hotelStore';
import type { ManagedHotel } from '../../shared/types/admin';
import { listItemToManagedHotel } from '../../shared/store/hotelStore';

export default function AdminDashboard() {
  const user = useAuth();
  const [hotels, setHotels] = useState<ManagedHotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (user?.role === 'admin') {
          // 管理员：看所有酒店
          const list = await getAdminHotelsAPI();
          setHotels(list.map(listItemToManagedHotel));
        } else if (user?.role === 'merchant') {
          // 商户：只看自己的酒店
          const list = await getHotelsByOwnerAPI();
          setHotels(list);
        }
      } catch {
        // 静默处理，dashboard 只是展示统计数据
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  const stats = [
    {
      icon: 'hotel',
      label: '酒店总数',
      value: hotels.length,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: 'pending_actions',
      label: '待审核',
      value: hotels.filter((h) => h.status === 'pending').length,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: 'check_circle',
      label: '已发布',
      value: hotels.filter((h) => h.status === 'published').length,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: 'edit_note',
      label: '草稿',
      value: hotels.filter((h) => h.status === 'draft').length,
      color: 'bg-gray-50 text-gray-600',
    },
    {
      icon: 'cancel',
      label: '已拒绝',
      value: hotels.filter((h) => h.status === 'rejected').length,
      color: 'bg-red-50 text-red-600',
    },
    {
      icon: 'cloud_off',
      label: '已下线',
      value: hotels.filter((h) => h.status === 'offline').length,
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
          {stats.map((stat) => (
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
