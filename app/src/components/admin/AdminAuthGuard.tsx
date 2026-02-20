import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../../store/authStore';

export default function AdminAuthGuard() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
