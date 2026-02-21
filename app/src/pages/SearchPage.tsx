import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultSearch, recentSearches, cityLandmarks } from '../data/mockData';
import FilterModal, { type FilterState } from '../components/FilterModal';
import CalendarModal from '../components/CalendarModal';
import GuestModal from '../components/GuestModal';

function useOpenCounter() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  const doOpen = useCallback(() => { setOpen(true); setKey((k) => k + 1); }, []);
  const doClose = useCallback(() => setOpen(false), []);
  return { open, key, doOpen, doClose } as const;
}

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function formatDate(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatWeekday(date: Date) {
  return WEEKDAY_NAMES[date.getDay()];
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const filter = useOpenCounter();
  const [filters, setFilters] = useState<FilterState>({ priceRange: null, starLevel: null });
  const hasActiveFilter = filters.priceRange !== null || filters.starLevel !== null;

  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const calendar = useOpenCounter();

  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(defaultSearch.guests);
  const [children, setChildren] = useState(0);
  const guest = useOpenCounter();

  const checkInDisplay = checkInDate ? formatDate(checkInDate) : defaultSearch.checkIn;
  const checkInDayDisplay = checkInDate ? formatWeekday(checkInDate) : defaultSearch.checkInDay;
  const checkOutDisplay = checkOutDate ? formatDate(checkOutDate) : defaultSearch.checkOut;
  const checkOutDayDisplay = checkOutDate ? formatWeekday(checkOutDate) : defaultSearch.checkOutDay;
  const nightsDisplay = checkInDate && checkOutDate
    ? Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : defaultSearch.nights;
  const guestDisplay = children > 0
    ? `${adults}成人 ${children}儿童`
    : `${adults}位成人`;

  const handleCalendarConfirm = (inDate: Date, outDate: Date) => {
    setCheckInDate(inDate);
    setCheckOutDate(outDate);
    calendar.doClose();
  };

  const handleGuestConfirm = (r: number, a: number, c: number) => {
    setRooms(r);
    setAdults(a);
    setChildren(c);
    guest.doClose();
  };

  return (
    <div className="min-h-dvh bg-cream pb-safe-bottom">
      <div className="pt-safe w-full" />

      {/* Header */}
      <header className="flex items-center px-5 py-3 gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white hover:shadow-subtle transition-all text-dark"
          aria-label="返回"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-dark">搜索酒店</h1>
      </header>

      <main className="px-4 space-y-6">
        {/* Search Form */}
        <div className="bg-surface rounded-3xl shadow-soft p-5 space-y-4">
          {/* Destination */}
          <div className="group border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-colors cursor-pointer">
            <label className="block text-xs text-gray-400 mb-1">目的地</label>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-dark mb-0.5">{defaultSearch.city}</p>
                <p className="text-xs text-gray-400">{defaultSearch.citySubtext}</p>
              </div>
              <span className="material-symbols-outlined text-accent rotate-45 group-hover:scale-110 transition-transform">navigation</span>
            </div>
          </div>

          {/* Keyword */}
          <div className="group border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-colors cursor-text flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400 text-2xl group-focus-within:text-dark transition-colors">search</span>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-0.5">关键词</label>
              <input
                className="w-full bg-transparent border-none p-0 text-base font-medium text-dark placeholder-gray-400 focus:outline-none"
                placeholder="酒店名称、地标..."
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Check-in / Check-out */}
          <button
            type="button"
            onClick={calendar.doOpen}
            className="w-full border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-colors cursor-pointer flex items-center relative"
          >
            {/* 入住 */}
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-400 mb-1">入住</p>
              <p className="text-xl font-bold text-dark">{checkInDisplay}</p>
              <p className="text-xs text-gray-400 mt-0.5">{checkInDayDisplay}</p>
            </div>
            {/* 晚数 */}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#FFF8E1] text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
              {nightsDisplay}晚
            </span>
            {/* 退房 */}
            <div className="flex-1 text-right">
              <p className="text-xs text-gray-400 mb-1">退房</p>
              <p className="text-xl font-bold text-dark">{checkOutDisplay}</p>
              <p className="text-xs text-gray-400 mt-0.5">{checkOutDayDisplay}</p>
            </div>
          </button>

          {/* Guests */}
          <button
            type="button"
            onClick={guest.doOpen}
            className="text-left w-full border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-colors cursor-pointer flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-gray-400 text-2xl">person_outline</span>
            <div>
              <label className="block text-xs text-gray-400 mb-0.5">入住人数</label>
              <span className="text-base font-medium text-dark">{guestDisplay}</span>
            </div>
          </button>

          {/* Quick Filter Tags */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5">
            <button className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium bg-gray-50 text-dark hover:bg-gray-100 transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-sm text-accent">emoji_events</span>
              上榜酒店
            </button>
            <button className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium bg-gray-50 text-dark hover:bg-gray-100 transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-sm text-amber-500">star</span>
              4.7分以上
            </button>
            <button className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium bg-gray-50 text-dark hover:bg-gray-100 transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-sm text-gray-500">airport_shuttle</span>
              免费接送机
            </button>
            {(cityLandmarks[defaultSearch.city] ?? []).map((lm) => (
              <button
                key={lm.name}
                className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium bg-gray-50 text-dark hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm text-gray-500">{lm.icon}</span>
                {lm.name}
              </button>
            ))}
            <button
              onClick={filter.doOpen}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                hasActiveFilter
                  ? 'bg-accent/20 text-dark'
                  : 'bg-gray-50 text-dark hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-gray-500">tune</span>
              更多筛选
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={() => navigate('/list')}
          className="w-full bg-dark hover:bg-dark-hover text-white font-bold py-4 rounded-2xl shadow-lg shadow-dark/20 active:scale-[0.98] transform transition-all duration-200 flex justify-center items-center text-lg"
        >
          搜索酒店
        </button>

        {/* Recent Searches */}
        <div>
          <h3 className="text-sm font-bold text-dark mb-4 pl-1">最近搜索</h3>
          <div className="space-y-3 pb-4">
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-surface rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 mt-0.5">history</span>
                  <div>
                    <p className="text-base font-bold text-dark">{item.city}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.dates} · {item.guests}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-xl -rotate-45">arrow_forward</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <FilterModal
        key={filter.key}
        open={filter.open}
        onClose={filter.doClose}
        onApply={setFilters}
        initialFilters={filters}
      />
      <CalendarModal
        key={calendar.key}
        open={calendar.open}
        onClose={calendar.doClose}
        onConfirm={handleCalendarConfirm}
        initialCheckIn={checkInDate}
        initialCheckOut={checkOutDate}
      />
      <GuestModal
        key={guest.key}
        open={guest.open}
        onClose={guest.doClose}
        onConfirm={handleGuestConfirm}
        initialRooms={rooms}
        initialAdults={adults}
        initialChildren={children}
      />
    </div>
  );
}
