import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminHotelsAPI,
  changeHotelStatusAPI,
  getDashboardStatsAPI,
} from '../../shared/api/admin';
import type { DashboardStatsResponse } from '../../shared/api/admin';
import { listItemToManagedHotel } from '../../shared/store/hotelStore';
import RejectModal from '../components/RejectModal';
import type { ReviewStatus, ManagedHotel } from '../../shared/types/admin';

/* ------------------------------------------------------------------ */
/*  Status filter options                                             */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS: { value: ReviewStatus | 'all'; label: string }[] = [
  { value: 'all', label: '审核状态' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '未通过' },
  { value: 'published', label: '已发布' },
  { value: 'offline', label: '已下线' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/* ------------------------------------------------------------------ */
/*  Stat card config                                                  */
/* ------------------------------------------------------------------ */

const STAT_CARDS: {
  key: keyof DashboardStatsResponse;
  label: string;
  dotColor: string;
  trend: string;
  trendColor: string;
}[] = [
  { key: 'pending', label: '待审核', dotColor: 'bg-amber-400', trend: '较昨日 +5', trendColor: 'text-emerald-500' },
  { key: 'approved', label: '已通过', dotColor: 'bg-emerald-500', trend: '较昨日 +3', trendColor: 'text-emerald-500' },
  { key: 'rejected', label: '已驳回', dotColor: 'bg-rose-500', trend: '较昨日 -2', trendColor: 'text-rose-500' },
  { key: 'offline', label: '已下线', dotColor: 'bg-slate-900', trend: '无变化', trendColor: 'text-slate-400' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** 审核状态 column text */
function reviewStatusText(s: ReviewStatus): string {
  const map: Record<ReviewStatus, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已通过',
    rejected: '未通过',
    published: '已通过',
    offline: '已通过',
  };
  return map[s] ?? s;
}

/** 上线状态 column text */
function onlineStatusText(s: ReviewStatus): string | null {
  if (s === 'published') return '已上线';
  if (s === 'offline') return '已下线';
  return null;
}

/** Star rating as ★ characters */
function starString(n: number): string {
  return '★'.repeat(n);
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function AdminReviewList() {
  const navigate = useNavigate();

  // ---------- data states ----------
  const [hotels, setHotels] = useState<ManagedHotel[]>([]);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ---------- filter / pagination states ----------
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ---------- reject modal ----------
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);

  // ---------- data fetching ----------
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const list = await getAdminHotelsAPI(status);
      setHotels(list.map(listItemToManagedHotel));
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStatsAPI();
      setStats(data);
    } catch {
      // stats are non-critical, silently ignore
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ---------- client-side search + pagination ----------
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return hotels;
    const term = searchTerm.trim().toLowerCase();
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        (h.ownerName && h.ownerName.toLowerCase().includes(term)),
    );
  }, [hotels, searchTerm]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // reset page when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm, pageSize]);

  // ---------- actions ----------
  const handleAction = async (id: number, status: ReviewStatus) => {
    try {
      await changeHotelStatusAPI(id, status);
      fetchHotels();
      fetchStats();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleReject = async (reason: string) => {
    if (rejectTarget !== null) {
      try {
        await changeHotelStatusAPI(rejectTarget, 'rejected', reason);
        setRejectTarget(null);
        fetchHotels();
        fetchStats();
      } catch (err: any) {
        alert(err.message || '操作失败');
      }
    }
  };

  // ---------- pagination helpers ----------
  function buildPageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('...');
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }

  // ---------- render ----------
  return (
    <div className="flex flex-col min-h-full bg-white">
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

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-auto">
        {/* Page title + description */}
        <div className="px-8 py-4">
          <div className="mb-3">
            <h1 className="text-xl font-bold text-slate-900">酒店信息管理</h1>
            <p className="text-slate-400 text-[12px]">审核商户提交的酒店信息，管理酒店上线/下线状态</p>
          </div>

          {/* Statistics cards */}
          <div className="grid grid-cols-4 gap-4 max-w-7xl">
            {STAT_CARDS.map((card) => (
              <div key={card.key} className="bg-white border border-slate-100 p-2.5 rounded shadow-sm">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-slate-500 font-semibold text-[9px] flex items-center gap-1.5 uppercase tracking-wider">
                    <span className={`size-1.5 rounded-full ${card.dotColor}`} /> {card.label}
                  </span>
                  <span className={`text-[9px] font-bold ${card.trendColor}`}>{card.trend}</span>
                </div>
                <div className="text-xl font-bold text-slate-900 leading-tight">
                  {stats ? stats[card.key] : '--'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-8 py-2.5 bg-white border-y border-gray-50 sticky top-0 z-10">
          <div className="flex flex-wrap items-center gap-2 max-w-7xl">
            {/* Search */}
            <div className="relative w-48">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-base">
                search
              </span>
              <input
                type="text"
                placeholder="搜索酒店、商户"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-12 py-1.5 border border-slate-200 focus:border-[#2D5BFF] focus:ring-0 rounded text-[11px] placeholder:text-slate-400"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#2D5BFF] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                搜索
              </button>
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'all')}
              className="bg-white border-slate-200 rounded py-1 pl-2 pr-6 text-[11px] font-medium text-slate-600 focus:ring-0 focus:border-[#2D5BFF] min-w-[90px]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Placeholder filters */}
            <select className="bg-white border-slate-200 rounded py-1 pl-2 pr-6 text-[11px] font-medium text-slate-600 focus:ring-0 focus:border-[#2D5BFF] min-w-[90px]" disabled>
              <option>上线状态</option>
            </select>
            <select className="bg-white border-slate-200 rounded py-1 pl-2 pr-6 text-[11px] font-medium text-slate-600 focus:ring-0 focus:border-[#2D5BFF] min-w-[90px]" disabled>
              <option>酒店星级</option>
            </select>
            <select className="bg-white border-slate-200 rounded py-1 pl-2 pr-6 text-[11px] font-medium text-slate-600 focus:ring-0 focus:border-[#2D5BFF] min-w-[90px]" disabled>
              <option>所属区域</option>
            </select>
            <select className="bg-white border-slate-200 rounded py-1 pl-2 pr-6 text-[11px] font-medium text-slate-600 focus:ring-0 focus:border-[#2D5BFF] min-w-[90px]" disabled>
              <option>提交时间</option>
            </select>

            {/* More filters */}
            <button className="flex items-center gap-1 px-2 py-1 border border-slate-200 hover:bg-slate-50 rounded text-[11px] font-bold transition-colors text-slate-600">
              <span className="material-symbols-outlined text-sm">tune</span>更多筛选
            </button>

            {/* Right side: reset + export */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
              >
                重置
              </button>
              <button className="text-[11px] font-bold text-[#2D5BFF] flex items-center gap-1 hover:opacity-80">
                <span className="material-symbols-outlined text-sm">download</span>导出
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Data table */}
        <div className="px-8 pb-10">
          <div className="max-w-7xl mx-auto overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="w-10 px-4 py-2 border-b border-gray-100">
                    <input type="checkbox" className="rounded border-slate-300 text-[#2D5BFF] focus:ring-0" disabled />
                  </th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100">酒店名称</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100">商户</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100">星级</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100">审核状态</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100">上线状态</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100">提交时间</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right border-b border-gray-100 min-w-[140px]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-3 py-16 text-center text-slate-400 text-xs">
                      加载中...
                    </td>
                  </tr>
                )}
                {!loading && paged.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-16 text-center text-slate-400 text-xs">
                      暂无数据
                    </td>
                  </tr>
                )}
                {!loading &&
                  paged.map((hotel) => {
                    const numericId = Number(hotel.id);
                    const status = hotel.status;
                    return (
                      <tr key={hotel.id} className="hover:bg-slate-50/50 transition-colors h-[64px]">
                        {/* Checkbox */}
                        <td className="px-4">
                          <input type="checkbox" className="rounded border-slate-300 text-[#2D5BFF] focus:ring-0" />
                        </td>

                        {/* Hotel name + thumbnail */}
                        <td className="px-3">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-[4px] bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {hotel.images?.[0] ? (
                                <img src={hotel.images[0]} alt="" className="size-10 object-cover rounded-[4px]" />
                              ) : (
                                <span className="material-symbols-outlined text-slate-300 text-lg">apartment</span>
                              )}
                            </div>
                            <span className="font-bold text-[#333] text-[13px]">{hotel.name}</span>
                          </div>
                        </td>

                        {/* Merchant name */}
                        <td className="px-3 text-[13px] text-[#666]">
                          {hotel.ownerName || `商户${hotel.ownerId}`}
                        </td>

                        {/* Star rating */}
                        <td className="px-3 text-amber-400 text-[10px]">
                          {starString(hotel.starRating)}
                        </td>

                        {/* 审核状态 */}
                        <td className="px-3">
                          <span className="text-[#666] text-[11px]">{reviewStatusText(status)}</span>
                        </td>

                        {/* 上线状态 */}
                        <td className="px-3">
                          {onlineStatusText(status) ? (
                            <span className="text-[#666] text-[11px]">{onlineStatusText(status)}</span>
                          ) : (
                            <span className="text-slate-300 text-[11px]">-</span>
                          )}
                        </td>

                        {/* Submit date */}
                        <td className="px-3">
                          <span className="text-[11px] text-[#999] font-mono">
                            {new Date(hotel.createdAt).toLocaleDateString('sv-SE')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 text-right min-w-[140px]">
                          <div className="flex items-center justify-end gap-2">
                            {/* Pending → 审核 */}
                            {status === 'pending' && (
                              <button
                                onClick={() => navigate(`/admin/review/${hotel.id}`)}
                                className="bg-[#2D5BFF] text-white px-2 py-1 rounded text-[11px] font-medium shadow-sm min-w-[72px]"
                              >
                                审 核
                              </button>
                            )}

                            {/* Published → 下线 */}
                            {(status === 'approved' || status === 'published') && (
                              <button
                                onClick={() => handleAction(numericId, 'offline')}
                                className="bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded text-[11px] font-medium hover:bg-slate-50 min-w-[72px]"
                              >
                                下 线
                              </button>
                            )}

                            {/* Rejected → 查看原因 */}
                            {status === 'rejected' && (
                              <button
                                onClick={() => navigate(`/admin/review/${hotel.id}`)}
                                className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded text-[11px] font-medium min-w-[72px]"
                              >
                                查看原因
                              </button>
                            )}

                            {/* Offline → 恢复上线 */}
                            {status === 'offline' && (
                              <button
                                onClick={() => handleAction(numericId, 'published')}
                                className="bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded text-[11px] font-medium hover:bg-slate-50 min-w-[72px]"
                              >
                                恢复上线
                              </button>
                            )}

                            {/* 详情 link */}
                            <button
                              onClick={() => navigate(`/admin/review/${hotel.id}`)}
                              className="text-slate-500 text-[11px] font-medium hover:text-[#2D5BFF] underline-offset-2 hover:underline"
                            >
                              详情
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Pagination Footer ── */}
      {!loading && totalCount > 0 && (
        <footer className="h-14 px-8 bg-white border-t border-gray-100 flex items-center shrink-0">
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
            {/* Left: total + page size */}
            <div className="flex items-center">
              <p className="text-[12px] text-slate-500 mr-12">
                共 <span className="font-bold text-slate-700">{totalCount}</span> 条
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-slate-500">每页显示</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="text-[12px] font-bold bg-white border border-slate-200 rounded py-1 pl-2.5 pr-8 focus:ring-0 focus:border-[#2D5BFF]"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span className="text-[12px] text-slate-500">条</span>
              </div>
            </div>

            {/* Right: page buttons */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {buildPageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={`dot-${idx}`} className="px-1 text-slate-400 text-[12px]">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[28px] h-7 px-2 text-[12px] font-bold rounded transition-colors ${
                      p === safePage
                        ? 'text-white bg-[#2D5BFF]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Reject modal */}
      <RejectModal
        key={rejectTarget}
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </div>
  );
}
