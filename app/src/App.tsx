import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MobileLayout from './mobile/layouts/MobileLayout';
import MobileAuth from './mobile/pages/MobileAuth';
import HotelSearchHome from './mobile/pages/HotelSearchHome';
import SearchPage from './mobile/pages/SearchPage';
import HotelList from './mobile/pages/HotelList';
import HotelDetail from './mobile/pages/HotelDetail';

const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminRegister = lazy(() => import('./admin/pages/AdminRegister'));
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const MerchantHotelList = lazy(() => import('./admin/pages/MerchantHotelList'));
const MerchantHotelForm = lazy(() => import('./admin/pages/MerchantHotelForm'));
const AdminReviewList = lazy(() => import('./admin/pages/AdminReviewList'));
const AdminReviewDetail = lazy(() => import('./admin/pages/AdminReviewDetail'));

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
          {/* Mobile auth (full-screen, outside MobileLayout) */}
          <Route path="/login" element={<MobileAuth />} />

          {/* Mobile (with auth guard) */}
          <Route element={<MobileLayout />}>
            <Route path="/" element={<HotelSearchHome />} />
            <Route path="/search" element={<SearchPage />} />
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
