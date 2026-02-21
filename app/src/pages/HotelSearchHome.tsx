import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  recentSearches,
  bannerSlides,
  popularHotels,
  editorPicks,
  userRecommendations,
} from '../data/mockData';

function formatViews(views: number): string {
  if (views >= 10000) return (views / 10000).toFixed(1) + '万';
  return views.toLocaleString();
}

export default function HotelSearchHome() {
  const navigate = useNavigate();
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

        {/* Search Bar */}
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center bg-white rounded-pill px-5 py-3.5 shadow-soft hover:shadow-card transition-shadow cursor-pointer"
          aria-label="搜索酒店"
        >
          <span className="material-symbols-outlined text-gray-400 text-xl mr-3">search</span>
          <span className="text-gray-400 text-[15px] font-medium">搜索酒店</span>
        </button>

        {/* Recent Searches — compact inline cards */}
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar -mt-2">
          {recentSearches.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate('/search')}
              className="flex-shrink-0 w-[88px] bg-white rounded-xl p-2.5 shadow-subtle hover:shadow-card transition-shadow text-center"
            >
              <span className="material-symbols-outlined text-accent text-lg">location_on</span>
              <p className="text-xs font-bold text-dark mt-1 truncate">{item.city}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.guests}</p>
            </button>
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

    </div>
  );
}
