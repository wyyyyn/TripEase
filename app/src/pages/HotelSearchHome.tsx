import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  defaultSearch,
  categories,
  recentSearches,
  featuredHotel,
} from '../data/mockData';
import FilterModal, { type FilterState } from '../components/FilterModal';
import CalendarModal from '../components/CalendarModal';
import GuestModal from '../components/GuestModal';

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function formatDate(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatWeekday(date: Date) {
  return WEEKDAY_NAMES[date.getDay()];
}

export default function HotelSearchHome() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(defaultSearch.keyword || '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ priceRange: null, starLevel: null });
  const hasActiveFilter = filters.priceRange !== null || filters.starLevel !== null;

  // Date state
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Guest state
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(defaultSearch.guests);
  const [children, setChildren] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);

  // Derived display values
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
    setCalendarOpen(false);
  };

  const handleGuestConfirm = (r: number, a: number, c: number) => {
    setRooms(r);
    setAdults(a);
    setChildren(c);
    setGuestOpen(false);
  };

  return (
    <div className="min-h-dvh bg-cream pb-24">
      {/* Status bar spacer */}
      <div className="h-12 w-full" />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-dark">
            <span className="material-symbols-outlined">travel_explore</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-dark">
            TripEase
          </h1>
        </div>
        <div className="flex space-x-4">
          <button className="p-2 rounded-full hover:bg-white hover:shadow-subtle transition-all text-icon-gray">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white hover:shadow-subtle transition-all text-icon-gray">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <main className="px-5 space-y-6">
        {/* Featured Deal Banner */}
        <Link
          to="/hotel/5"
          className="relative w-full h-48 rounded-2xl overflow-hidden shadow-soft group cursor-pointer block transform transition hover:scale-[1.01]"
        >
          <img
            alt={featuredHotel.name}
            className="w-full h-full object-cover"
            src={featuredHotel.image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-5">
            <span className="bg-accent text-dark text-xs font-bold px-3 py-1.5 rounded-pill w-max mb-2 uppercase tracking-wider">
              {featuredHotel.discount}
            </span>
            <h2 className="text-white text-xl font-bold">
              {featuredHotel.name}
            </h2>
            <p className="text-white/90 text-sm mt-1 flex items-center font-medium">
              <span
                className="material-symbols-outlined text-sm mr-1 text-accent"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              {featuredHotel.rating} ({featuredHotel.reviewCount}+ Reviews)
            </p>
          </div>
        </Link>

        {/* Search Form Card */}
        <div className="bg-white rounded-2xl shadow-soft p-6 space-y-6">
          {/* Destination */}
          <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide px-1">
              目的地
            </label>
            <div className="flex items-center cursor-pointer">
              <span className="material-symbols-outlined text-accent mr-3 text-2xl">
                near_me
              </span>
              <div className="flex-1">
                <p className="text-lg font-semibold text-dark">
                  {defaultSearch.city}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {defaultSearch.citySubtext}
                </p>
              </div>
            </div>
          </div>

          {/* Check-in / Check-out */}
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setCalendarOpen(true)}
              className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer"
            >
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide px-1">
                入住
              </label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 mr-2">
                  calendar_today
                </span>
                <div>
                  <p className="text-base font-semibold text-dark">
                    {checkInDisplay}
                  </p>
                  <p className="text-xs text-gray-500">
                    {checkInDayDisplay}
                  </p>
                </div>
              </div>
            </div>
            <div
              onClick={() => setCalendarOpen(true)}
              className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer"
            >
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide px-1">
                退房
              </label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 mr-2">
                  event
                </span>
                <div>
                  <p className="text-base font-semibold text-dark">
                    {checkOutDisplay}
                  </p>
                  <p className="text-xs text-gray-500">
                    {checkOutDayDisplay}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyword + Guests */}
          <div className="flex gap-4">
            <div className="flex-1 border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide px-1">
                关键词
              </label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 mr-2">
                  search
                </span>
                <input
                  className="w-full bg-transparent border-none p-0 text-base font-medium text-dark placeholder-gray-400 focus:outline-none"
                  placeholder="酒店名称..."
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
            <div
              onClick={() => setGuestOpen(true)}
              className="w-[38%] border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer"
            >
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide px-1">
                入住人数
              </label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 mr-2">
                  person
                </span>
                <span className="text-base font-medium text-dark">
                  {guestDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => setFilterOpen(true)}
              className={`flex items-center px-4 py-2 rounded-pill text-sm font-medium border transition-colors whitespace-nowrap shadow-sm ${
                filters.priceRange
                  ? 'bg-accent/20 border-accent text-dark'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:bg-cream'
              }`}
            >
              <span className="material-symbols-outlined text-lg mr-1.5">
                attach_money
              </span>
              价格
            </button>
            <button
              onClick={() => setFilterOpen(true)}
              className={`flex items-center px-4 py-2 rounded-pill text-sm font-medium border transition-colors whitespace-nowrap shadow-sm ${
                filters.starLevel
                  ? 'bg-accent/20 border-accent text-dark'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:bg-cream'
              }`}
            >
              <span className="material-symbols-outlined text-lg mr-1.5">
                star_rate
              </span>
              评分
            </button>
            <button
              onClick={() => setFilterOpen(true)}
              className={`flex items-center px-4 py-2 rounded-pill text-sm font-medium border transition-colors whitespace-nowrap shadow-sm ${
                hasActiveFilter
                  ? 'bg-accent/20 border-accent text-dark'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:bg-cream'
              }`}
            >
              <span className="material-symbols-outlined text-lg mr-1.5">
                tune
              </span>
              更多筛选
            </button>
          </div>

          {/* Search Button */}
          <button
            onClick={() => navigate('/list')}
            className="w-full bg-dark hover:bg-dark-hover text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transform transition duration-200 flex justify-center items-center text-lg"
          >
            搜索酒店
          </button>
        </div>

        {/* Popular Categories */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-dark">热门分类</h3>
            <span className="text-dark text-sm font-medium underline decoration-accent decoration-2 underline-offset-4 cursor-pointer hover:text-accent transition-colors">
              查看全部
            </span>
          </div>
          <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-4 px-1">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="flex flex-col items-center space-y-2 min-w-[72px] cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-pill bg-white border border-gray-100 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-dark text-2xl">
                    {cat.icon}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-dark transition-colors">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        <div className="px-1">
          <h3 className="text-lg font-bold text-dark mb-4">最近搜索</h3>
          <div className="space-y-3">
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center p-3 bg-white rounded-2xl shadow-subtle border border-gray-100 cursor-pointer hover:border-accent/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center mr-4 text-dark">
                  <span className="material-symbols-outlined">history</span>
                </div>
                <div>
                  <p className="font-bold text-dark text-sm">{item.city}</p>
                  <p className="text-xs text-gray-500">
                    {item.dates} · {item.guests}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 pt-2 px-6 pb-6 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] z-50 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <button className="flex flex-col items-center text-dark relative">
            <span className="absolute -top-1 w-8 h-1 bg-accent rounded-full" />
            <span
              className="material-symbols-outlined text-2xl mt-1"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              home
            </span>
            <span className="text-[10px] font-bold mt-1">首页</span>
          </button>
          <button className="flex flex-col items-center text-gray-400 hover:text-dark transition-colors">
            <span className="material-symbols-outlined text-2xl">
              favorite
            </span>
            <span className="text-[10px] font-medium mt-1">收藏</span>
          </button>
          <button className="flex flex-col items-center text-gray-400 hover:text-dark transition-colors">
            <span className="material-symbols-outlined text-2xl">
              confirmation_number
            </span>
            <span className="text-[10px] font-medium mt-1">订单</span>
          </button>
          <button className="flex flex-col items-center text-gray-400 hover:text-dark transition-colors">
            <span className="material-symbols-outlined text-2xl">person</span>
            <span className="text-[10px] font-medium mt-1">我的</span>
          </button>
        </div>
      </nav>

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
      <CalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onConfirm={handleCalendarConfirm}
        initialCheckIn={checkInDate}
        initialCheckOut={checkOutDate}
      />
      <GuestModal
        open={guestOpen}
        onClose={() => setGuestOpen(false)}
        onConfirm={handleGuestConfirm}
        initialRooms={rooms}
        initialAdults={adults}
        initialChildren={children}
      />
    </div>
  );
}
