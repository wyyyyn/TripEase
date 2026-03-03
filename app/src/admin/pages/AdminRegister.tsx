import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { submitRegisterRequestAPI } from '../../shared/api/registerRequest';
import AuthLeftPanel from '../components/AuthLeftPanel';

export default function AdminRegister() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [province, setProvince] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [managementNeeds, setManagementNeeds] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitRegisterRequestAPI({
        name,
        phone,
        hotelName,
        province,
        roomCount: roomCount ? Number(roomCount) : undefined,
        managementNeeds: managementNeeds || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left panel */}
      <AuthLeftPanel title="让酒店管理更高效、更智能" />

      {/* Right panel — register form */}
      <div className="flex flex-1 flex-col justify-center items-center p-6 lg:p-12 bg-[#F6F7F8]">
        <div className="w-full max-w-[520px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 lg:p-10">
          {submitted ? (
            /* Success state */
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-green-500 text-5xl mb-4">check_circle</span>
              <h2 className="text-2xl font-bold text-[#1a2b4b] mb-2">提交成功！</h2>
              <p className="text-slate-500 mb-6">销售顾问将在 1 小时内联系您</p>
              <Link
                to="/admin/login"
                className="text-[#1978e5] font-semibold hover:underline"
              >
                返回登录
              </Link>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#1a2b4b]">
                  获取您的专属酒店管理系统方案
                </h2>
                <p className="text-slate-500 mt-2">提交后，销售顾问将在 1 小时内联系您</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error */}
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1a2b4b]">姓名*</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      person
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded focus:ring-2 focus:ring-[#1978e5] text-[#1a233a] placeholder:text-slate-400"
                      placeholder="请输入您的姓名"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1a2b4b]">手机号码*</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      phone
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded focus:ring-2 focus:ring-[#1978e5] text-[#1a233a] placeholder:text-slate-400"
                      placeholder="请输入您的手机号码"
                      required
                    />
                  </div>
                </div>

                {/* Hotel name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1a2b4b]">酒店名称*</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      hotel
                    </span>
                    <input
                      type="text"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded focus:ring-2 focus:ring-[#1978e5] text-[#1a233a] placeholder:text-slate-400"
                      placeholder="请输入酒店全称"
                      required
                    />
                  </div>
                </div>

                {/* Province + Room count row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#1a2b4b]">所在省份*</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                        location_on
                      </span>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded focus:ring-2 focus:ring-[#1978e5] text-[#1a233a] placeholder:text-slate-400"
                        placeholder="选择省份"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#1a2b4b]">客房数量 (选填)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                        bed
                      </span>
                      <input
                        type="number"
                        value={roomCount}
                        onChange={(e) => setRoomCount(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded focus:ring-2 focus:ring-[#1978e5] text-[#1a233a] placeholder:text-slate-400"
                        placeholder="例如：50"
                      />
                    </div>
                  </div>
                </div>

                {/* Management needs */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1a2b4b]">管理需求 (选填)</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-[1.125rem] text-slate-400 text-[20px]">
                      description
                    </span>
                    <textarea
                      value={managementNeeds}
                      onChange={(e) => setManagementNeeds(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded focus:ring-2 focus:ring-[#1978e5] text-[#1a233a] placeholder:text-slate-400 min-h-[100px]"
                      placeholder="请简单描述您的需求"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a233a] hover:bg-[#1a233a]/90 text-white font-bold py-4 rounded transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  {loading ? '提交中...' : '提交申请 ➜'}
                </button>

                {/* Login link */}
                <div className="pt-6 text-center">
                  <p className="text-slate-500 text-sm">
                    已有账号？
                    <Link to="/admin/login" className="text-[#1a233a] font-bold hover:underline ml-1">
                      立即登录
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer links */}
        <div className="mt-8 flex gap-6 text-xs text-slate-400 font-medium">
          <span className="hover:text-[#1a233a] transition-colors cursor-pointer">帮助中心</span>
          <span className="hover:text-[#1a233a] transition-colors cursor-pointer">联系我们</span>
          <span className="hover:text-[#1a233a] transition-colors cursor-pointer">语言: 简体中文</span>
        </div>
      </div>
    </div>
  );
}
