import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HotelSearchHome from './pages/HotelSearchHome';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-[430px] mx-auto min-h-dvh bg-cream relative">
        <Routes>
          <Route path="/" element={<HotelSearchHome />} />
          <Route path="/list" element={<HotelList />} />
          <Route path="/hotel/:id" element={<HotelDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
