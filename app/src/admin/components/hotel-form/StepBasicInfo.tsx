import type { HotelFormData } from '../../../shared/types/admin';

interface StepBasicInfoProps {
  form: HotelFormData;
  updateField: <K extends keyof HotelFormData>(key: K, value: HotelFormData[K]) => void;
}

const STAR_OPTIONS = [
  { value: 5, label: '★★★★★' },
  { value: 4, label: '★★★★' },
  { value: 3, label: '★★★' },
  { value: 2, label: '★★' },
  { value: 1, label: '★' },
  { value: 0, label: '未评级' },
];

const inputClass =
  'w-full rounded-lg border border-slate-200 focus:border-admin-primary focus:ring-admin-primary h-11 text-sm px-4 outline-none transition-colors';

export default function StepBasicInfo({ form, updateField }: StepBasicInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8">
      {/* Section header */}
      <div className="mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-admin-primary text-lg">info</span>
          <h3 className="text-base font-bold text-slate-800">基础信息</h3>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 ml-7">Basic Information</p>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {/* 酒店中文名称 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            酒店中文名称 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-1.5">Hotel Name (Chinese)</p>
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={inputClass}
            placeholder="请输入酒店中文名称"
          />
        </div>

        {/* 酒店英文名称 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            酒店英文名称 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-1.5">Hotel Name (English)</p>
          <input
            value={form.englishName}
            onChange={(e) => updateField('englishName', e.target.value)}
            className={inputClass}
            placeholder="Please enter hotel English name"
          />
        </div>

        {/* 酒店地址 (full width) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            酒店地址 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-1.5">Hotel Address</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                location_on
              </span>
              <input
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="请输入酒店详细地址"
              />
            </div>
            <button
              type="button"
              className="shrink-0 h-11 px-4 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">map</span>
              在地图上选择位置
            </button>
          </div>
        </div>

        {/* 酒店星级 + 开业时间 + 装修时间 — 3 列同行 */}
        <div className="col-span-2 grid grid-cols-3 gap-x-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              酒店星级 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-400 mb-2">Star Rating</p>
            <div className="flex flex-wrap gap-2">
              {STAR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField('starRating', opt.value)}
                  className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors border ${
                    form.starRating === opt.value
                      ? 'border-admin-primary bg-admin-primary/10 text-admin-primary'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              开业时间 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-400 mb-1.5">Opening Date</p>
            <input
              type="month"
              value={form.openDate}
              onChange={(e) => updateField('openDate', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">装修时间</label>
            <p className="text-xs text-slate-400 mb-1.5">Renovation Date</p>
            <input
              type="month"
              disabled
              className={`${inputClass} bg-slate-50 text-slate-400 cursor-not-allowed`}
              placeholder="即将开放"
            />
          </div>
        </div>

        {/* 酒店简介 (full width) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">酒店简介</label>
          <p className="text-xs text-slate-400 mb-1.5">Hotel Description</p>
          <textarea
            className="w-full rounded-lg border border-slate-200 focus:border-admin-primary focus:ring-admin-primary text-sm px-4 py-3 outline-none transition-colors resize-none"
            rows={4}
            maxLength={1000}
            placeholder="请简要描述酒店特色、优势等（建议200-500字）"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">0/1000</p>
        </div>
      </div>
    </div>
  );
}
