import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultSearch, recentSearches } from '../data/mockData';
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

      <main className="px-5 space-y-5">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-soft p-5 space-y-4">
          {/* Destination */}
          <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors">
            <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide px-0.5">
              目的地
            </label>
            <div className="flex items-center cursor-pointer">
              <span className="material-symbols-outlined text-accent mr-2.5 text-xl">near_me</span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-dark truncate">{defaultSearch.city}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{defaultSearch.citySubtext}</p>
              </div>
            </div>
          </div>

          {/* Keyword */}
          <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors">
            <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide px-0.5">
              关键词
            </label>
            <div className="flex items-center">
              <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
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
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={calendar.doOpen}
              className="text-left border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer"
            >
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide px-0.5">入住</label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 mr-2 text-lg">calendar_today</span>
                <div>
                  <p className="text-sm font-semibold text-dark">{checkInDisplay}</p>
                  <p className="text-[11px] text-gray-500">{checkInDayDisplay}</p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={calendar.doOpen}
              className="text-left border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer"
            >
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide px-0.5">退房</label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 mr-2 text-lg">event</span>
                <div>
                  <p className="text-sm font-semibold text-dark">{checkOutDisplay}</p>
                  <p className="text-[11px] text-gray-500">{checkOutDayDisplay}</p>
                </div>
              </div>
            </button>
          </div>

          {/* Guests */}
          <button
            type="button"
            onClick={guest.doOpen}
            className="text-left w-full border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer"
          >
            <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide px-0.5">入住人数</label>
            <div className="flex items-center">
              <span className="material-symbols-outlined text-gray-400 mr-2 text-lg">person</span>
              <span className="text-sm font-medium text-dark">{guestDisplay}</span>
            </div>
          </button>

          {/* Filter Tags */}
          <div className="flex space-x-2.5 overflow-x-auto hide-scrollbar pb-0.5">
            <button
              onClick={filter.doOpen}
              className={`flex items-center px-3.5 py-2 rounded-pill text-[13px] font-medium border transition-colors whitespace-nowrap ${
                filters.priceRange
                  ? 'bg-accent/20 border-accent text-dark'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-accent/40'
              }`}
            >
              <span className="material-symbols-outlined text-base mr-1">attach_money</span>
              价格
            </button>
            <button
              onClick={filter.doOpen}
              className={`flex items-center px-3.5 py-2 rounded-pill text-[13px] font-medium border transition-colors whitespace-nowrap ${
                filters.starLevel
                  ? 'bg-accent/20 border-accent text-dark'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-accent/40'
              }`}
            >
              <span className="material-symbols-outlined text-base mr-1">star_rate</span>
              评分
            </button>
            <button
              onClick={filter.doOpen}
              className={`flex items-center px-3.5 py-2 rounded-pill text-[13px] font-medium border transition-colors whitespace-nowrap ${
                hasActiveFilter
                  ? 'bg-accent/20 border-accent text-dark'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-accent/40'
              }`}
            >
              <span className="material-symbols-outlined text-base mr-1">tune</span>
              更多筛选
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={() => navigate('/list')}
          className="w-full bg-dark hover:bg-dark-hover text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transform transition duration-200 flex justify-center items-center text-lg"
        >
          搜索酒店
        </button>

        {/* Recent Searches */}
        <div className="px-1">
          <h3 className="text-sm font-bold text-dark mb-3">最近搜索</h3>
          <div className="space-y-2.5 pb-4">
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center p-3 bg-white rounded-xl shadow-subtle cursor-pointer hover:shadow-card transition-shadow"
              >
                <span className="material-symbols-outlined text-gray-400 text-lg mr-3">history</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark">{item.city}</p>
                  <p className="text-[11px] text-gray-500 truncate">{item.dates} · {item.guests}</p>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-lg">north_west</span>
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
