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
  rejected: 'REJECTED',
  published: '已发布',
  offline: '已下线',
};

/** Right-panel title config per status */
const STATUS_PANEL: Record<
  ReviewStatus,
  { emoji: string; title: string; eng: string; subtitle: string; nextAction: string; nextIcon: string }
> = {
  draft: { emoji: '', title: '草稿', eng: 'Draft', subtitle: '尚未提交', nextAction: '请先提交审核', nextIcon: 'edit_note' },
  pending: { emoji: '\uD83D\uDFE1', title: '等待审核', eng: 'Pending Review', subtitle: '等待管理员审核', nextAction: '审核操作', nextIcon: 'rate_review' },
  approved: { emoji: '\uD83D\uDFE2', title: '审核通过', eng: 'Approved', subtitle: '等待发布上线', nextAction: '等待发布上线', nextIcon: 'check_circle' },
  rejected: { emoji: '\uD83D\uDD34', title: '初审驳回', eng: 'First Round Rejected', subtitle: '等待商户修改 (Waiting for Merchant Revision)', nextAction: '⏳ 等待商户修改中 (Waiting for Revision)', nextIcon: 'hourglass_empty' },
  published: { emoji: '\uD83D\uDFE2', title: '已发布', eng: 'Published', subtitle: '当前已上线', nextAction: '当前已上线', nextIcon: 'public' },
  offline: { emoji: '\u26AB', title: '已下线', eng: 'Offline', subtitle: '可恢复上线', nextAction: '可恢复上线', nextIcon: 'replay' },
};

/** Progress dots: [submitted, reviewing, result] — green/red/gray */
function getProgressColors(status: ReviewStatus): [string, string, string] {
  switch (status) {
    case 'pending':
      return ['bg-[#10B981]', 'bg-[#2D5BFF]', 'bg-gray-200'];
    case 'approved':
    case 'published':
      return ['bg-[#10B981]', 'bg-[#10B981]', 'bg-[#10B981]'];
    case 'rejected':
      return ['bg-[#10B981]', 'bg-[#EF4444]', 'bg-gray-200'];
    case 'offline':
      return ['bg-[#10B981]', 'bg-[#10B981]', 'bg-gray-500'];
    default:
      return ['bg-gray-200', 'bg-gray-200', 'bg-gray-200'];
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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2D5BFF] border-t-transparent" />
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
  const progressColors = getProgressColors(hotel.status);

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      {/* ── Top Header Bar ── */}
      <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-bold text-slate-800">审核管理</h2>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="flex gap-1 items-center">
            <span className="text-[11px] text-slate-400 font-medium">资源库</span>
            <span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>
            <span className="text-[11px] text-slate-600 font-semibold">酒店信息审核</span>
          </div>
        </div>
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-2 right-2 size-1.5 bg-[#2D5BFF] rounded-full" />
        </button>
      </header>

      {/* ── Main content area ── */}
      <div className="flex-1 relative flex items-center justify-center p-6 min-h-0">
        <div className="bg-white w-full max-w-6xl h-full max-h-[calc(100vh-80px)] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">

          {/* ===== Card Header ===== */}
          <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-800 tracking-tight">酒店信息审核详情</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-wider">
                V{logs.length} {STATUS_LABEL[hotel.status]}
              </span>
            </div>
            <button
              onClick={() => navigate('/admin/review')}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* ===== Body: Left + Right ===== */}
          <div className="flex-1 flex overflow-hidden min-h-0">

            {/* ----- Left Panel (38%) ----- */}
            <div className="w-[38%] h-full overflow-y-auto p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/5 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="flex items-center gap-2 mb-8">
                <h4 className="font-semibold text-slate-800 text-sm">酒店信息预览</h4>
                {hotel.status === 'rejected' && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 text-rose-500 text-[11px] font-medium">
                    <span className="material-symbols-outlined text-[14px]">report</span>
                    需修改
                  </span>
                )}
              </div>

              <div className="space-y-10">
                {/* 基础信息 */}
                <div className="space-y-4">
                  <h5 className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em]">基础信息</h5>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-2">
                      <label className="text-[12px] text-slate-400 block mb-1">酒店名称</label>
                      <div className="text-[14px] text-slate-800">{hotel.name}</div>
                    </div>
                    <div>
                      <label className="text-[12px] text-slate-400 block mb-1">酒店星级</label>
                      <div className="text-[13px] text-slate-800">{hotel.starRating} Stars</div>
                    </div>
                    <div>
                      <label className="text-[12px] text-slate-400 block mb-1">基础价格</label>
                      <div className="text-[13px] text-slate-800">&yen;{hotel.pricePerNight}/晚</div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[12px] text-slate-400 block mb-1">详细地址</label>
                      <div className="text-[13px] text-slate-800 leading-relaxed">{hotel.address || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* 房型与价格 */}
                {hotel.rooms.length > 0 && (
                  <div className="space-y-4">
                    <h5 className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em]">房型与价格</h5>
                    <div className="space-y-3">
                      {hotel.rooms.map((room) => (
                        <div key={room.id} className="flex justify-between items-center">
                          <span className="text-[13px] text-slate-700">{room.name}</span>
                          <span className="text-[13px] font-medium text-slate-900">&yen;{room.pricePerNight}/晚</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 图片预览 */}
                {hotel.images.length > 0 && (
                  <div className="space-y-4">
                    <h5 className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em]">图片预览</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {hotel.images.slice(0, 4).map((img, i) => (
                        <div key={i} className="aspect-[4/3] rounded overflow-hidden bg-gray-50 shrink-0">
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all cursor-zoom-in"
                          />
                        </div>
                      ))}
                    </div>
                    {hotel.images.length > 4 && (
                      <p className="text-xs text-gray-400 text-center">+{hotel.images.length - 4} 更多图片</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ----- Right Panel (62%) ----- */}
            <div className="w-[62%] h-full overflow-y-auto p-8 bg-white flex flex-col gap-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/5 [&::-webkit-scrollbar-thumb]:rounded-full">

              {/* Status title */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h4 className="text-xl font-bold text-slate-800">
                    {panel.emoji} {panel.title} ({panel.eng})
                  </h4>
                  <p className="text-sm text-slate-400">{panel.subtitle}</p>
                </div>

                {/* Progress dots */}
                <div className="relative flex items-center justify-between w-full max-w-sm">
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-100 -translate-y-1/2 z-0" />
                  {progressColors.map((color, i) => (
                    <div
                      key={i}
                      className={`relative z-10 flex items-center bg-white ${i === 0 ? 'pr-3' : i === 2 ? 'pl-3' : 'px-3'}`}
                    >
                      <div className={`size-2 rounded-full ${color}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Action bar */}
              <div className="bg-[#F3F4F6]/50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Next Action:</span>
                <div className="flex items-center gap-2 bg-[#F3F4F6] px-3 py-1.5 rounded text-slate-600 text-xs font-semibold select-none cursor-default border border-gray-200">
                  <span className="material-symbols-outlined text-sm">{panel.nextIcon}</span>
                  {panel.nextAction}
                </div>
              </div>

              {/* Rejection details (only when rejected) */}
              {hotel.status === 'rejected' && hotel.rejectReason && (
                <div className="space-y-4">
                  <h5 className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em]">驳回原因 Rejection Reasons</h5>
                  <div className="space-y-4">
                    <ul className="space-y-1.5 ml-1">
                      {hotel.rejectReason.split('\n').filter(Boolean).map((line, i) => (
                        <li key={i} className="text-[13px] text-[#EF4444]">• {line}</li>
                      ))}
                    </ul>
                    <div className="p-5 bg-[#F9FAFB] rounded-lg">
                      <p className="text-[13px] leading-relaxed text-slate-600">{hotel.rejectReason}</p>
                      <p className="text-[11px] text-slate-400 mt-4 pt-4 border-t border-gray-100/50">
                        提交人：{logs.length > 0 ? logs[logs.length - 1].operatorName : '管理员'} &middot;{' '}
                        {logs.length > 0
                          ? new Date(logs[logs.length - 1].createdAt).toLocaleString('zh-CN', { hour12: false })
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit History */}
              {logs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em]">审核记录 Audit History</h5>
                    <span className="material-symbols-outlined text-[14px] text-gray-300">expand_more</span>
                  </div>
                  <div className="space-y-4">
                    {logs.map((log) => {
                      const isKey = log.toStatus === 'rejected' || log.toStatus === 'approved' || log.toStatus === 'published';
                      const time = new Date(log.createdAt);
                      const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

                      return (
                        <div key={log.id} className="flex items-start gap-4">
                          <div className="mt-0.5 flex items-center justify-center w-5">
                            {isKey ? (
                              <span
                                className={`material-symbols-outlined text-[16px] ${
                                  log.toStatus === 'rejected'
                                    ? 'text-[#EF4444]'
                                    : log.toStatus === 'approved'
                                      ? 'text-[#10B981]'
                                      : 'text-[#2D5BFF]'
                                }`}
                              >
                                flag
                              </span>
                            ) : (
                              <div className="mt-1.5 w-5 flex justify-center">
                                <div className="size-1 rounded-full bg-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex justify-between items-baseline">
                            <span className={`text-[12px] ${isKey ? 'font-bold text-slate-800' : 'text-slate-400'}`}>
                              {log.toStatus === 'rejected'
                                ? `审核驳回 (Rejected by ${log.operatorName})`
                                : log.toStatus === 'approved'
                                  ? `审核通过 (Approved by ${log.operatorName})`
                                  : log.toStatus === 'published'
                                    ? `发布上线 (Published by ${log.operatorName})`
                                    : log.toStatus === 'pending'
                                      ? '提交申请'
                                      : `${log.fromStatus} → ${log.toStatus}`}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{timeStr}</span>
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
          <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.1em]">TripEase Audit System v4.2</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/admin/review')}
                className="text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                关闭 Close
              </button>

              {hotel.status === 'pending' && (
                <>
                  <button
                    onClick={openReject}
                    className="bg-[#EF4444] hover:bg-red-600 text-white font-medium py-2 px-5 rounded-lg transition-colors text-[13px]"
                  >
                    拒绝
                  </button>
                  <button
                    onClick={() => handleAction('approved')}
                    className="bg-[#10B981] hover:bg-emerald-600 text-white font-medium py-2 px-5 rounded-lg transition-colors text-[13px]"
                  >
                    通过审核
                  </button>
                </>
              )}
              {hotel.status === 'approved' && (
                <button
                  onClick={() => handleAction('published')}
                  className="bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white font-medium py-2 px-5 rounded-lg transition-colors text-[13px]"
                >
                  发布上线
                </button>
              )}
              {hotel.status === 'published' && (
                <button
                  onClick={() => handleAction('offline')}
                  className="border border-gray-200 text-gray-700 font-medium py-2 px-5 rounded-lg hover:bg-gray-50 transition-colors text-[13px]"
                >
                  下线
                </button>
              )}
              {hotel.status === 'offline' && (
                <button
                  onClick={() => handleAction('published')}
                  className="bg-[#10B981] hover:bg-emerald-600 text-white font-medium py-2 px-5 rounded-lg transition-colors text-[13px]"
                >
                  恢复上线
                </button>
              )}
              {hotel.status === 'rejected' && (
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-slate-500 text-[13px] font-semibold select-none cursor-default">
                  <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                  等待商户修改中 (Waiting for Revision)
                </div>
              )}
            </div>
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
