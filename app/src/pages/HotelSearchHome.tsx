import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  homeTabs,
  bannersByTab,
  popularByTab,
  picksByTab,
  userRecommendations,
} from '../data/mockData';
import type { HomeTabKey } from '../data/mockData';

function formatViews(views: number): string {
  if (views >= 10000) return (views / 10000).toFixed(1) + '万';
  return views.toLocaleString();
}

export default function HotelSearchHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HomeTabKey>('hotel');
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const bannerSlides = bannersByTab[activeTab];
  const popularHotels = popularByTab[activeTab];
  const editorPicks = picksByTab[activeTab];

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannersByTab[activeTab].length);
    }, 4000);
  }, [activeTab]);

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

  const handleTabChange = (key: HomeTabKey) => {
    setActiveTab(key);
    setCurrentSlide(0);
    resetTimer();
  };

  return (
    <div className="min-h-dvh bg-cream pb-24">
      {/* Hero Banner — image extends behind header */}
      <div
        className="relative w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image slides */}
        <div
          className="w-full overflow-hidden"
          style={{ height: 'calc(env(safe-area-inset-top, 0px) + 304px)' }}
        >
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {bannerSlides.map((slide) => (
              <Link
                key={slide.id}
                to={`/hotel/${slide.id}`}
                className="relative w-full h-full flex-shrink-0"
              >
                <img
                  alt={slide.name}
                  className="w-full h-full object-cover"
                  src={slide.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/5 flex flex-col justify-end px-6 pb-16">
                  <span className="bg-white/15 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1 rounded-full w-max mb-2 uppercase tracking-widest border border-white/20">
                    {slide.badge}
                  </span>
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-sm text-amber-400"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >star</span>
                    ))}
                  </div>
                  <h2 className="text-white text-xl font-bold leading-tight drop-shadow-sm">{slide.name}</h2>
                  <p className="text-white/70 text-xs mt-1">{slide.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
          {/* Bottom fade to cream */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-cream via-cream/70 to-transparent pointer-events-none z-10" />
        </div>

        {/* Header — overlaid on banner, semi-transparent */}
        <div className="absolute top-0 inset-x-0 z-30">
          <div className="pt-safe w-full" />
          <header className="flex justify-between items-center px-6 py-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-accent/90 backdrop-blur-md rounded-full flex items-center justify-center text-dark border border-accent/30">
                <span className="material-symbols-outlined">travel_explore</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
                TripEase
              </h1>
            </div>
            <div className="flex space-x-1">
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white/80 hover:bg-white/20 transition-all border border-white/10" aria-label="通知">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white/80 hover:bg-white/20 transition-all border border-white/10" aria-label="收藏">
                <span className="material-symbols-outlined text-xl">favorite</span>
              </button>
            </div>
          </header>
        </div>

        {/* Dots */}
        <div className="absolute bottom-16 right-5 flex gap-1.5 z-20">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-5 h-1.5 bg-white/80'
                  : 'w-1.5 h-1.5 bg-white/40'
              }`}
              aria-label={`切换到第${idx + 1}张`}
            />
          ))}
        </div>

      </div>

      <main className="px-5 space-y-6 -mt-12 relative z-20">
        {/* Category Tabs + Search Bar — glass card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-soft border border-white/80 overflow-hidden">
          {/* Tabs */}
          <div className="flex">
            {homeTabs.map((tab, idx) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 relative flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'text-dark'
                    : 'text-gray-400'
                }`}
              >
                {idx > 0 && activeTab !== tab.key && activeTab !== homeTabs[idx - 1].key && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-4 bg-gray-200" />
                )}
                <span className="material-symbols-outlined text-lg" style={activeTab === tab.key ? { fontVariationSettings: "'FILL' 1" } : undefined}>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-dark rounded-full" />
                )}
              </button>
            ))}
          </div>
          {/* Divider */}
          <div className="h-px bg-gray-100 mx-4" />
          {/* Search Bar */}
          <button
            onClick={() => navigate('/search')}
            className="w-full flex items-center px-5 py-4 cursor-pointer hover:bg-white/50 transition-colors"
            aria-label="搜索酒店"
          >
            <span className="material-symbols-outlined text-gray-400 text-xl mr-3">search</span>
            <span className="text-gray-400 text-[15px] font-medium">
              {activeTab === 'hotel' ? '搜索酒店' : activeTab === 'homestay' ? '搜索民宿' : '搜索钟点房'}
            </span>
          </button>
        </div>


        {/* Popular Hotels by City */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-dark">
              {activeTab === 'hotel' ? '热门酒店' : activeTab === 'homestay' ? '热门民宿' : '热门钟点房'}
            </h3>
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
                    {activeTab === 'hotel' ? '人气优选' : activeTab === 'homestay' ? '特色推荐' : '即时可订'}
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
                    <span className="text-gray-400 ml-0.5">/ {hotel.nights > 0 ? `${hotel.nights}晚` : '次'}</span>
                    <span className="mx-1.5 text-gray-300">·</span>
                    <span
                      className="material-symbols-outlined text-xs text-accent"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star_rate
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
              <p className="text-xs text-gray-500 mt-0.5">
                {activeTab === 'hotel' ? '精心挑选的特色好店' : activeTab === 'homestay' ? '住过都说好的民宿' : '灵活时段 即订即住'}
              </p>
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
                          star_rate
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
