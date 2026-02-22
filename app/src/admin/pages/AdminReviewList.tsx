import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotels } from '../../shared/store/useStore';
import { changeStatus } from '../../shared/store/hotelStore';
import StatusBadge from '../components/StatusBadge';
import RejectModal from '../components/RejectModal';
import type { ReviewStatus } from '../../shared/types/admin';

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
  const allHotels = useHotels();
  const [activeTab, setActiveTab] = useState<ReviewStatus | 'all'>('all');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const filtered = activeTab === 'all'
    ? allHotels
    : allHotels.filter((h) => h.status === activeTab);

  const handleAction = (id: string, status: ReviewStatus) => {
    changeStatus(id, status);
  };

  const handleReject = (reason: string) => {
    if (rejectTarget) {
      changeStatus(rejectTarget, 'rejected', reason);
      setRejectTarget(null);
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
            {tab.key !== 'all' && (
              <span className="ml-1.5 text-xs">
                ({allHotels.filter((h) => h.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {filtered.map((hotel) => (
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
                          onClick={() => handleAction(hotel.id, 'approved')}
                          className="text-sm text-emerald-600 font-medium hover:underline"
                        >
                          通过
                        </button>
                        <button
                          onClick={() => setRejectTarget(hotel.id)}
                          className="text-sm text-red-500 font-medium hover:underline"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                    {hotel.status === 'approved' && (
                      <button
                        onClick={() => handleAction(hotel.id, 'published')}
                        className="text-sm text-blue-600 font-medium hover:underline"
                      >
                        发布
                      </button>
                    )}
                    {hotel.status === 'published' && (
                      <button
                        onClick={() => handleAction(hotel.id, 'offline')}
                        className="text-sm text-gray-500 font-medium hover:underline"
                      >
                        下线
                      </button>
                    )}
                    {hotel.status === 'offline' && (
                      <button
                        onClick={() => handleAction(hotel.id, 'published')}
                        className="text-sm text-emerald-600 font-medium hover:underline"
                      >
                        恢复上线
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RejectModal
        key={rejectTarget}
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </div>
  );
}
