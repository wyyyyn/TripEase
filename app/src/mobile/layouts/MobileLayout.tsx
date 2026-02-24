import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/store/useStore';
import { initAuth } from '../../shared/store/authStore';

export default function MobileLayout() {
  const user = useAuth();
  const [checking, setChecking] = useState(true);

  // 启动时用 token 向后端验证身份
  useEffect(() => {
    initAuth().finally(() => setChecking(false));
  }, []);

  // 正在验证 token，显示加载动画
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-cream">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  // 未登录，跳转到登录页
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-dvh bg-cream relative">
      <Outlet />
    </div>
  );
}
