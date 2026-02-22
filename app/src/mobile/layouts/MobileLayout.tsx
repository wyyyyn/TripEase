import { Outlet } from 'react-router-dom';

export default function MobileLayout() {
  return (
    <div className="max-w-[430px] mx-auto min-h-dvh bg-cream relative">
      <Outlet />
    </div>
  );
}
