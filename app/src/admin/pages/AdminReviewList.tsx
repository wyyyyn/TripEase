import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminHotelsAPI, changeHotelStatusAPI } from '../../shared/api/admin';
import { listItemToManagedHotel } from '../../shared/store/hotelStore';
import StatusBadge from '../components/StatusBadge';
import RejectModal from '../components/RejectModal';
import type { ReviewStatus, ManagedHotel } from '../../shared/types/admin';

const TABS: { key: ReviewStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
  { key: 'published', label: '已发布' },
  { key: 'offline', label: '已下线' },
];

export default function AdminReviewList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReviewStatus | 'all'>('all');
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [hotels, setHotels] = useState<ManagedHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 从后端加载酒店列表
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const list = await getAdminHotelsAPI(status);
      setHotels(list.map(listItemToManagedHotel));
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // 审核操作（通过、发布、下线、恢复上线）
  const handleAction = async (id: number, status: ReviewStatus) => {
    try {
      await changeHotelStatusAPI(id, status);
      fetchHotels();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  // 拒绝操作（需要填写理由）
  const handleReject = async (reason: string) => {
    if (rejectTarget !== null) {
      try {
        await changeHotelStatusAPI(rejectTarget, 'rejected', reason);
        setRejectTarget(null);
        fetchHotels();
      } catch (err: any) {
        alert(err.message || '操作失败');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">审核管理</h1>
        <p className="text-gray-500 text-sm mt-1">审核和管理所有酒店</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-dark text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
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
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                更新时间
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  加载中...
                </td>
              </tr>
            )}
            {!loading && hotels.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {!loading && hotels.map((hotel) => {
              const numericId = Number(hotel.id);
              return (
                <tr key={hotel.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-dark text-sm">{hotel.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{hotel.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: hotel.starRating }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-accent text-sm">
                          star_rate
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={hotel.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {hotel.rooms.length} 种
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(hotel.updatedAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/review/${hotel.id}`)}
                        className="text-sm text-gray-500 hover:text-dark transition-colors"
                      >
                        查看
                      </button>
                      {hotel.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(numericId, 'approved')}
                            className="text-sm text-emerald-600 font-medium hover:underline"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => setRejectTarget(numericId)}
                            className="text-sm text-red-500 font-medium hover:underline"
                          >
                            拒绝
                          </button>
                        </>
                      )}
                      {hotel.status === 'approved' && (
                        <button
                          onClick={() => handleAction(numericId, 'published')}
                          className="text-sm text-blue-600 font-medium hover:underline"
                        >
                          发布
                        </button>
                      )}
                      {hotel.status === 'published' && (
                        <button
                          onClick={() => handleAction(numericId, 'offline')}
                          className="text-sm text-gray-500 font-medium hover:underline"
                        >
                          下线
                        </button>
                      )}
                      {hotel.status === 'offline' && (
                        <button
                          onClick={() => handleAction(numericId, 'published')}
                          className="text-sm text-emerald-600 font-medium hover:underline"
                        >
                          恢复上线
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RejectModal
        key={rejectTarget}
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </div>
  );
}
