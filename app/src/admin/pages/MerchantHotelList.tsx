import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/store/useStore';
import { getHotelsByOwnerAPI } from '../../shared/store/hotelStore';
import type { ManagedHotel } from '../../shared/types/admin';
import StatusBadge from '../components/StatusBadge';

export default function MerchantHotelList() {
  const navigate = useNavigate();
  const user = useAuth();

  // 从后端 API 加载酒店列表
  const [hotels, setHotels] = useState<ManagedHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getHotelsByOwnerAPI()
      .then(setHotels)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">我的酒店</h1>
          <p className="text-gray-500 text-sm mt-1">管理您的酒店列表</p>
        </div>
        <button
          onClick={() => navigate('/admin/hotels/new')}
          className="bg-admin-primary hover:bg-admin-primary/90 text-white font-bold py-3 px-6 rounded-2xl transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          新增酒店
        </button>
      </div>

      {hotels.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">
            apartment
          </span>
          <p className="text-gray-500 font-medium text-lg">暂无酒店</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">点击上方按钮添加您的第一家酒店</p>
          <button
            onClick={() => navigate('/admin/hotels/new')}
            className="bg-admin-primary hover:bg-admin-primary/90 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
          >
            立即添加
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-subtle border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  酒店名称
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  星级
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  房型数
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {hotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-dark text-sm">{hotel.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{hotel.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: hotel.starRating }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-amber-400 text-sm">
                          star_rate
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={hotel.status} />
                    {hotel.status === 'rejected' && hotel.rejectReason && (
                      <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={hotel.rejectReason}>
                        {hotel.rejectReason}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {hotel.rooms.length} 种
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/hotels/${hotel.id}`)}
                      className="text-sm text-admin-primary font-medium hover:underline"
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
