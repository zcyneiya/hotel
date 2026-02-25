import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MerchantLayout from './pages/Merchant/Layout';
import MerchantHotels from './pages/Merchant/Hotels';
import HotelForm from './pages/Merchant/HotelForm';
import HotelView from './pages/Merchant/HotelView';
import AdminLayout from './pages/Admin/Layout';
import AdminHotels from './pages/Admin/Hotels';
import OfflineHotels from './pages/Admin/OfflineHotels';
import { useAuthStore } from './store/authStore';

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
  );
}

export default App;
