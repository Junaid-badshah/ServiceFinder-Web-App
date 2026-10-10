import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// AUTH
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import RegisterCustomer from './pages/auth/RegisterCustomer';
import RegisterCustomerEmail from './pages/auth/RegisterCustomerEmail';
import RegisterCustomerPhone from './pages/auth/RegisterCustomerPhone';
import RegisterProvider from './pages/auth/RegisterProvider';

// CUSTOMER
import Home from './pages/customer/Home';
import Providers from './pages/customer/Providers';
import ProviderDetails from './pages/customer/ProviderDetails';
import MyRequests from './pages/customer/MyRequests';
import RequestService from './pages/customer/RequestService';

// PROVIDER
import Dashboard from './pages/provider/Dashboard';
import AddProvider from './pages/provider/AddProvider';
import EditProvider from './pages/provider/EditProvider';

// ADMIN
import AdminPanel from './pages/admin/AdminPanel';
import Profile from './pages/customer/Profile';

function AppContent() {
  const { user } = useAuth();

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {user && <Navbar />}
        <Routes>
          {/* ===== AUTH ROUTES ===== */}
          <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/home" replace /> : <ForgotPassword />} />

          {/* Customer Registration - Choice Page */}
          <Route path="/register-customer" element={user ? <Navigate to="/home" replace /> : <RegisterCustomer />} />
          <Route path="/register/customer" element={user ? <Navigate to="/home" replace /> : <RegisterCustomer />} />
          <Route path="/register/customer/email" element={user ? <Navigate to="/home" replace /> : <RegisterCustomerEmail />} />
          <Route path="/register/customer/phone" element={user ? <Navigate to="/home" replace /> : <RegisterCustomerPhone />} />

          {/* Provider Registration */}
          <Route path="/register-provider" element={user ? <Navigate to="/home" replace /> : <RegisterProvider />} />

          {/* ===== PROTECTED ROUTES ===== */}
          <Route path="/home" element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/providers" element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
              <Providers />
            </ProtectedRoute>
          } />
          <Route path="/providers/:id" element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
              <ProviderDetails />
            </ProtectedRoute>
          } />
          <Route path="/request-service/:providerId" element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
              <RequestService />
            </ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
              <MyRequests />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/add-provider" element={
            <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
              <AddProvider />
            </ProtectedRoute>
          } />
          <Route path="/edit-provider/:id" element={
            <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
              <EditProvider />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* ===== DEFAULT ROUTES ===== */}
          <Route path="/" element={<Navigate to={user ? '/home' : '/login'} replace />} />
          <Route path="*" element={<Navigate to={user ? '/home' : '/login'} replace />} />
        </Routes>
      </div>
  );
}

function App() {
  return (
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
  );
}

export default App;