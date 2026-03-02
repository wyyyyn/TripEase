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
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'published', label: '已发布' },
  { value: 'offline', label: '已下线' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/* ------------------------------------------------------------------ */
/*  Stat card color mapping                                           */
/* ------------------------------------------------------------------ */

const STAT_CARDS: {
  key: keyof DashboardStatsResponse;
  label: string;
  dotColor: string;
}[] = [
  { key: 'pending', label: '待审核', dotColor: 'bg-amber-300' },
  { key: 'approved', label: '已通过', dotColor: 'bg-emerald-400' },
  { key: 'rejected', label: '已驳回', dotColor: 'bg-rose-400' },
  { key: 'offline', label: '已下线', dotColor: 'bg-slate-900' },
];

/* ------------------------------------------------------------------ */
/*  Helper: status badge text + color                                 */
/* ------------------------------------------------------------------ */

function statusText(s: ReviewStatus): string {
  const map: Record<ReviewStatus, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    published: '已上线',
    offline: '已下线',
  };
  return map[s] ?? s;
}

function statusDotColor(s: ReviewStatus): string {
  const map: Record<ReviewStatus, string> = {
    draft: 'bg-slate-400',
    pending: 'bg-amber-300',
    approved: 'bg-emerald-400',
    rejected: 'bg-rose-400',
    published: 'bg-blue-400',
    offline: 'bg-slate-900',
  };
  return map[s] ?? 'bg-slate-400';
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
    return hotels.filter((h) => h.name.toLowerCase().includes(term));
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
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-slate-800">酒店信息管理</h1>
        <p className="text-xs text-slate-400 mt-1">
          审核商户提交的酒店信息，管理酒店上线/下线状态
        </p>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="bg-white border border-slate-100 p-2.5 rounded shadow-sm"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`size-1.5 rounded-full ${card.dotColor}`} />
              <span className="text-[11px] text-slate-500">{card.label}</span>
            </div>
            <div className="text-[10px] text-slate-400 mb-0.5">--</div>
            <div className="text-xl font-bold text-slate-800">
              {stats ? stats[card.key] : '--'}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-white border border-slate-100 rounded shadow-sm px-3 py-2 mb-4 flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[260px]">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            placeholder="搜索酒店名称"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-admin-accent"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'all')}
          className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-admin-accent bg-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Placeholder filters */}
        <select className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-400" disabled>
          <option>酒店星级</option>
        </select>
        <select className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-400" disabled>
          <option>所属区域</option>
        </select>
        <select className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-400" disabled>
          <option>提交时间</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            重置
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Data table */}
      <div className="bg-white border border-slate-100 rounded shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="w-8 px-3 py-3">
                <input type="checkbox" className="accent-admin-accent" disabled />
              </th>
              <th className="text-left px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                酒店名称
              </th>
              <th className="text-left px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                星级
              </th>
              <th className="text-left px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                审核状态
              </th>
              <th className="text-left px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                提交时间
              </th>
              <th className="text-right px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-16 text-center text-slate-400 text-xs">
                  加载中...
                </td>
              </tr>
            )}
            {!loading && paged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-16 text-center text-slate-400 text-xs">
                  暂无数据
                </td>
              </tr>
            )}
            {!loading &&
              paged.map((hotel) => {
                const numericId = Number(hotel.id);
                const status = hotel.status;
                return (
                  <tr
                    key={hotel.id}
                    className="h-[64px] hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Checkbox */}
                    <td className="w-8 px-3">
                      <input type="checkbox" className="accent-admin-accent" />
                    </td>

                    {/* Hotel name + thumbnail */}
                    <td className="px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-[4px] bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {hotel.images?.[0] ? (
                            <img
                              src={hotel.images[0]}
                              alt=""
                              className="size-10 object-cover rounded-[4px]"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-slate-300 text-lg">
                              apartment
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {hotel.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {hotel.address}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Star rating */}
                    <td className="px-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: hotel.starRating }).map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-amber-300"
                            style={{ fontSize: '14px' }}
                          >
                            star_rate
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`size-1.5 rounded-full flex-shrink-0 ${statusDotColor(status)}`}
                        />
                        <span className="text-[11px] text-[#666]">
                          {statusText(status)}
                        </span>
                      </div>
                    </td>

                    {/* Submit date */}
                    <td className="px-3">
                      <span className="text-[11px] text-[#999] font-mono">
                        {new Date(hotel.createdAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Pending: 审核 button */}
                        {status === 'pending' && (
                          <button
                            onClick={() => navigate(`/admin/review/${hotel.id}`)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded bg-admin-accent text-white hover:opacity-90 transition-opacity"
                          >
                            审 核
                          </button>
                        )}

                        {/* Approved+Published: 下线 button */}
                        {(status === 'approved' || status === 'published') && (
                          <button
                            onClick={() => handleAction(numericId, 'offline')}
                            className="px-2.5 py-1 text-[11px] font-medium rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            下 线
                          </button>
                        )}

                        {/* Rejected: 查看原因 button */}
                        {status === 'rejected' && (
                          <button
                            onClick={() => navigate(`/admin/review/${hotel.id}`)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                          >
                            查看原因
                          </button>
                        )}

                        {/* Offline: 下线 button (already offline, visually consistent) */}
                        {status === 'offline' && (
                          <button
                            onClick={() => handleAction(numericId, 'published')}
                            className="px-2.5 py-1 text-[11px] font-medium rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            上 线
                          </button>
                        )}

                        {/* 详情 link */}
                        <button
                          onClick={() => navigate(`/admin/review/${hotel.id}`)}
                          className="text-[11px] text-slate-400 hover:text-admin-accent transition-colors"
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

      {/* Pagination footer */}
      {!loading && totalCount > 0 && (
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>共 {totalCount} 条</span>
            <span>每页显示</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>条</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              className="size-7 flex items-center justify-center rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            {buildPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`dot-${idx}`} className="px-1 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`size-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                    p === safePage
                      ? 'bg-admin-accent text-white'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            {/* Next */}
            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              className="size-7 flex items-center justify-center rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
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
