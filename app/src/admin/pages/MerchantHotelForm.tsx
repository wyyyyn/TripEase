import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotelByIdFromAPI, createHotelFromAPI, updateHotelFromAPI } from '../../shared/store/hotelStore';
import { useAuth } from '../../shared/store/useStore';
import type { HotelFormData, ReviewStatus } from '../../shared/types/admin';
import StepBasicInfo from '../components/hotel-form/StepBasicInfo';
import StepRoomTypes from '../components/hotel-form/StepRoomTypes';
import StepPricing from '../components/hotel-form/StepPricing';
import StepFacilities from '../components/hotel-form/StepFacilities';
import StepMedia from '../components/hotel-form/StepMedia';
import StepContact from '../components/hotel-form/StepContact';

const STEPS = [
  { key: 'basic', icon: 'info', label: '步骤1：基础信息' },
  { key: 'rooms', icon: 'bed', label: '步骤2：房型信息' },
  { key: 'pricing', icon: 'sell', label: '步骤3：价格信息' },
  { key: 'facilities', icon: 'pool', label: '步骤4：设施服务' },
  { key: 'media', icon: 'image', label: '步骤5：媒体图库' },
  { key: 'contact', icon: 'contact_support', label: '步骤6：联系信息' },
];

export default function MerchantHotelForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuth();
  const isEdit = !!id;

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<HotelFormData>({
    name: '', englishName: '', address: '', starRating: 5, openDate: '',
    images: [], tags: [], amenities: [], rooms: [],
  });
  const [hotelStatus, setHotelStatus] = useState<ReviewStatus>('draft');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load hotel data in edit mode
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getHotelByIdFromAPI(Number(id))
      .then((hotel) => {
        if (hotel) {
          setHotelStatus(hotel.status);
          setForm({
            name: hotel.name, englishName: '', address: hotel.address,
            starRating: hotel.starRating, openDate: '',
            images: hotel.images, tags: hotel.tags, amenities: hotel.amenities,
            rooms: hotel.rooms.map((r) => ({
              id: r.id, name: r.name, englishName: '', description: r.description,
              pricePerNight: r.pricePerNight, originalPrice: r.originalPrice,
              image: r.image, bedType: r.bedType, size: r.size,
              floor: '', maxGuests: 2, roomCount: 1, features: r.features,
            })),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // Form helpers passed to step components
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

  // Save handler (preserves existing API logic)
  const handleSave = async (submit: boolean) => {
    if (!user) return;
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateHotelFromAPI(Number(id), form, submit);
      } else {
        await createHotelFromAPI(form, submit);
      }
      navigate('/admin/hotels');
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user || !form.name.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateHotelFromAPI(Number(id), form, false);
      } else {
        await createHotelFromAPI(form, false);
      }
      setLastSaved(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // Render current step content
  const renderStep = () => {
    switch (STEPS[activeStep].key) {
      case 'basic':
        return <StepBasicInfo form={form} updateField={updateField} />;
      case 'rooms':
        return <StepRoomTypes form={form} updateField={updateField} />;
      case 'pricing':
        return <StepPricing />;
      case 'facilities':
        return <StepFacilities form={form} toggleArrayItem={toggleArrayItem} />;
      case 'media':
        return <StepMedia form={form} updateField={updateField} />;
      case 'contact':
        return <StepContact />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-20 shrink-0 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {isEdit ? '编辑酒店信息' : '新增酒店信息'}
          </h2>
          <div className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1 ${
            hotelStatus === 'approved' || hotelStatus === 'published'
              ? 'bg-green-50 text-green-600 border-green-200'
              : hotelStatus === 'rejected'
                ? 'bg-red-50 text-red-600 border-red-200'
                : hotelStatus === 'pending'
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {hotelStatus === 'approved' || hotelStatus === 'published' ? 'check_circle'
                : hotelStatus === 'rejected' ? 'cancel'
                : hotelStatus === 'pending' ? 'schedule'
                : 'edit_note'}
            </span>
            {{ draft: '草稿', pending: '审核中', approved: '已通过审核', rejected: '已驳回', published: '已发布', offline: '已下线' }[hotelStatus]}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            预览页面
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#1978e5] text-white text-sm font-bold shadow-sm hover:brightness-105 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            {saving ? '提交中...' : '提交审核'}
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="shrink-0 bg-white border-b border-slate-200 px-8 flex items-center gap-8 overflow-x-auto">
        {STEPS.map((step, idx) => (
          <button
            key={step.key}
            type="button"
            onClick={() => setActiveStep(idx)}
            className={`py-4 border-b-2 text-sm flex items-center gap-2 shrink-0 transition-colors ${
              activeStep === idx
                ? 'border-[#1978e5] text-[#1978e5] font-bold'
                : 'border-transparent text-[#718096] hover:text-slate-700 font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{step.icon}</span>
            {step.label}
          </button>
        ))}
      </nav>

      {/* Step content (scrollable) */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          {renderStep()}
        </div>
      </div>

      {/* Footer */}
      <footer className="h-16 shrink-0 bg-white border-t border-slate-200 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-600 font-medium">
          {lastSaved ? (
            <>
              <span className="material-symbols-outlined text-[18px]">cloud_done</span>
              <span className="text-xs">自动保存成功 {lastSaved}</span>
            </>
          ) : (
            <span className="text-xs text-slate-400">尚未保存</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => activeStep > 0 && setActiveStep((s) => s - 1)}
              disabled={activeStep === 0}
              className={`px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors ${
                activeStep === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              上一步
            </button>
            {activeStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((s) => s + 1)}
                className="px-4 py-2 bg-[#1978e5] text-white rounded-lg text-sm font-bold shadow-sm hover:brightness-105 transition-all flex items-center gap-1"
              >
                下一步 Next
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            ) : null}
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving || activeStep < STEPS.length - 1}
            className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${
              activeStep === STEPS.length - 1
                ? 'bg-[#1978e5] text-white hover:brightness-105'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? '提交中...' : '提交'}
          </button>
        </div>
      </footer>
    </div>
  );
}
