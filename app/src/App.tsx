import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MobileLayout from './layouts/MobileLayout';
import HotelSearchHome from './pages/HotelSearchHome';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminRegister = lazy(() => import('./pages/admin/AdminRegister'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const MerchantHotelList = lazy(() => import('./pages/admin/MerchantHotelList'));
const MerchantHotelForm = lazy(() => import('./pages/admin/MerchantHotelForm'));
const AdminReviewList = lazy(() => import('./pages/admin/AdminReviewList'));
const AdminReviewDetail = lazy(() => import('./pages/admin/AdminReviewDetail'));

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-cream">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Mobile */}
          <Route element={<MobileLayout />}>
            <Route path="/" element={<HotelSearchHome />} />
            <Route path="/list" element={<HotelList />} />
            <Route path="/hotel/:id" element={<HotelDetail />} />
          </Route>

          {/* Admin auth (no sidebar) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* Admin (with sidebar) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="hotels" element={<MerchantHotelList />} />
            <Route path="hotels/new" element={<MerchantHotelForm />} />
            <Route path="hotels/:id" element={<MerchantHotelForm />} />
            <Route path="review" element={<AdminReviewList />} />
            <Route path="review/:id" element={<AdminReviewDetail />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
