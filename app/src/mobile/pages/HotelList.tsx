import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultSearch } from '../data/mockData';
import { usePublishedHotels } from '../../shared/store/useStore';

type PriceSortDir = 'asc' | 'desc' | null;

interface ActiveFilters {
  smartSort: boolean;
  priceSort: PriceSortDir;
  rating45: boolean;
  breakfast: boolean;
  freeCancel: boolean;
  distance: boolean;
}

export default function HotelList() {
  const navigate = useNavigate();
  const hotels = usePublishedHotels();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    smartSort: true,
    priceSort: null,
    rating45: false,
    breakfast: false,
    freeCancel: false,
    distance: false,
  });

  const toggleFavorite = (e: React.MouseEvent, hotelId: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(hotelId)) {
        next.delete(hotelId);
      } else {
        next.add(hotelId);
      }
      return next;
    });
  };

  const getBadgeBg = (color?: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500';
      case 'dark':
        return 'bg-dark/80 backdrop-blur-sm';
      case 'green':
        return 'bg-emerald-500';
      case 'accent':
        return 'bg-accent';
      default:
        return 'bg-dark/80';
    }
  };

  const getBadgeText = (color?: string) => {
    return color === 'accent' ? 'text-dark' : 'text-white';
  };

  // Filter logic
  const handleFilterClick = (filter: keyof ActiveFilters) => {
    setActiveFilters((prev) => {
      if (filter === 'smartSort') {
        return {
          smartSort: true,
          priceSort: null,
          rating45: false,
          breakfast: false,
          freeCancel: false,
          distance: false,
        };
      }
      if (filter === 'priceSort') {
        const newDir: PriceSortDir =
          prev.priceSort === null ? 'asc' : prev.priceSort === 'asc' ? 'desc' : null;
        return { ...prev, smartSort: false, priceSort: newDir };
      }
      return { ...prev, smartSort: false, [filter]: !prev[filter] };
    });
  };

  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    if (activeFilters.rating45) {
      result = result.filter((h) => h.rating >= 4.5);
    }
    if (activeFilters.breakfast) {
      result = result.filter((h) =>
        h.rooms.some(
          (r) =>
            r.badge?.includes('早餐') ||
            r.features.some((f) => f.includes('早餐'))
        )
      );
    }
    if (activeFilters.freeCancel) {
      result = result.filter((h) =>
        h.tags.includes('免费取消') ||
        h.rooms.some((r) => r.badge?.includes('免费取消'))
      );
    }

    if (activeFilters.priceSort === 'asc') {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (activeFilters.priceSort === 'desc') {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    }

    return result;
  }, [activeFilters, hotels]);

  // Infinite scroll
  const [displayCount, setDisplayCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [prevFilteredLength, setPrevFilteredLength] = useState(filteredHotels.length);

  // Reset displayCount when filters change (React-approved render-time state adjustment)
  if (filteredHotels.length !== prevFilteredLength) {
    setPrevFilteredLength(filteredHotels.length);
    setDisplayCount(Math.min(3, filteredHotels.length));
  }

  const allLoaded = displayCount >= filteredHotels.length;

  const loadMore = useCallback(() => {
    if (loading || allLoaded) return;
    setLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 2, filteredHotels.length));
      setLoading(false);
    }, 800);
  }, [loading, allLoaded, filteredHotels.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const displayedHotels = filteredHotels.slice(0, displayCount);

  // Filter pills config
  const filterPills = [
    {
      key: 'smartSort' as const,
      label: '智能排序',
      icon: 'expand_more',
      active: activeFilters.smartSort,
    },
    {
      key: 'priceSort' as const,
      label:
        activeFilters.priceSort === 'asc'
          ? '价格↑'
          : activeFilters.priceSort === 'desc'
            ? '价格↓'
            : '价格',
      icon: 'expand_more',
      active: activeFilters.priceSort !== null,
    },
    { key: 'rating45' as const, label: '评分4.5+', active: activeFilters.rating45 },
    { key: 'breakfast' as const, label: '含早餐', active: activeFilters.breakfast },
    { key: 'freeCancel' as const, label: '免费取消', active: activeFilters.freeCancel },
    { key: 'distance' as const, label: '距离', active: activeFilters.distance },
  ];

  return (
    <div className="min-h-dvh bg-cream">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md shadow-sm border-b border-gray-100/50 pt-safe">
        {/* Search Bar */}
        <div className="px-4 pb-3 pt-3">
          <div
            className="flex items-center gap-3 bg-white p-3 rounded-card shadow-card cursor-pointer active:scale-[0.99] transform transition-transform border border-gray-50"
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            aria-label="返回搜索"
          >
            <span className="material-symbols-outlined text-dark text-xl">
              search
            </span>
            <div className="flex-1">
              <p className="font-bold text-base text-dark">
                {defaultSearch.city}
              </p>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>
                  {defaultSearch.checkIn} - {defaultSearch.checkOut}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{defaultSearch.nights}晚</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{defaultSearch.guests}位客人</span>
              </div>
            </div>
            <button className="bg-cream p-3 rounded-full shadow-sm border border-gray-100">
              <span className="material-symbols-outlined text-dark">tune</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-4 overflow-x-auto hide-scrollbar flex items-center gap-2">
          {filterPills.map((pill) => (
            <button
              key={pill.key}
              onClick={() => handleFilterClick(pill.key)}
              aria-pressed={pill.active}
              className={`flex items-center gap-1 px-4 py-2.5 min-h-[44px] rounded-pill text-sm font-medium whitespace-nowrap transition-colors ${
                pill.active
                  ? 'bg-accent/20 border border-accent text-dark'
                  : 'bg-white border border-gray-200 text-gray-500 shadow-sm'
              }`}
            >
              <span>{pill.label}</span>
              {pill.icon && (
                <span className="material-symbols-outlined text-sm">
                  {pill.icon}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hotel Cards */}
      <main className="px-4 py-4 space-y-5 pb-24">
        {displayedHotels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
              search_off
            </span>
            <p className="text-gray-500 text-base font-medium">暂无匹配酒店</p>
            <p className="text-gray-400 text-sm mt-1">尝试调整筛选条件</p>
          </div>
        )}

        {displayedHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-card shadow-card overflow-hidden group cursor-pointer"
            onClick={() => navigate(`/hotel/${hotel.id}`)}
            tabIndex={0}
            role="link"
            aria-label={hotel.name}
          >
            {/* Image Section */}
            <div className="relative h-56 w-full overflow-hidden">
              <img
                alt={hotel.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                src={hotel.images[0]}
              />
              {/* Badge */}
              {hotel.badge && (
                <div
                  className={`absolute top-3 left-3 ${getBadgeBg(hotel.badgeColor)} ${getBadgeText(hotel.badgeColor)} text-xs font-bold px-3 py-1.5 rounded-pill shadow-sm`}
                >
                  {hotel.badge}
                </div>
              )}
              {/* Favorite Button */}
              <button
                className="absolute top-3 right-3 bg-white/40 backdrop-blur-md p-2 rounded-full hover:bg-white/60 transition shadow-sm"
                onClick={(e) => toggleFavorite(e, hotel.id)}
                aria-label={favorites.has(hotel.id) ? '取消收藏' : '收藏'}
                aria-pressed={favorites.has(hotel.id)}
              >
                <span className="material-symbols-outlined text-white text-xl">
                  {favorites.has(hotel.id) ? 'favorite' : 'favorite_border'}
                </span>
              </button>
            </div>

            {/* Info Section */}
            <div className="p-5">
              {/* Hotel Name + Rating */}
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <h2 className="text-[18px] font-bold text-dark leading-tight mb-1.5">
                    {hotel.name}
                  </h2>
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <span className="material-symbols-outlined text-sm mr-1">
                      location_on
                    </span>
                    <span>{hotel.address}</span>
                    <span className="mx-1">·</span>
                    <span>{hotel.distanceFromCenter}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className="bg-accent/20 text-dark text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    {hotel.rating}
                    <span className="material-symbols-outlined text-[12px]">
                      star_rate
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {hotel.reviewCount.toLocaleString()}条评论
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {hotel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-1 bg-gray-50 text-gray-500 rounded-pill border border-gray-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="flex justify-between items-end border-t border-gray-50 pt-4 mt-1">
                <div className="flex flex-col">
                  {hotel.originalPrice && (
                    <span className="text-xs text-red-500 line-through font-medium">
                      {hotel.currency} {hotel.originalPrice}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-dark">
                      {hotel.currency} {hotel.pricePerNight}
                    </span>
                    <span className="text-xs text-gray-500">/晚</span>
                  </div>
                </div>
                <button
                  className="px-5 py-2.5 rounded-pill text-sm font-semibold bg-accent hover:bg-accent-hover text-dark transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/hotel/${hotel.id}`);
                  }}
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Sentinel / Loading / All loaded */}
        <div ref={sentinelRef} className="py-4 flex flex-col items-center justify-center gap-2">
          {loading && (
            <>
              <div className="w-8 h-8 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">正在加载更多酒店...</p>
            </>
          )}
          {allLoaded && filteredHotels.length > 0 && (
            <p className="text-xs text-gray-500">已加载全部酒店</p>
          )}
        </div>
      </main>

      {/* Map View Button */}
      <div className="fixed left-1/2 transform -translate-x-1/2 z-40" style={{ bottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <button className="flex items-center gap-2 bg-dark text-white px-6 py-3.5 rounded-pill shadow-lg font-semibold text-sm hover:scale-105 transition-transform ring-4 ring-white/20 backdrop-blur-sm">
          <span className="material-symbols-outlined text-lg">map</span>
          <span>地图模式</span>
        </button>
      </div>
    </div>
  );
}
