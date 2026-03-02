import type { HotelFormData } from '../../../shared/types/admin';

interface StepFacilitiesProps {
  form: HotelFormData;
  toggleArrayItem: (key: 'tags' | 'amenities', item: string) => void;
}

const ALL_TAGS = ['豪华', '精品', '亲子', '商务', '泳池', 'Spa', '免费WiFi', '免费取消', '公寓', '环保'];
const ALL_AMENITIES = [
  '免费WiFi', '泳池', '餐厅', '健身房', 'Spa', '停车场', '行李寄存',
  '24小时前台', '洗衣服务', '商务中心', '会议室', '接机服务',
  '免费停车', '无障碍', '厨房', '洗衣机',
];

export default function StepFacilities({ form, toggleArrayItem }: StepFacilitiesProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-800">设施服务</h3>
        <p className="text-xs text-slate-400 mt-0.5">Facilities & Services</p>
      </div>

      {/* Tags */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-3">酒店标签</label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleArrayItem('tags', tag)}
              className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors border ${
                form.tags.includes(tag)
                  ? 'border-admin-primary bg-admin-primary/10 text-admin-primary'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">酒店设施</label>
        <div className="flex flex-wrap gap-2">
          {ALL_AMENITIES.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleArrayItem('amenities', amenity)}
              className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors border ${
                form.amenities.includes(amenity)
                  ? 'border-admin-primary bg-admin-primary/10 text-admin-primary'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
