import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotels, filterTags, defaultSearch } from '../data/mockData';

export default function HotelList() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  return (
    <div className="min-h-dvh bg-cream">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md shadow-sm border-b border-gray-100/50">
        {/* Search Bar */}
        <div className="px-4 pb-3 pt-3">
          <div
            className="flex items-center gap-3 bg-white p-3 rounded-card shadow-card cursor-pointer active:scale-[0.99] transform transition-transform border border-gray-50"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined text-dark text-xl">
              search
            </span>
            <div className="flex-1">
              <h1 className="font-bold text-base text-dark">
                {defaultSearch.city}
              </h1>
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
            <button className="bg-cream p-2 rounded-full shadow-sm border border-gray-100">
              <span className="material-symbols-outlined text-dark">tune</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-4 overflow-x-auto hide-scrollbar flex items-center gap-2">
          {filterTags.map((tag) => (
            <button
              key={tag.label}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-pill text-sm font-medium whitespace-nowrap transition-colors ${
                tag.active
                  ? 'bg-accent/20 border border-accent text-dark'
                  : 'bg-white border border-gray-200 text-gray-500 shadow-sm'
              }`}
            >
              <span>{tag.label}</span>
              {tag.icon && (
                <span className="material-symbols-outlined text-sm">
                  {tag.icon}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hotel Cards */}
      <main className="px-4 py-4 space-y-5 pb-24">
        {hotels.map((hotel, index) => (
          <div
            key={hotel.id}
            className="bg-white rounded-card shadow-card overflow-hidden group cursor-pointer"
            onClick={() => navigate(`/hotel/${hotel.id}`)}
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
                  <h3 className="text-[18px] font-bold text-dark leading-tight mb-1.5">
                    {hotel.name}
                  </h3>
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
                      star
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
                  className={`px-5 py-2.5 rounded-pill text-sm font-semibold transition-colors ${
                    index % 2 === 0
                      ? 'bg-accent hover:bg-accent-hover text-dark'
                      : 'bg-gray-100 hover:bg-gray-200 text-dark'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/hotel/${hotel.id}`);
                  }}
                >
                  {index % 2 === 0 ? '查看详情' : '选择房间'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Spinner */}
        <div className="py-4 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
          <p className="text-xs text-gray-500">正在加载更多酒店...</p>
        </div>
      </main>

      {/* Map View Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <button className="flex items-center gap-2 bg-dark text-white px-6 py-3.5 rounded-pill shadow-lg font-semibold text-sm hover:scale-105 transition-transform ring-4 ring-white/20 backdrop-blur-sm">
          <span className="material-symbols-outlined text-lg">map</span>
          <span>地图模式</span>
        </button>
      </div>
    </div>
  );
}
