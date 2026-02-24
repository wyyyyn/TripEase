import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminHotelDetailAPI, changeHotelStatusAPI, getReviewLogsAPI } from '../../shared/api/admin';
import type { ReviewLogResponse } from '../../shared/api/admin';
import { toManagedHotel } from '../../shared/store/hotelStore';
import StatusBadge from '../components/StatusBadge';
import RejectModal from '../components/RejectModal';
import type { ManagedHotel } from '../../shared/types/admin';

// 状态名称的中文映射（用于审核日志展示）
const STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  published: '已发布',
  offline: '已下线',
};

export default function AdminReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<ManagedHotel | null>(null);
  const [logs, setLogs] = useState<ReviewLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectKey, setRejectKey] = useState(0);
  const openReject = () => { setRejectOpen(true); setRejectKey((k) => k + 1); };

  const numericId = id ? Number(id) : NaN;

  // 加载酒店详情 + 审核日志
  const fetchData = async () => {
    if (Number.isNaN(numericId)) return;
    setLoading(true);
    setError('');
    try {
      const [detail, reviewLogs] = await Promise.all([
        getAdminHotelDetailAPI(numericId),
        getReviewLogsAPI(numericId),
      ]);
      setHotel(toManagedHotel(detail));
      setLogs(reviewLogs);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [numericId]);

  // 审核操作
  const handleAction = async (status: 'approved' | 'published' | 'offline') => {
    try {
      await changeHotelStatusAPI(numericId, status);
      fetchData();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  // 拒绝操作
  const handleReject = async (reason: string) => {
    try {
      await changeHotelStatusAPI(numericId, 'rejected', reason);
      setRejectOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="p-8">
        <p className="text-gray-500">{error || '酒店未找到'}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <button
        onClick={() => navigate('/admin/review')}
        className="flex items-center gap-1 text-gray-500 hover:text-dark text-sm mb-6 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        返回列表
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark mb-2">{hotel.name}</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={hotel.status} />
            <div className="flex items-center gap-0.5">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <span key={i} className="material-symbols-outlined text-accent text-sm">star_rate</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {hotel.status === 'pending' && (
            <>
              <button
                onClick={() => handleAction('approved')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
              >
                通过审核
              </button>
              <button
                onClick={openReject}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
              >
                拒绝
              </button>
            </>
          )}
          {hotel.status === 'approved' && (
            <button
              onClick={() => handleAction('published')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
            >
              发布上线
            </button>
          )}
          {hotel.status === 'published' && (
            <button
              onClick={() => handleAction('offline')}
              className="border border-gray-200 text-dark font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              下线
            </button>
          )}
          {hotel.status === 'offline' && (
            <button
              onClick={() => handleAction('published')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
            >
              恢复上线
            </button>
          )}
        </div>
      </div>

      {/* Reject reason */}
      {hotel.status === 'rejected' && hotel.rejectReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-red-700 mb-1">拒绝原因</p>
          <p className="text-sm text-red-600">{hotel.rejectReason}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-dark mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">地址</span>
              <p className="text-dark font-medium mt-0.5">{hotel.address || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">价格</span>
              <p className="text-dark font-medium mt-0.5">¥{hotel.pricePerNight}/晚</p>
            </div>
          </div>
        </section>

        {/* Images */}
        {hotel.images.length > 0 && (
          <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">酒店图片</h2>
            <div className="grid grid-cols-4 gap-3">
              {hotel.images.map((img, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tags & Amenities */}
        <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-dark mb-4">标签 & 设施</h2>
          {hotel.tags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">标签</p>
              <div className="flex flex-wrap gap-2">
                {hotel.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-accent/10 text-dark text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {hotel.amenities.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">设施</p>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((amenity) => (
                  <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Rooms */}
        {hotel.rooms.length > 0 && (
          <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">
              房型 ({hotel.rooms.length})
            </h2>
            <div className="space-y-3">
              {hotel.rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl"
                >
                  {room.image && (
                    <img
                      src={room.image}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark">{room.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{room.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>{room.bedType}</span>
                      <span>{room.size}</span>
                      <span className="font-medium text-dark">¥{room.pricePerNight}/晚</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Review Logs */}
        {logs.length > 0 && (
          <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">审核记录</h2>
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl text-sm"
                >
                  <div className="flex-1">
                    <span className="font-medium text-dark">{log.operatorName}</span>
                    <span className="text-gray-500 mx-2">将状态从</span>
                    <span className="font-medium">{STATUS_LABEL[log.fromStatus] || log.fromStatus}</span>
                    <span className="text-gray-500 mx-2">变更为</span>
                    <span className="font-medium">{STATUS_LABEL[log.toStatus] || log.toStatus}</span>
                  </div>
                  {log.reason && (
                    <span className="text-gray-500 text-xs">原因：{log.reason}</span>
                  )}
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(log.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <RejectModal
        key={rejectKey}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
    </div>
  );
}
