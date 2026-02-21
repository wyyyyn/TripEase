import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotelById, changeStatus } from '../../store/hotelStore';
import { useHotels } from '../../store/useStore';
import StatusBadge from '../../components/admin/StatusBadge';
import RejectModal from '../../components/admin/RejectModal';

export default function AdminReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Subscribe to store changes so UI updates after actions
  useHotels();
  const hotel = id ? getHotelById(id) : undefined;
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!hotel) {
    return (
      <div className="p-8">
        <p className="text-gray-500">酒店未找到</p>
      </div>
    );
  }

  const handleAction = (status: 'approved' | 'published' | 'offline') => {
    changeStatus(hotel.id, status);
  };

  const handleReject = (reason: string) => {
    changeStatus(hotel.id, 'rejected', reason);
    setRejectOpen(false);
  };

  return (
    <div className="p-8 max-w-4xl">
      <button
        onClick={() => navigate('/admin/review')}
        className="flex items-center gap-1 text-gray-500 hover:text-dark text-sm mb-6 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        返回列表
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark mb-2">{hotel.name}</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={hotel.status} />
            <div className="flex items-center gap-0.5">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <span key={i} className="material-symbols-outlined text-accent text-sm">star_rate</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {hotel.status === 'pending' && (
            <>
              <button
                onClick={() => handleAction('approved')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
              >
                通过审核
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
              >
                拒绝
              </button>
            </>
          )}
          {hotel.status === 'approved' && (
            <button
              onClick={() => handleAction('published')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
            >
              发布上线
            </button>
          )}
          {hotel.status === 'published' && (
            <button
              onClick={() => handleAction('offline')}
              className="border border-gray-200 text-dark font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              下线
            </button>
          )}
          {hotel.status === 'offline' && (
            <button
              onClick={() => handleAction('published')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
            >
              恢复上线
            </button>
          )}
        </div>
      </div>

      {/* Reject reason */}
      {hotel.status === 'rejected' && hotel.rejectReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-red-700 mb-1">拒绝原因</p>
          <p className="text-sm text-red-600">{hotel.rejectReason}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-dark mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">地址</span>
              <p className="text-dark font-medium mt-0.5">{hotel.address || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">价格</span>
              <p className="text-dark font-medium mt-0.5">¥{hotel.pricePerNight}/晚</p>
            </div>
          </div>
        </section>

        {/* Images */}
        {hotel.images.length > 0 && (
          <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">酒店图片</h2>
            <div className="grid grid-cols-4 gap-3">
              {hotel.images.map((img, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tags & Amenities */}
        <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-dark mb-4">标签 & 设施</h2>
          {hotel.tags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">标签</p>
              <div className="flex flex-wrap gap-2">
                {hotel.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-accent/10 text-dark text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {hotel.amenities.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">设施</p>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((amenity) => (
                  <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Rooms */}
        {hotel.rooms.length > 0 && (
          <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">
              房型 ({hotel.rooms.length})
            </h2>
            <div className="space-y-3">
              {hotel.rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl"
                >
                  {room.image && (
                    <img
                      src={room.image}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark">{room.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{room.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>{room.bedType}</span>
                      <span>{room.size}</span>
                      <span className="font-medium text-dark">¥{room.pricePerNight}/晚</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
    </div>
  );
}
