import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotels, defaultSearch } from '../data/mockData';

const amenityIcons: Record<string, string> = {
  '免费WiFi': 'wifi',
  '泳池': 'pool',
  '餐厅': 'restaurant',
  '健身房': 'fitness_center',
  'Spa': 'spa',
  '停车场': 'local_parking',
  '行李寄存': 'luggage',
  '24小时前台': 'concierge',
  '洗衣服务': 'local_laundry_service',
  '商务中心': 'business_center',
  '会议室': 'meeting_room',
  '接机服务': 'airport_shuttle',
  '免费停车': 'local_parking',
  '无障碍': 'accessible',
  '自助服务': 'self_improvement',
  '机器人服务': 'smart_toy',
  '中式餐厅': 'restaurant',
  '下午茶': 'coffee',
  '城市夜景': 'nightlife',
  '厨房': 'countertops',
  '洗衣机': 'local_laundry_service',
  '游泳池': 'pool',
  '米其林餐厅': 'restaurant',
  '管家服务': 'room_service',
  '行政酒廊': 'lounge',
};

const badgeStyles: Record<string, string> = {
  green: 'bg-badge-success/10 text-badge-success',
  accent: 'bg-accent/20 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
  dark: 'bg-gray-100 text-gray-700',
};

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState(0);

  const hotel = hotels.find((h) => h.id === id);

  if (!hotel) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-icon-gray">酒店未找到</p>
      </div>
    );
  }

  const sortedRooms = [...hotel.rooms].sort(
    (a, b) => a.pricePerNight - b.pricePerNight
  );
  const lowestPrice = sortedRooms[0]?.pricePerNight ?? 0;
  const nights = defaultSearch.nights;
  const totalPrice = lowestPrice * nights;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentImage(index);
  };

  const displayAmenities = hotel.amenities.slice(0, 3);
  const moreCount = hotel.amenities.length - 3;

  return (
    <div className="min-h-dvh bg-cream pb-28">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md shadow-sm border-b border-gray-100/50">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 text-dark transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <h1 className="text-lg font-display font-semibold truncate flex-1 text-center px-4 text-dark">
            {hotel.name}
          </h1>
          <div className="flex gap-1">
            <button className="p-2 rounded-full hover:bg-black/5 text-dark transition-colors">
              <span className="material-symbols-outlined text-2xl">
                favorite
              </span>
            </button>
            <button className="p-2 -mr-2 rounded-full hover:bg-black/5 text-dark transition-colors">
              <span className="material-symbols-outlined text-2xl">
                ios_share
              </span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Image Carousel */}
        <div className="relative h-72 w-full rounded-b-card overflow-hidden bg-gray-200 shadow-md">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          >
            {hotel.images.map((img, i) => (
              <div key={i} className="snap-center shrink-0 w-full h-full">
                <img
                  src={img}
                  alt={`${hotel.name} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 right-4 bg-dark/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-sm">
              photo_library
            </span>
            <span>
              {currentImage + 1}/{hotel.images.length}
            </span>
          </div>
        </div>

        {/* Hotel Info */}
        <div className="px-5 pt-6 pb-2">
          <h2 className="text-2xl font-display font-bold text-dark leading-tight">
            {hotel.name}
          </h2>
          <div className="flex items-center gap-1 mt-1 text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`material-symbols-outlined filled text-lg ${
                  i < hotel.starRating ? 'text-accent' : 'text-gray-300'
                }`}
              >
                star
              </span>
            ))}
            <span className="text-sm font-medium text-icon-gray ml-1">
              {hotel.rating} ({hotel.reviewCount.toLocaleString()} 条评论)
            </span>
          </div>
          <div className="flex items-start gap-2 mt-3 text-icon-gray text-sm mb-6">
            <span className="material-symbols-outlined text-lg mt-0.5 text-icon-gray">
              location_on
            </span>
            <p className="leading-snug">
              {hotel.address} · {hotel.distanceFromCenter}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-4 gap-4 py-4">
            {displayAmenities.map((amenity) => (
              <div
                key={amenity}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="p-3 bg-white rounded-card shadow-sm text-icon-gray border border-gray-100">
                  <span className="material-symbols-outlined">
                    {amenityIcons[amenity] || 'check_circle'}
                  </span>
                </div>
                <span className="text-xs font-medium text-icon-gray">
                  {amenity}
                </span>
              </div>
            ))}
            {moreCount > 0 && (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-white rounded-card shadow-sm text-icon-gray border border-gray-100 cursor-pointer hover:bg-gray-50 transition">
                  <span className="text-sm font-bold font-display">
                    +{moreCount}
                  </span>
                </div>
                <span className="text-xs font-medium text-icon-gray">更多</span>
              </div>
            )}
          </div>
        </div>

        {/* Date Banner */}
        <div className="bg-white mx-4 rounded-card p-5 shadow-sm mb-8 flex items-center justify-between border border-gray-100">
          <div className="flex-1">
            <p className="text-[10px] text-icon-gray mb-1 font-bold uppercase tracking-wider">
              入住
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-display font-bold text-dark">
                {defaultSearch.checkIn}
              </span>
              <span className="text-xs text-icon-gray font-medium">
                {defaultSearch.checkInDay}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center px-4">
            <div className="h-px w-8 bg-gray-200 mb-1" />
            <div className="px-3 py-1 bg-cream rounded-full text-[10px] font-bold text-dark border border-gray-100">
              {nights}晚
            </div>
          </div>
          <div className="flex-1 text-right">
            <p className="text-[10px] text-icon-gray mb-1 font-bold uppercase tracking-wider">
              退房
            </p>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-lg font-display font-bold text-dark">
                {defaultSearch.checkOut}
              </span>
              <span className="text-xs text-icon-gray font-medium">
                {defaultSearch.checkOutDay}
              </span>
            </div>
          </div>
          <button className="ml-4 p-2 text-dark bg-cream hover:bg-gray-100 rounded-full transition-colors">
            <span className="material-symbols-outlined text-xl">
              calendar_today
            </span>
          </button>
        </div>

        {/* Available Rooms */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-xl text-dark">
              可预订房型
            </h3>
            <span className="text-[10px] font-bold bg-badge-success/10 text-badge-success px-2 py-1 rounded-full border border-badge-success/20">
              {sortedRooms.length}种可选
            </span>
          </div>

          {sortedRooms.map((room, index) => (
            <div
              key={room.id}
              className={`bg-white rounded-card overflow-hidden shadow-sm border border-gray-100 p-4${
                index === sortedRooms.length - 1 ? ' mb-6' : ''
              }`}
            >
              <div className="flex gap-4">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-24 h-24 object-cover rounded-xl"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-dark text-lg leading-tight mb-1">
                      {room.name}
                    </h4>
                    <p className="text-xs text-icon-gray line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-icon-gray">
                      <span className="material-symbols-outlined text-[14px]">
                        king_bed
                      </span>
                      {room.bedType}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-icon-gray">
                      <span className="material-symbols-outlined text-[14px]">
                        square_foot
                      </span>
                      {room.size}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-end justify-between">
                <div>
                  {room.badge && (
                    <div className="flex gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          badgeStyles[room.badgeColor || 'green']
                        }`}
                      >
                        {room.badge}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1 mt-1">
                    {room.originalPrice && (
                      <span className="text-xs text-icon-gray line-through decoration-red-400">
                        {room.currency}
                        {room.originalPrice}
                      </span>
                    )}
                    <span className="text-xl font-display font-bold text-dark">
                      {room.currency}
                      {room.pricePerNight}
                    </span>
                    <span className="text-xs text-icon-gray font-medium">
                      / 晚
                    </span>
                  </div>
                </div>
                <button className="bg-dark hover:bg-dark-hover text-white px-6 py-2.5 rounded-[12px] text-sm font-bold transition-all active:scale-95 shadow-md shadow-dark/20">
                  预订
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-100 p-4 pb-8 z-40 backdrop-blur-md">
        <div className="max-w-[430px] mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-icon-gray font-medium">
              {nights}晚总价
            </span>
            <span className="text-xl font-display font-bold text-dark">
              {hotel.currency}
              {totalPrice.toLocaleString()}{' '}
              <span className="text-xs font-normal text-icon-gray">+税</span>
            </span>
          </div>
          <button className="bg-dark text-white px-8 py-3.5 rounded-[14px] font-bold shadow-lg shadow-dark/30 hover:bg-dark-hover transition active:scale-95">
            查看可用房型
          </button>
        </div>
      </div>
    </div>
  );
}
