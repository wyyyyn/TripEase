import { useState } from 'react';
import type { HotelFormData } from '../../../shared/types/admin';

interface StepMediaProps {
  form: HotelFormData;
  updateField: <K extends keyof HotelFormData>(key: K, value: HotelFormData[K]) => void;
}

export default function StepMedia({ form, updateField }: StepMediaProps) {
  const [imageUrl, setImageUrl] = useState('');

  const addImage = () => {
    if (!imageUrl.trim()) return;
    updateField('images', [...form.images, imageUrl.trim()]);
    setImageUrl('');
  };

  const removeImage = (idx: number) => {
    updateField('images', form.images.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-800">媒体图库</h3>
        <p className="text-xs text-slate-400 mt-0.5">Media Gallery</p>
      </div>

      {/* Add image URL */}
      <div className="flex gap-3 mb-6">
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="flex-1 rounded-lg border border-slate-200 focus:border-admin-primary focus:ring-admin-primary h-11 text-sm px-4 outline-none transition-colors"
          placeholder="输入图片 URL"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
        />
        <button
          type="button"
          onClick={addImage}
          className="shrink-0 h-11 px-5 rounded-lg bg-admin-primary text-white text-sm font-medium hover:bg-admin-primary/90 transition-colors"
        >
          添加
        </button>
      </div>

      {/* Image grid */}
      {form.images.length > 0 ? (
        <div className="grid grid-cols-4 gap-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}

          {/* Dashed upload placeholder */}
          <div className="aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-admin-primary hover:text-admin-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-2xl mb-1">add_photo_alternate</span>
            <span className="text-xs">添加图片</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">photo_library</span>
          <p className="text-slate-400 text-sm">暂无图片，请输入 URL 添加</p>
        </div>
      )}
    </div>
  );
}
