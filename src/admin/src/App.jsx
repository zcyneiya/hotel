import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MerchantLayout from './pages/Merchant/Layout';
import MerchantHotels from './pages/Merchant/Hotels';
import HotelForm from './pages/Merchant/HotelForm';
import AdminLayout from './pages/Admin/Layout';
import AdminHotels from './pages/Admin/Hotels';
import AdminAudit from './pages/Admin/Audit';
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
      <Route path="/register" element={<Register />} />
      
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
        <Route index element={<Navigate to="/admin/audit" />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="hotels" element={<AdminHotels />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
