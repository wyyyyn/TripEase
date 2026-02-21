import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotelById, createHotel, updateHotel } from '../../store/hotelStore';
import { useAuth } from '../../store/useStore';
import type { HotelFormData, RoomFormData } from '../../types/admin';

const ALL_TAGS = ['豪华', '精品', '亲子', '商务', '泳池', 'Spa', '免费WiFi', '免费取消', '公寓', '环保'];
const ALL_AMENITIES = [
  '免费WiFi', '泳池', '餐厅', '健身房', 'Spa', '停车场', '行李寄存',
  '24小时前台', '洗衣服务', '商务中心', '会议室', '接机服务',
  '免费停车', '无障碍', '厨房', '洗衣机',
];

const EMPTY_ROOM: RoomFormData = {
  name: '',
  description: '',
  pricePerNight: 0,
  image: '',
  bedType: '大床',
  size: '',
  features: [],
};

export default function MerchantHotelForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuth();
  const isEdit = !!id;

  const [form, setForm] = useState<HotelFormData>({
    name: '',
    englishName: '',
    address: '',
    starRating: 5,
    openDate: '',
    images: [],
    tags: [],
    amenities: [],
    rooms: [],
  });

  const [imageUrl, setImageUrl] = useState('');
  const [editingRoom, setEditingRoom] = useState<RoomFormData | null>(null);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEdit) {
      const hotel = getHotelById(id);
      if (hotel) {
        setForm({
          name: hotel.name,
          englishName: '',
          address: hotel.address,
          starRating: hotel.starRating,
          openDate: '',
          images: hotel.images,
          tags: hotel.tags,
          amenities: hotel.amenities,
          rooms: hotel.rooms.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            pricePerNight: r.pricePerNight,
            originalPrice: r.originalPrice,
            image: r.image,
            bedType: r.bedType,
            size: r.size,
            features: r.features,
          })),
        });
      }
    }
  }, [id, isEdit]);

  const updateField = <K extends keyof HotelFormData>(key: K, value: HotelFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'tags' | 'amenities', item: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((t) => t !== item)
        : [...prev[key], item],
    }));
  };

  const addImage = () => {
    if (!imageUrl.trim()) return;
    updateField('images', [...form.images, imageUrl.trim()]);
    setImageUrl('');
  };

  const removeImage = (idx: number) => {
    updateField('images', form.images.filter((_, i) => i !== idx));
  };

  const startAddRoom = () => {
    setEditingRoom({ ...EMPTY_ROOM });
    setEditingRoomIndex(null);
  };

  const startEditRoom = (idx: number) => {
    setEditingRoom({ ...form.rooms[idx] });
    setEditingRoomIndex(idx);
  };

  const saveRoom = () => {
    if (!editingRoom || !editingRoom.name.trim()) return;
    const rooms = [...form.rooms];
    if (editingRoomIndex !== null) {
      rooms[editingRoomIndex] = editingRoom;
    } else {
      rooms.push(editingRoom);
    }
    updateField('rooms', rooms);
    setEditingRoom(null);
    setEditingRoomIndex(null);
  };

  const removeRoom = (idx: number) => {
    updateField('rooms', form.rooms.filter((_, i) => i !== idx));
  };

  const handleSave = (submit: boolean) => {
    if (!user) return;
    if (!form.name.trim()) return;
    if (isEdit) {
      updateHotel(id, form, submit);
    } else {
      createHotel(user.id, form, submit);
    }
    navigate('/admin/hotels');
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/hotels')}
          className="flex items-center gap-1 text-gray-500 hover:text-dark text-sm mb-4 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          返回列表
        </button>
        <h1 className="text-2xl font-bold text-dark">
          {isEdit ? '编辑酒店' : '新增酒店'}
        </h1>
      </div>

      <div className="space-y-8">
        {/* Section 1: Basic Info */}
        <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-dark mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">info</span>
            基本信息
          </h2>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">中文名称 *</label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:border-accent focus:outline-none transition-colors"
                placeholder="请输入酒店中文名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">英文名称</label>
              <input
                value={form.englishName}
                onChange={(e) => updateField('englishName', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:border-accent focus:outline-none transition-colors"
                placeholder="English name"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark mb-1.5">地址 *</label>
              <input
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:border-accent focus:outline-none transition-colors"
                placeholder="请输入酒店地址"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">星级</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateField('starRating', star)}
                    className="p-1"
                  >
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        star <= form.starRating ? 'text-accent' : 'text-gray-300'
                      }`}
                    >
                      star_rate
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">开业日期</label>
              <input
                type="date"
                value={form.openDate}
                onChange={(e) => updateField('openDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Images */}
        <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-dark mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">image</span>
            酒店图片
          </h2>
          <div className="flex gap-3 mb-4">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:border-accent focus:outline-none transition-colors"
              placeholder="输入图片 URL"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            />
            <button
              type="button"
              onClick={addImage}
              className="bg-accent hover:bg-accent-hover text-dark font-bold py-3 px-6 rounded-2xl transition-colors"
            >
              添加
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Tags & Amenities */}
        <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-dark mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">label</span>
            标签 & 设施
          </h2>
          <div className="mb-5">
            <label className="block text-sm font-medium text-dark mb-2">标签</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleArrayItem('tags', tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    form.tags.includes(tag)
                      ? 'bg-accent text-dark'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">设施</label>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleArrayItem('amenities', amenity)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    form.amenities.includes(amenity)
                      ? 'bg-accent text-dark'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Rooms */}
        <section className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-accent">bed</span>
              房型管理
            </h2>
            <button
              type="button"
              onClick={startAddRoom}
              className="border border-gray-200 text-dark font-bold py-2 px-4 rounded-xl hover:bg-gray-50 text-sm transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              添加房型
            </button>
          </div>

          {/* Existing rooms */}
          <div className="space-y-3 mb-4">
            {form.rooms.map((room, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl"
              >
                {room.image && (
                  <img
                    src={room.image}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark text-sm">{room.name}</p>
                  <p className="text-xs text-gray-500">
                    {room.bedType} · {room.size} · ¥{room.pricePerNight}/晚
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditRoom(idx)}
                    className="text-sm text-accent hover:underline"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRoom(idx)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Inline room form */}
          {editingRoom && (
            <div className="border-2 border-accent/30 rounded-xl p-5 bg-accent/5">
              <p className="text-sm font-bold text-dark mb-4">
                {editingRoomIndex !== null ? '编辑房型' : '添加房型'}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-dark mb-1">房型名称 *</label>
                  <input
                    value={editingRoom.name}
                    onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-sm focus:border-accent focus:outline-none"
                    placeholder="如：豪华大床房"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark mb-1">床型</label>
                  <select
                    value={editingRoom.bedType}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bedType: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="大床">大床</option>
                    <option value="双床">双床</option>
                    <option value="单床">单床</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark mb-1">价格 (¥/晚) *</label>
                  <input
                    type="number"
                    value={editingRoom.pricePerNight || ''}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, pricePerNight: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-sm focus:border-accent focus:outline-none"
                    placeholder="658"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark mb-1">原价 (可选)</label>
                  <input
                    type="number"
                    value={editingRoom.originalPrice || ''}
                    onChange={(e) =>
                      setEditingRoom({
                        ...editingRoom,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-sm focus:border-accent focus:outline-none"
                    placeholder="820"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark mb-1">面积</label>
                  <input
                    value={editingRoom.size}
                    onChange={(e) => setEditingRoom({ ...editingRoom, size: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-sm focus:border-accent focus:outline-none"
                    placeholder="32m²"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark mb-1">图片 URL</label>
                  <input
                    value={editingRoom.image}
                    onChange={(e) => setEditingRoom({ ...editingRoom, image: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-sm focus:border-accent focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-dark mb-1">描述</label>
                  <textarea
                    value={editingRoom.description}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, description: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-sm focus:border-accent focus:outline-none"
                    rows={2}
                    placeholder="房型描述..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-dark mb-1">特色 (逗号分隔)</label>
                  <input
                    value={editingRoom.features.join(', ')}
                    onChange={(e) =>
                      setEditingRoom({
                        ...editingRoom,
                        features: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-sm focus:border-accent focus:outline-none"
                    placeholder="含早餐, 免费WiFi"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={saveRoom}
                  className="bg-dark hover:bg-dark-hover text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors"
                >
                  {editingRoomIndex !== null ? '保存修改' : '添加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoom(null);
                    setEditingRoomIndex(null);
                  }}
                  className="border border-gray-200 text-dark font-bold py-2 px-5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="border border-gray-200 text-dark font-bold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            保存草稿
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="bg-dark hover:bg-dark-hover text-white font-bold py-3 px-6 rounded-2xl transition-colors"
          >
            保存并提交审核
          </button>
        </div>
      </div>
    </div>
  );
}
