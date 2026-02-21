import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  defaultSearch,
  recentSearches,
  bannerSlides,
  popularHotels,
  editorPicks,
  userRecommendations,
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

function formatViews(views: number): string {
  if (views >= 10000) return (views / 10000).toFixed(1) + '万';
  return views.toLocaleString();
}

export default function HotelSearchHome() {
  const navigate = useNavigate();

  // Search state
  const [keyword, setKeyword] = useState(defaultSearch.keyword || '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ priceRange: null, starLevel: null });
  const hasActiveFilter = filters.priceRange !== null || filters.starLevel !== null;
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(defaultSearch.guests);
  const [children, setChildren] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);

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

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    resetTimer();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    if (touchDeltaX.current < -threshold) {
      goToSlide((currentSlide + 1) % bannerSlides.length);
    } else if (touchDeltaX.current > threshold) {
      goToSlide((currentSlide - 1 + bannerSlides.length) % bannerSlides.length);
    }
  };

  return (
    <div className="min-h-dvh bg-cream pb-24">
      {/* Status bar spacer */}
      <div className="pt-safe w-full" />

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
          <button className="p-3 rounded-full hover:bg-white hover:shadow-subtle transition-all text-icon-gray" aria-label="通知">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-3 rounded-full hover:bg-white hover:shadow-subtle transition-all text-icon-gray" aria-label="账户">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <main className="px-5 space-y-6">
        {/* Hero Banner Carousel */}
        <div
          className="relative w-full h-48 rounded-2xl overflow-hidden shadow-soft"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {bannerSlides.map((slide) => (
              <Link
                key={slide.id}
                to={`/hotel/${slide.id}`}
                className="relative w-full h-full flex-shrink-0 block"
              >
                <img
                  alt={slide.name}
                  className="w-full h-full object-cover"
                  src={slide.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <span className="bg-accent text-dark text-xs font-bold px-3 py-1.5 rounded-pill w-max mb-2 tracking-wider">
                    {slide.badge}
                  </span>
                  <h2 className="text-white text-xl font-bold">
                    {slide.name}
                  </h2>
                  <p className="text-white/80 text-xs mt-1">{slide.subtitle}</p>
                  <p className="text-white/90 text-sm mt-1 flex items-center font-medium">
                    <span
                      className="material-symbols-outlined text-sm mr-1 text-accent"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    {slide.rating} ({slide.reviewCount}+ Reviews)
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {/* Indicator dots */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {bannerSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); goToSlide(idx); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'w-5 bg-white'
                    : 'w-1.5 bg-white/50'
                }`}
                aria-label={`切换到第${idx + 1}张`}
              />
            ))}
          </div>
        </div>

        {/* Search Form Card */}
        <div className="bg-white rounded-2xl shadow-soft p-5 space-y-4">
          {/* Destination + Keyword */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer">
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">目的地</label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-accent mr-2 text-xl">near_me</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark truncate">{defaultSearch.city}</p>
                  <p className="text-[11px] text-gray-500">{defaultSearch.citySubtext}</p>
                </div>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors">
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">关键词</label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
                <input
                  className="w-full bg-transparent border-none p-0 text-sm font-medium text-dark placeholder-gray-400 focus:outline-none"
                  placeholder="酒店名称..."
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Check-in / Check-out */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              className="text-left border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer"
            >
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">入住</label>
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
              onClick={() => setCalendarOpen(true)}
              className="text-left border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer"
            >
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">退房</label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 mr-2 text-lg">event</span>
                <div>
                  <p className="text-sm font-semibold text-dark">{checkOutDisplay}</p>
                  <p className="text-[11px] text-gray-500">{checkOutDayDisplay}</p>
                </div>
              </div>
            </button>
          </div>

          {/* Guests + Filters */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setGuestOpen(true)}
              className="text-left flex-1 border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-accent/30 transition-colors cursor-pointer"
            >
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">入住人数</label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 mr-2 text-lg">person</span>
                <span className="text-sm font-medium text-dark">{guestDisplay}</span>
              </div>
            </button>
            <div className="flex items-end gap-2 pb-1">
              <button
                onClick={() => setFilterOpen(true)}
                className={`flex items-center px-3 py-2 rounded-pill text-xs font-medium border transition-colors whitespace-nowrap ${
                  filters.priceRange
                    ? 'bg-accent/20 border-accent text-dark'
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-accent/40'
                }`}
              >
                价格
              </button>
              <button
                onClick={() => setFilterOpen(true)}
                className={`flex items-center px-3 py-2 rounded-pill text-xs font-medium border transition-colors whitespace-nowrap ${
                  hasActiveFilter
                    ? 'bg-accent/20 border-accent text-dark'
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-accent/40'
                }`}
              >
                <span className="material-symbols-outlined text-sm mr-0.5">tune</span>
                筛选
              </button>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={() => navigate('/list')}
            className="w-full bg-dark hover:bg-dark-hover text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-[0.98] transform transition duration-200 flex justify-center items-center text-base"
          >
            搜索酒店
          </button>
        </div>

        {/* Recent Searches — compact inline */}
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar -mt-2">
          {recentSearches.map((item, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white rounded-pill shadow-subtle text-xs cursor-pointer hover:shadow-card transition-shadow"
            >
              <span className="material-symbols-outlined text-gray-400 text-sm">history</span>
              <span className="font-medium text-dark">{item.city}</span>
              <span className="text-gray-400">{item.dates}</span>
            </div>
          ))}
        </div>

        {/* Popular Hotels by City */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-dark">热门酒店</h3>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="material-symbols-outlined text-lg text-dark">arrow_forward</span>
            </button>
          </div>
          <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2 px-1">
            {popularHotels.map((hotel) => (
              <div key={hotel.id} className="min-w-[220px] max-w-[220px] cursor-pointer group">
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-dark text-[11px] font-bold px-2.5 py-1 rounded-pill shadow-sm">
                    人气优选
                  </span>
                  <button className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/90 transition-colors">
                    <span className="material-symbols-outlined text-base text-gray-600">favorite</span>
                  </button>
                </div>
                <div className="mt-2.5 px-0.5">
                  <p className="text-sm font-bold text-dark truncate">{hotel.name} · {hotel.city}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{hotel.dates}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="font-bold text-dark">¥{hotel.price}</span>
                    <span className="text-gray-400 ml-0.5">/ {hotel.nights}晚</span>
                    <span className="mx-1.5 text-gray-300">·</span>
                    <span
                      className="material-symbols-outlined text-xs text-accent"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="font-medium ml-0.5">{hotel.rating}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor's Picks */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <div>
              <h3 className="text-lg font-bold text-dark">编辑精选</h3>
              <p className="text-xs text-gray-500 mt-0.5">精心挑选的特色好店</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="material-symbols-outlined text-lg text-dark">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto hide-scrollbar px-1">
            <div className="grid grid-rows-2 grid-flow-col gap-3 pb-2" style={{ width: 'max-content' }}>
              {editorPicks.map((pick) => (
                <div key={pick.id} className="w-[160px] bg-white rounded-xl overflow-hidden shadow-subtle border border-gray-50 cursor-pointer hover:shadow-card transition-shadow">
                  <div className="relative h-[100px]">
                    <img src={pick.image} alt={pick.name} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 w-6 h-6 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/90 transition-colors">
                      <span className="material-symbols-outlined text-sm text-gray-500">favorite</span>
                    </button>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[13px] font-semibold text-dark truncate">{pick.name}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-red-500">¥{pick.price}<span className="font-normal text-gray-400">起</span></span>
                      <span className="text-[11px] text-gray-500 flex items-center">
                        <span
                          className="material-symbols-outlined text-xs mr-0.5 text-accent"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        {pick.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Recommendations — Xiaohongshu-style waterfall */}
        <div className="px-1">
          <h3 className="text-lg font-bold text-dark mb-4">种草推荐</h3>
          <div className="flex gap-3 items-start">
            {/* Left column */}
            <div className="flex-1 space-y-3">
              {userRecommendations.filter((_, i) => i % 2 === 0).map((rec) => (
                <div key={rec.id} className="bg-white rounded-xl overflow-hidden shadow-subtle cursor-pointer hover:shadow-card transition-shadow">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="w-full object-cover"
                    style={{ aspectRatio: rec.aspectRatio }}
                  />
                  <div className="p-3">
                    <p className="text-[13px] font-semibold text-dark line-clamp-2 leading-snug">{rec.title}</p>
                    {rec.tag && (
                      <div className="flex items-center mt-2">
                        {rec.hotLabel ? (
                          <span className="text-[11px] text-orange-500 font-medium">🔥 {rec.hotLabel}</span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                            {rec.tag}
                          </span>
                        )}
                      </div>
                    )}
                    {rec.rating && (
                      <div className="flex items-center mt-1.5">
                        <span className="text-xs font-bold text-accent">{rec.rating}分</span>
                        <span className="text-[11px] text-gray-400 ml-1.5">{rec.reviewCount}条评论</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center min-w-0">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
                        <span className="text-[11px] text-gray-500 ml-1.5 truncate">{rec.author}</span>
                      </div>
                      <div className="flex items-center text-[11px] text-gray-400 flex-shrink-0 ml-2">
                        <span className="material-symbols-outlined text-xs mr-0.5">visibility</span>
                        {formatViews(rec.views)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Right column */}
            <div className="flex-1 space-y-3">
              {userRecommendations.filter((_, i) => i % 2 === 1).map((rec) => (
                <div key={rec.id} className="bg-white rounded-xl overflow-hidden shadow-subtle cursor-pointer hover:shadow-card transition-shadow">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="w-full object-cover"
                    style={{ aspectRatio: rec.aspectRatio }}
                  />
                  <div className="p-3">
                    <p className="text-[13px] font-semibold text-dark line-clamp-2 leading-snug">{rec.title}</p>
                    {rec.tag && (
                      <div className="flex items-center mt-2">
                        {rec.hotLabel ? (
                          <span className="text-[11px] text-orange-500 font-medium">🔥 {rec.hotLabel}</span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                            {rec.tag}
                          </span>
                        )}
                      </div>
                    )}
                    {rec.rating && (
                      <div className="flex items-center mt-1.5">
                        <span className="text-xs font-bold text-accent">{rec.rating}分</span>
                        <span className="text-[11px] text-gray-400 ml-1.5">{rec.reviewCount}条评论</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center min-w-0">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
                        <span className="text-[11px] text-gray-500 ml-1.5 truncate">{rec.author}</span>
                      </div>
                      <div className="flex items-center text-[11px] text-gray-400 flex-shrink-0 ml-2">
                        <span className="material-symbols-outlined text-xs mr-0.5">visibility</span>
                        {formatViews(rec.views)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 pt-2 px-6 pb-safe-nav shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] z-50 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <button className="flex flex-col items-center text-dark relative" aria-label="首页" aria-current="page">
            <span className="absolute -top-1 w-8 h-1 bg-accent rounded-full" />
            <span
              className="material-symbols-outlined text-2xl mt-1"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              home
            </span>
            <span className="text-[10px] font-bold mt-1">首页</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-dark transition-colors" aria-label="收藏">
            <span className="material-symbols-outlined text-2xl">
              favorite
            </span>
            <span className="text-[10px] font-medium mt-1">收藏</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-dark transition-colors" aria-label="订单">
            <span className="material-symbols-outlined text-2xl">
              confirmation_number
            </span>
            <span className="text-[10px] font-medium mt-1">订单</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-dark transition-colors" aria-label="我的">
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
