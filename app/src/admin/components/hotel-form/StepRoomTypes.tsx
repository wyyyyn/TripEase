import { useState } from 'react';
import type { HotelFormData, RoomFormData } from '../../../shared/types/admin';

interface StepRoomTypesProps {
  form: HotelFormData;
  updateField: <K extends keyof HotelFormData>(key: K, value: HotelFormData[K]) => void;
}

const EMPTY_ROOM: RoomFormData = {
  name: '', englishName: '', description: '', pricePerNight: 0, image: '', bedType: '大床', size: '', floor: '', maxGuests: 2, roomCount: 1, features: [],
};

const ROOM_FACILITIES = ['WiFi', '空调', '电视', '迷你吧', '浴缸', '淋浴', '保险箱', '吹风机', '热水壶', '拖鞋'];

const inputClass =
  'w-full rounded-lg border border-slate-200 focus:border-admin-primary focus:ring-admin-primary h-11 text-sm px-4 outline-none transition-colors';

export default function StepRoomTypes({ form, updateField }: StepRoomTypesProps) {
  const [editingRoom, setEditingRoom] = useState<RoomFormData | null>(null);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);

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

  const toggleFeature = (feature: string) => {
    if (!editingRoom) return;
    const features = editingRoom.features.includes(feature)
      ? editingRoom.features.filter((f) => f !== feature)
      : [...editingRoom.features, feature];
    setEditingRoom({ ...editingRoom, features });
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">房型信息</h3>
            <p className="text-xs text-slate-400 mt-0.5">Room Types</p>
          </div>
          <button
            type="button"
            onClick={startAddRoom}
            className="h-10 px-5 rounded-lg bg-admin-primary text-white text-sm font-medium hover:bg-admin-primary/90 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            添加房型
          </button>
        </div>

        {/* Room list */}
        <div className="space-y-3">
          {form.rooms.map((room, idx) => {
            const isEditing = editingRoomIndex === idx && editingRoom !== null;

            if (isEditing) {
              return (
                <div key={idx} className="border-2 border-admin-primary/30 rounded-xl p-6 bg-admin-primary/5 ring-1 ring-admin-primary/20">
                  {/* Editing header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-admin-primary">meeting_room</span>
                      <span className="font-bold text-slate-800">{editingRoom!.name || '新房型'}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        编辑中
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => removeRoom(idx)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>

                  {renderRoomForm(editingRoom!, setEditingRoom, toggleFeature)}

                  {/* Save / Cancel */}
                  <div className="flex gap-3 mt-5 pt-5 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={saveRoom}
                      className="h-10 px-6 rounded-lg bg-admin-primary text-white text-sm font-medium hover:bg-admin-primary/90 transition-colors"
                    >
                      保存房型 Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingRoom(null); setEditingRoomIndex(null); }}
                      className="h-10 px-6 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              );
            }

            /* Completed state */
            return (
              <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">meeting_room</span>
                    <span className="font-medium text-slate-800">{room.name}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      已完成
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => startEditRoom(idx)} className="p-1.5 text-slate-400 hover:text-admin-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button type="button" onClick={() => removeRoom(idx)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-2 ml-9">
                  {room.bedType} | {room.size || '-'} | ¥{room.pricePerNight}/晚
                </p>
                {room.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                    {room.features.map((f) => (
                      <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* New room form (when adding, not editing existing) */}
          {editingRoom && editingRoomIndex === null && (
            <div className="border-2 border-admin-primary/30 rounded-xl p-6 bg-admin-primary/5 ring-1 ring-admin-primary/20">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-admin-primary">meeting_room</span>
                <span className="font-bold text-slate-800">新房型</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  编辑中
                </span>
              </div>

              {renderRoomForm(editingRoom, setEditingRoom, toggleFeature)}

              <div className="flex gap-3 mt-5 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={saveRoom}
                  className="h-10 px-6 rounded-lg bg-admin-primary text-white text-sm font-medium hover:bg-admin-primary/90 transition-colors"
                >
                  保存房型 Save
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingRoom(null); setEditingRoomIndex(null); }}
                  className="h-10 px-6 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {form.rooms.length === 0 && !editingRoom && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">meeting_room</span>
              <p className="text-slate-400 text-sm">暂无房型，点击上方按钮添加</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderRoomForm(
  room: RoomFormData,
  setRoom: (r: RoomFormData) => void,
  toggleFeature: (f: string) => void,
) {
  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">房型中文名称 *</label>
          <input
            value={room.name}
            onChange={(e) => setRoom({ ...room, name: e.target.value })}
            className={inputClass}
            placeholder="如：豪华大床房"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">床型</label>
          <select
            value={room.bedType}
            onChange={(e) => setRoom({ ...room, bedType: e.target.value })}
            className={inputClass}
          >
            <option value="大床">大床</option>
            <option value="双床">双床</option>
            <option value="单床">单床</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">面积</label>
          <div className="relative">
            <input
              value={room.size}
              onChange={(e) => setRoom({ ...room, size: e.target.value })}
              className={inputClass}
              placeholder="32"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">m²</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">价格 (¥/晚) *</label>
          <input
            type="number"
            value={room.pricePerNight || ''}
            onChange={(e) => setRoom({ ...room, pricePerNight: Number(e.target.value) })}
            className={inputClass}
            placeholder="658"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">原价 (可选)</label>
          <input
            type="number"
            value={room.originalPrice || ''}
            onChange={(e) => setRoom({ ...room, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
            className={inputClass}
            placeholder="820"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">图片 URL</label>
          <input
            value={room.image}
            onChange={(e) => setRoom({ ...room, image: e.target.value })}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">描述</label>
          <textarea
            value={room.description}
            onChange={(e) => setRoom({ ...room, description: e.target.value })}
            className="w-full rounded-lg border border-slate-200 focus:border-admin-primary focus:ring-admin-primary text-sm px-4 py-3 outline-none transition-colors resize-none"
            rows={2}
            placeholder="房型描述..."
          />
        </div>
      </div>

      {/* Room facilities toggles */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-slate-600 mb-2">房间设施</label>
        <div className="flex flex-wrap gap-2">
          {ROOM_FACILITIES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFeature(f)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors border ${
                room.features.includes(f)
                  ? 'border-admin-primary bg-admin-primary/10 text-admin-primary'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
