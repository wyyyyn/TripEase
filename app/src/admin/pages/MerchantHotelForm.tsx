import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotelByIdFromAPI, createHotelFromAPI, updateHotelFromAPI } from '../../shared/store/hotelStore';
import { useAuth } from '../../shared/store/useStore';
import type { HotelFormData } from '../../shared/types/admin';
import StepBasicInfo from '../components/hotel-form/StepBasicInfo';
import StepRoomTypes from '../components/hotel-form/StepRoomTypes';
import StepPricing from '../components/hotel-form/StepPricing';
import StepFacilities from '../components/hotel-form/StepFacilities';
import StepMedia from '../components/hotel-form/StepMedia';
import StepContact from '../components/hotel-form/StepContact';

const STEPS = [
  { key: 'basic', icon: 'info', label: '步骤1：基础信息' },
  { key: 'rooms', icon: 'meeting_room', label: '步骤2：房型信息' },
  { key: 'pricing', icon: 'payments', label: '步骤3：价格信息' },
  { key: 'facilities', icon: 'pool', label: '步骤4：设施服务' },
  { key: 'media', icon: 'photo_library', label: '步骤5：媒体图库' },
  { key: 'contact', icon: 'contact_phone', label: '步骤6：联系信息' },
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
          setForm({
            name: hotel.name, englishName: '', address: hotel.address,
            starRating: hotel.starRating, openDate: '',
            images: hotel.images, tags: hotel.tags, amenities: hotel.amenities,
            rooms: hotel.rooms.map((r) => ({
              id: r.id, name: r.name, description: r.description,
              pricePerNight: r.pricePerNight, originalPrice: r.originalPrice,
              image: r.image, bedType: r.bedType, size: r.size, features: r.features,
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
      <div className="shrink-0 px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/hotels')}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              返回
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {isEdit ? '编辑酒店信息' : '新增酒店信息'}
            </h1>
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
              草稿
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="h-9 px-4 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存草稿'}
            </button>
            <button
              type="button"
              className="h-9 px-4 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              预览页面
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="h-9 px-5 rounded-lg bg-admin-primary text-white text-sm font-medium hover:bg-admin-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? '提交中...' : '提交审核'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="shrink-0 px-8 border-b border-slate-200">
        <nav className="flex gap-0">
          {STEPS.map((step, idx) => (
            <button
              key={step.key}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-2 px-5 py-3 text-sm transition-colors border-b-2 ${
                activeStep === idx
                  ? 'border-admin-primary text-admin-primary font-bold'
                  : 'border-transparent text-slate-400 font-medium hover:text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{step.icon}</span>
              {step.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Step content (scrollable) */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-8 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="text-xs text-slate-400">
          {lastSaved ? `自动保存 ${lastSaved}` : '尚未保存'}
        </div>
        <div className="flex items-center gap-3">
          {activeStep > 0 && (
            <button
              type="button"
              onClick={() => setActiveStep((s) => s - 1)}
              className="h-9 px-5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
              上一步
            </button>
          )}
          {activeStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep((s) => s + 1)}
              className="h-9 px-5 rounded-lg bg-admin-primary text-white text-sm font-medium hover:bg-admin-primary/90 transition-colors flex items-center gap-1"
            >
              下一步
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="h-9 px-5 rounded-lg bg-admin-primary text-white text-sm font-medium hover:bg-admin-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? '提交中...' : '提交审核'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
