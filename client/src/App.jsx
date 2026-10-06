import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QuickLoginBar from './components/QuickLoginBar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicPreRegister from './pages/PublicPreRegister';
import PublicPassView from './pages/PublicPassView';
import Dashboard from './pages/Dashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import PassesPage from './pages/PassesPage';
import CheckInOutPage from './pages/CheckInOutPage';
import ReportsPage from './pages/ReportsPage';
import UserManagementPage from './pages/UserManagementPage';
import ProfilePage from './pages/ProfilePage';

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isPublicStandalone = ['/', '/login', '/register', '/pre-register'].includes(location.pathname) || location.pathname.startsWith('/pass/');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Demo Bar */}
      <QuickLoginBar />

      {/* Main Navbar */}
      <Navbar />

      {/* Main Content Area */}
      {isPublicStandalone && !isAuthenticated ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pre-register" element={<PublicPreRegister />} />
          <Route path="/pass/:identifier" element={<PublicPassView />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/register" element={<Navigate to="/dashboard" replace />} />
              <Route path="/pre-register" element={<PublicPreRegister />} />
              <Route path="/pass/:identifier" element={<PublicPassView />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/passes"
                element={
                  <ProtectedRoute>
                    <PassesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/check-in-out"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'security']}>
                    <CheckInOutPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'security']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
