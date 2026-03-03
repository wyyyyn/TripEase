/**
 * 登录/注册页共享的左侧面板
 * 包含 Logo、酒店图片、标题和统计数据
 */
export default function AuthLeftPanel({ title }: { title: string }) {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-[#FAF8F5] relative overflow-hidden">
      {/* Logo */}
      <div className="absolute top-12 left-12 flex items-center gap-2">
        <div className="w-10 h-10 bg-[#1978e5] rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white font-bold">apartment</span>
        </div>
        <span className="text-2xl font-bold text-[#1a2b4b] tracking-tight">TripEase</span>
      </div>

      <div className="max-w-md z-10">
        {/* Hero image */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
          <img
            alt="Luxury hotel lobby interior"
            className="w-full h-auto object-cover aspect-[4/3]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuURIw4ZL5oBMhKBVy4vLlCivax1AzElMfn5eCW-FvduOkTZi7p4zFlZKBfUEjvN6KuLH59UgJRReAJEkNYqCGNqqtTtoQq64-crprt8_4dbo71-TLdY1qHjlPgZSNOa9p0kcNfHTyJ9i1cuYw7n1DGEC0ox0G67pQBFspoZ5pWUNLhoi7TzrdJBcJy9oT41_Pw2KHiw2AQFssZ2KAmbpDunQF_oE4196IZOCWmzgt9b-HKY4vjFqf7czvMOBY2fUHPbyfGAcuC8g"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-[#1a2b4b] leading-tight mb-4">{title}</h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          专为独立业主与连锁品牌打造的智能管理中枢
        </p>

        {/* Stats */}
        <div className="mt-12 flex gap-8">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#1a2b4b]">2,500+</span>
            <span className="text-sm text-slate-500">酒店正在使用</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#1a2b4b]">99.9%</span>
            <span className="text-sm text-slate-500">系统稳定在线</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#1a2b4b]">7×24 小时</span>
            <span className="text-sm text-slate-500">专属支持</span>
          </div>
        </div>
      </div>

      {/* Decorative blurs */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#1978e5]/10 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1978e5]/5 rounded-full blur-3xl" />
    </div>
  );
}
