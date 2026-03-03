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
  'w-full rounded-lg border border-slate-200 focus:border-[#1978e5] focus:ring-[#1978e5] h-11 text-sm px-4 outline-none transition-colors';

export default function StepBasicInfo({ form, updateField }: StepBasicInfoProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Section header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#1978e5]">info</span>
        <h3 className="font-bold text-lg">
          基础信息 <span className="text-slate-400 font-normal text-sm ml-2">Basic Information</span>
        </h3>
      </div>

      {/* Form fields */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* 酒店中文名称 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            酒店中文名称 <span className="text-red-500">*</span>
          </label>
          <div className="text-[10px] text-slate-400 -mt-1 mb-1">Hotel Name (Chinese)</div>
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={inputClass}
            placeholder="请输入酒店中文名称"
            maxLength={50}
          />
        </div>

        {/* 酒店英文名称 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            酒店英文名称 <span className="text-red-500">*</span>
          </label>
          <div className="text-[10px] text-slate-400 -mt-1 mb-1">Hotel Name (English)</div>
          <input
            value={form.englishName}
            onChange={(e) => updateField('englishName', e.target.value)}
            className={inputClass}
            placeholder="Please enter hotel name in English"
            maxLength={100}
          />
        </div>

        {/* 酒店地址 (full width) */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            酒店地址 <span className="text-red-500">*</span>
          </label>
          <div className="text-[10px] text-slate-400 -mt-1 mb-1">Hotel Address</div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                location_on
              </span>
              <input
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="请输入酒店详细地址（建议包含省市区街道）"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              在地图上选择位置
            </button>
          </div>
        </div>

        {/* 酒店星级 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            酒店星级 <span className="text-red-500">*</span>
          </label>
          <div className="text-[10px] text-slate-400 -mt-1 mb-1">Hotel Star Rating</div>
          <div className="flex items-center gap-2 flex-wrap">
            {STAR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField('starRating', opt.value)}
                className={`px-3 py-1.5 rounded-lg transition-all border ${
                  form.starRating === opt.value
                    ? 'border-[#1978e5] bg-[#1978e5]/10'
                    : 'border-slate-200 hover:border-[#1978e5]'
                }`}
              >
                {opt.value > 0 ? (
                  <span className="text-sm text-yellow-500">{opt.label}</span>
                ) : (
                  <span className="text-xs font-semibold">{opt.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 开业时间 + 装修时间 (2 cols in one cell) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              开业时间 <span className="text-red-500">*</span>
            </label>
            <div className="text-[10px] text-slate-400 -mt-1 mb-1">Opening Date</div>
            <input
              type="month"
              value={form.openDate}
              onChange={(e) => updateField('openDate', e.target.value)}
              className={inputClass}
              placeholder="请选择开业时间"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">装修时间</label>
            <div className="text-[10px] text-slate-400 -mt-1 mb-1">Last Renovation Date</div>
            <input
              type="month"
              className={inputClass}
              placeholder="请选择装修时间"
            />
          </div>
        </div>

        {/* 酒店简介 (full width) */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-slate-700">酒店简介</label>
          <div className="text-[10px] text-slate-400 -mt-1 mb-1">Hotel Description</div>
          <textarea
            className="w-full rounded-lg border border-slate-200 focus:border-[#1978e5] focus:ring-[#1978e5] h-32 text-sm p-4 outline-none transition-colors resize-none"
            maxLength={1000}
            placeholder="请简要描述酒店特色、优势等（建议200-500字）"
          />
          <div className="text-right text-[10px] text-slate-400">0/1000</div>
        </div>
      </div>
    </section>
  );
}
