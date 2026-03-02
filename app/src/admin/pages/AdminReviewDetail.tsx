import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminHotelDetailAPI, changeHotelStatusAPI, getReviewLogsAPI } from '../../shared/api/admin';
import type { ReviewLogResponse } from '../../shared/api/admin';
import { toManagedHotel } from '../../shared/store/hotelStore';
import RejectModal from '../components/RejectModal';
import type { ManagedHotel } from '../../shared/types/admin';
import type { ReviewStatus } from '../../shared/types/admin';

// ---------- Constants ----------

const STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  published: '已发布',
  offline: '已下线',
};

/** Right-panel title config per status */
const STATUS_PANEL: Record<
  ReviewStatus,
  { emoji: string; title: string; eng: string; nextAction: string }
> = {
  draft: { emoji: '', title: '草稿', eng: 'Draft', nextAction: '请先提交审核' },
  pending: { emoji: '\uD83D\uDFE1', title: '等待审核', eng: 'Pending Review', nextAction: '审核操作' },
  approved: { emoji: '\uD83D\uDFE2', title: '审核通过', eng: 'Approved', nextAction: '等待发布上线' },
  rejected: { emoji: '\uD83D\uDD34', title: '初审驳回', eng: 'First Round Rejected', nextAction: '等待商户修改中' },
  published: { emoji: '\uD83D\uDFE2', title: '已发布', eng: 'Published', nextAction: '当前已上线' },
  offline: { emoji: '\u26AB', title: '已下线', eng: 'Offline', nextAction: '可恢复上线' },
};

/** Progress dots: submitted -> reviewing -> result */
function getProgressState(status: ReviewStatus): [string, string, string] {
  switch (status) {
    case 'pending':
      return ['done', 'active', 'pending'];
    case 'approved':
    case 'published':
      return ['done', 'done', 'done'];
    case 'rejected':
      return ['done', 'done', 'rejected'];
    case 'offline':
      return ['done', 'done', 'offline'];
    default:
      return ['pending', 'pending', 'pending'];
  }
}

// ---------- Component ----------

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

  const handleAction = async (status: 'approved' | 'published' | 'offline') => {
    try {
      await changeHotelStatusAPI(numericId, status);
      fetchData();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await changeHotelStatusAPI(numericId, 'rejected', reason);
      setRejectOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  // ---------- Loading / Error ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-admin-accent border-t-transparent" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">{error || '酒店未找到'}</p>
      </div>
    );
  }

  const panel = STATUS_PANEL[hotel.status] ?? STATUS_PANEL.pending;
  const progress = getProgressState(hotel.status);
  const progressLabels = ['提交申请', '审核中', '审核结果'];

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] w-full max-w-6xl flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>

        {/* ===== Header ===== */}
        <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">酒店信息审核详情</h1>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-wide">
              V{logs.length} {STATUS_LABEL[hotel.status]}
            </span>
          </div>
          <button
            onClick={() => navigate('/admin/review')}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* ===== Body: Left + Right ===== */}
        <div className="flex flex-1 min-h-0">

          {/* ----- Left Panel (38%) ----- */}
          <div className="w-[38%] overflow-y-auto p-8 border-r border-gray-50">
            {/* Section title */}
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-base font-semibold text-gray-900">酒店信息预览</h2>
              {hotel.status === 'rejected' && (
                <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded">
                  需修改
                </span>
              )}
            </div>

            {/* -- 基础信息 -- */}
            <div className="mb-6">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-3">基础信息</p>
              <div className="space-y-2.5">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">酒店名称</p>
                  <p className="text-sm font-medium text-gray-900">{hotel.name}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">星级</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: hotel.starRating }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-amber-400 text-sm">star</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">基础价格</p>
                    <p className="text-sm font-medium text-gray-900">&yen;{hotel.pricePerNight}/晚</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">详细地址</p>
                  <p className="text-sm text-gray-700">{hotel.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* -- 房型与价格 -- */}
            {hotel.rooms.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-3">房型与价格</p>
                <div className="space-y-2">
                  {hotel.rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-admin-accent shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{room.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 shrink-0 ml-3">&yen;{room.pricePerNight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -- Tags & Amenities -- */}
            {(hotel.tags.length > 0 || hotel.amenities.length > 0) && (
              <div className="mb-6">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-3">标签 & 设施</p>
                <div className="flex flex-wrap gap-1.5">
                  {hotel.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-admin-accent/10 text-admin-accent text-xs rounded-full">{tag}</span>
                  ))}
                  {hotel.amenities.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* -- 图片预览 -- */}
            {hotel.images.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-3">图片预览</p>
                <div className="grid grid-cols-2 gap-2">
                  {hotel.images.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                {hotel.images.length > 4 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">+{hotel.images.length - 4} 更多图片</p>
                )}
              </div>
            )}
          </div>

          {/* ----- Right Panel (62%) ----- */}
          <div className="w-[62%] overflow-y-auto p-8 bg-white">
            {/* Status title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {panel.emoji} {panel.title} ({panel.eng})
              </h2>
              <p className="text-sm text-gray-500">
                {hotel.status === 'rejected' ? '等待商户修改' : panel.nextAction}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-0 mb-8 px-4">
              {progress.map((state, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  {/* Dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 ${
                        state === 'done'
                          ? 'bg-emerald-500 border-emerald-500'
                          : state === 'active'
                            ? 'bg-admin-accent border-admin-accent'
                            : state === 'rejected'
                              ? 'bg-red-500 border-red-500'
                              : state === 'offline'
                                ? 'bg-gray-500 border-gray-500'
                                : 'bg-white border-gray-300'
                      }`}
                    />
                    <span className="text-[10px] text-gray-400 mt-1.5 whitespace-nowrap">{progressLabels[i]}</span>
                  </div>
                  {/* Line */}
                  {i < progress.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mt-[-14px] ${
                        state === 'done' ? 'bg-emerald-400' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Next Action bar */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 mb-8 flex items-center gap-2">
              <span className="text-sm text-gray-500">Next Action:</span>
              <span className="text-sm font-medium text-gray-700">
                {hotel.status === 'rejected' && '\u23F3 '}
                {panel.nextAction}
              </span>
            </div>

            {/* Rejection details (only when rejected) */}
            {hotel.status === 'rejected' && hotel.rejectReason && (
              <div className="mb-8">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-3">驳回原因</p>
                <ul className="space-y-1.5 mb-4">
                  {hotel.rejectReason.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                      {line}
                    </li>
                  ))}
                </ul>
                <div className="bg-gray-50 border-l-2 border-gray-300 rounded-r-lg px-4 py-3">
                  <p className="text-xs text-gray-500 italic">{hotel.rejectReason}</p>
                </div>
              </div>
            )}

            {/* Audit History */}
            {logs.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-4">审核记录</p>
                <div className="relative pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

                  {logs.map((log, i) => {
                    const isKey = log.toStatus === 'rejected' || log.toStatus === 'approved' || log.toStatus === 'published';
                    const time = new Date(log.createdAt);
                    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

                    return (
                      <div key={log.id} className={`relative flex items-start gap-3 ${i < logs.length - 1 ? 'pb-4' : ''}`}>
                        {/* Dot / Flag */}
                        <div className="absolute -left-6 top-0.5 flex items-center justify-center w-4 h-4">
                          {isKey ? (
                            <span
                              className={`material-symbols-outlined text-sm ${
                                log.toStatus === 'rejected'
                                  ? 'text-red-500'
                                  : log.toStatus === 'approved'
                                    ? 'text-emerald-500'
                                    : 'text-admin-accent'
                              }`}
                            >
                              flag
                            </span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isKey ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                              {log.operatorName}: {STATUS_LABEL[log.fromStatus] || log.fromStatus} &rarr; {STATUS_LABEL[log.toStatus] || log.toStatus}
                            </span>
                            <span className="text-xs text-gray-400 shrink-0">{timeStr}</span>
                          </div>
                          {log.reason && (
                            <p className="text-xs text-gray-500 mt-0.5">原因: {log.reason}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== Footer ===== */}
        <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between shrink-0">
          <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-full tracking-wide uppercase">
            TripEase Audit System v4.2
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/review')}
              className="border border-gray-200 text-gray-600 font-medium py-2 px-5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              关闭
            </button>

            {hotel.status === 'pending' && (
              <>
                <button
                  onClick={openReject}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-5 rounded-lg transition-colors text-sm"
                >
                  拒绝
                </button>
                <button
                  onClick={() => handleAction('approved')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-5 rounded-lg transition-colors text-sm"
                >
                  通过审核
                </button>
              </>
            )}
            {hotel.status === 'approved' && (
              <button
                onClick={() => handleAction('published')}
                className="bg-admin-accent hover:bg-admin-accent/90 text-white font-medium py-2 px-5 rounded-lg transition-colors text-sm"
              >
                发布上线
              </button>
            )}
            {hotel.status === 'published' && (
              <button
                onClick={() => handleAction('offline')}
                className="border border-gray-200 text-gray-700 font-medium py-2 px-5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                下线
              </button>
            )}
            {hotel.status === 'offline' && (
              <button
                onClick={() => handleAction('published')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-5 rounded-lg transition-colors text-sm"
              >
                恢复上线
              </button>
            )}
            {hotel.status === 'rejected' && (
              <span className="text-sm text-gray-400 italic">等待商户修改中</span>
            )}
          </div>
        </div>
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
