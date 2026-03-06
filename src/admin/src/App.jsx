import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

const Login = lazy(() => import('./pages/Login'));
const MerchantLayout = lazy(() => import('./pages/Merchant/Layout'));
const MerchantHotels = lazy(() => import('./pages/Merchant/Hotels'));
const HotelForm = lazy(() => import('./pages/Merchant/HotelForm'));
const HotelView = lazy(() => import('./pages/Merchant/HotelView'));
const AdminLayout = lazy(() => import('./pages/Admin/Layout'));
const AdminHotels = lazy(() => import('./pages/Admin/Hotels'));
const OfflineHotels = lazy(() => import('./pages/Admin/OfflineHotels'));

function PrivateRoute({ children, requiredRole }) {
  const { user, token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* 商户路由 */}
      <Route
        path="/merchant"
        element={
          <PrivateRoute requiredRole="merchant">
            <MerchantLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/merchant/hotels" />} />
        <Route path="hotels" element={<MerchantHotels />} />
        <Route path="hotels/new" element={<HotelForm />} />
        <Route path="hotels/edit/:id" element={<HotelForm />} />
        <Route path="hotels/view/:id" element={<HotelView />} />
      </Route>

      {/* 管理员路由 */}
      <Route
        path="/admin"
        element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/admin/hotels" />} />
        <Route path="hotels" element={<AdminHotels />} />
        <Route path="offline" element={<OfflineHotels />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
    </Suspense>
  );
}

export default App;
