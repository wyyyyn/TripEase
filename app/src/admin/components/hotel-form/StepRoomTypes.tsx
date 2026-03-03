import { useState } from 'react';
import type { HotelFormData, RoomFormData } from '../../../shared/types/admin';

interface StepRoomTypesProps {
  form: HotelFormData;
  updateField: <K extends keyof HotelFormData>(key: K, value: HotelFormData[K]) => void;
}

const EMPTY_ROOM: RoomFormData = {
  name: '', englishName: '', description: '', pricePerNight: 0, image: '', bedType: '大床', size: '', floor: '', maxGuests: 2, roomCount: 1, features: [],
};

const ROOM_FACILITIES = ['WiFi', '空调', '电视', '迷你吧', '浴缸'];

const inputClass =
  'w-full rounded-lg border border-slate-200 focus:border-[#1978e5] focus:ring-[#1978e5] h-11 text-sm px-4 outline-none transition-colors';

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

  const moveRoom = (idx: number, direction: 'up' | 'down') => {
    const rooms = [...form.rooms];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= rooms.length) return;
    [rooms[idx], rooms[targetIdx]] = [rooms[targetIdx], rooms[idx]];
    updateField('rooms', rooms);
  };

  const toggleFeature = (feature: string) => {
    if (!editingRoom) return;
    const features = editingRoom.features.includes(feature)
      ? editingRoom.features.filter((f) => f !== feature)
      : [...editingRoom.features, feature];
    setEditingRoom({ ...editingRoom, features });
  };

  return (
    <div className="space-y-6">
      {/* Section header (outside card) */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1978e5]">bed</span>
            <h3 className="font-bold text-xl">
              房型信息 <span className="text-slate-400 font-normal text-sm ml-2">Room Types</span>
            </h3>
          </div>
          <p className="text-slate-500 text-sm mt-1">请添加至少一个房型，完善房间详细信息</p>
        </div>
        <button
          type="button"
          onClick={startAddRoom}
          className="bg-[#1978e5] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-sm hover:brightness-105 transition-all text-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          添加房型
        </button>
      </div>

      {/* Room list */}
      {form.rooms.map((room, idx) => {
        const isEditing = editingRoomIndex === idx && editingRoom !== null;

        if (isEditing) {
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ring-2 ring-[#1978e5] ring-opacity-10">
              {/* Editing header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-slate-800">
                    {editingRoom!.name || '新房型'} {editingRoom!.englishName || ''}
                  </h4>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded flex items-center gap-1">
                    <span className="size-1.5 bg-yellow-500 rounded-full animate-pulse" />
                    编辑中
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 rounded-lg p-0.5">
                    <button type="button" onClick={() => moveRoom(idx, 'up')} disabled={idx === 0} className="p-1.5 hover:bg-white rounded-md transition-all text-slate-500 hover:text-[#1978e5] disabled:opacity-30">
                      <span className="material-symbols-outlined text-lg">arrow_upward</span>
                    </button>
                    <button type="button" onClick={() => moveRoom(idx, 'down')} disabled={idx === form.rooms.length - 1} className="p-1.5 hover:bg-white rounded-md transition-all text-slate-500 hover:text-[#1978e5] disabled:opacity-30">
                      <span className="material-symbols-outlined text-lg">arrow_downward</span>
                    </button>
                  </div>
                  <button type="button" onClick={() => removeRoom(idx)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-8 space-y-8">
                {renderRoomForm(editingRoom!, setEditingRoom, toggleFeature)}
              </div>

              {/* Save footer */}
              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setEditingRoom(null); setEditingRoomIndex(null); }}
                    className="px-6 py-2 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={saveRoom}
                    className="px-6 py-2 bg-[#1978e5] text-white text-sm font-bold rounded-lg shadow-sm hover:brightness-105 transition-all"
                  >
                    保存房型 Save
                  </button>
                </div>
              </div>
            </div>
          );
        }

        /* Completed state */
        return (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-[#1978e5]/40 transition-all group">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-3 min-w-[240px]">
                  <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1978e5]/10 group-hover:text-[#1978e5] transition-colors">
                    <span className="material-symbols-outlined">king_bed</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">
                      {room.name} {room.englishName || ''}
                    </h4>
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded inline-flex items-center gap-1 mt-1">
                      <span className="size-1.5 bg-green-500 rounded-full" />
                      已完成
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-10 text-xs text-slate-500">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-700">
                      {room.bedType} | {room.size || '-'}m²
                    </span>
                    <span>
                      {room.floor || '-'} | {room.maxGuests}人 | {room.roomCount}间
                    </span>
                  </div>
                  {room.features.length > 0 && (
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-slate-700">
                        <span className="font-bold text-slate-400 mr-1">设施:</span>
                        {room.features.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                  <button type="button" onClick={() => moveRoom(idx, 'up')} disabled={idx === 0} className="p-1.5 hover:bg-white rounded-md transition-all text-slate-500 hover:text-[#1978e5] disabled:opacity-30">
                    <span className="material-symbols-outlined text-lg">arrow_upward</span>
                  </button>
                  <button type="button" onClick={() => moveRoom(idx, 'down')} disabled={idx === form.rooms.length - 1} className="p-1.5 hover:bg-white rounded-md transition-all text-slate-500 hover:text-[#1978e5] disabled:opacity-30">
                    <span className="material-symbols-outlined text-lg">arrow_downward</span>
                  </button>
                </div>
                <div className="w-px h-8 bg-slate-100 mx-1" />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => startEditRoom(idx)} className="p-2 text-[#1978e5] hover:bg-[#1978e5]/5 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button type="button" onClick={() => removeRoom(idx)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* New room form (when adding, not editing existing) */}
      {editingRoom && editingRoomIndex === null && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ring-2 ring-[#1978e5] ring-opacity-10">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-slate-800">新房型</h4>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded flex items-center gap-1">
                <span className="size-1.5 bg-yellow-500 rounded-full animate-pulse" />
                编辑中
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {renderRoomForm(editingRoom, setEditingRoom, toggleFeature)}
          </div>

          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setEditingRoom(null); setEditingRoomIndex(null); }}
                className="px-6 py-2 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveRoom}
                className="px-6 py-2 bg-[#1978e5] text-white text-sm font-bold rounded-lg shadow-sm hover:brightness-105 transition-all"
              >
                保存房型 Save
              </button>
            </div>
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
  );
}

function renderRoomForm(
  room: RoomFormData,
  setRoom: (r: RoomFormData) => void,
  toggleFeature: (f: string) => void,
) {
  return (
    <>
      {/* Row 1: CN name + EN name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">房型名称 (CN) <span className="text-red-500">*</span></label>
          <input
            value={room.name}
            onChange={(e) => setRoom({ ...room, name: e.target.value })}
            className={inputClass}
            placeholder="如：豪华大床房"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">房型名称 (EN) <span className="text-red-500">*</span></label>
          <input
            value={room.englishName}
            onChange={(e) => setRoom({ ...room, englishName: e.target.value })}
            className={inputClass}
            placeholder="e.g. Deluxe King Room"
          />
        </div>

        {/* Bed type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">床型 <span className="text-red-500">*</span></label>
          <select
            value={room.bedType}
            onChange={(e) => setRoom({ ...room, bedType: e.target.value })}
            className={inputClass}
          >
            <option value="大床">大床 King Bed</option>
            <option value="双床">双床 Twin Bed</option>
            <option value="单床">单人床 Single Bed</option>
          </select>
        </div>

        {/* Area + Floor (2 cols in one cell) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">面积 <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                value={room.size}
                onChange={(e) => setRoom({ ...room, size: e.target.value })}
                className={`${inputClass} pr-10`}
                placeholder="45"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">m²</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">楼层</label>
            <input
              value={room.floor}
              onChange={(e) => setRoom({ ...room, floor: e.target.value })}
              className={inputClass}
              placeholder="如：3-5层"
            />
          </div>
        </div>

        {/* Max guests */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">最大入住人数 <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              min={1}
              value={room.maxGuests || ''}
              onChange={(e) => setRoom({ ...room, maxGuests: Number(e.target.value) })}
              className={`${inputClass} pr-12`}
              placeholder="2"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">人</span>
          </div>
        </div>

        {/* Room count */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">房间数量 <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              min={1}
              value={room.roomCount || ''}
              onChange={(e) => setRoom({ ...room, roomCount: Number(e.target.value) })}
              className={`${inputClass} pr-12`}
              placeholder="10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">间</span>
          </div>
        </div>
      </div>

      {/* Room facilities toggles */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">房型设施 (Facilities)</label>
        <div className="flex flex-wrap gap-2">
          {ROOM_FACILITIES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFeature(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all border ${
                room.features.includes(f)
                  ? 'bg-[#1978e5]/10 border-[#1978e5] text-[#1978e5]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {room.features.includes(f) ? 'check_circle' : 'circle'}
              </span>
              {f}
            </button>
          ))}
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-500 flex items-center gap-1.5 hover:border-slate-300 transition-all bg-white"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            更多设施
          </button>
        </div>
      </div>

      {/* Room photos upload area */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-700">房型照片 (Photos)</label>
        <div className="flex flex-wrap gap-4">
          {/* Existing image preview */}
          {room.image && (
            <div className="relative group size-32 rounded-xl overflow-hidden shadow-sm">
              <img src={room.image} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setRoom({ ...room, image: '' })}
                className="absolute top-1 right-1 size-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          )}
          {/* Upload area */}
          <div className="flex-1 min-w-[300px] h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1978e5]/5 transition-all space-y-2 py-6 border-2 border-dashed border-[#1978e5] rounded-xl">
            <span className="material-symbols-outlined text-[#1978e5] text-3xl">add_a_photo</span>
            <div className="text-center">
              <p className="text-sm font-bold text-[#1978e5]">点击或拖拽上传</p>
              <p className="text-[10px] text-slate-400 mt-0.5">最多 5 张 (Max 5)</p>
            </div>
          </div>
        </div>
        {/* URL input fallback */}
        <input
          value={room.image}
          onChange={(e) => setRoom({ ...room, image: e.target.value })}
          className={inputClass}
          placeholder="或输入图片 URL: https://example.com/room-photo.jpg"
        />
      </div>
    </>
  );
}
