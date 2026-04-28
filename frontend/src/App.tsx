import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SitesPage } from './pages/SitesPage';
import { VisitorsPage } from './pages/VisitorsPage';
import { OperatorsPage } from './pages/OperatorsPage';
import { GuidesPage } from './pages/GuidesPage';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './components/MainLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />
      <Route path="/visitors" element={<ProtectedRoute><VisitorsPage /></ProtectedRoute>} />
      <Route path="/operators" element={<ProtectedRoute><OperatorsPage /></ProtectedRoute>} />
      <Route path="/guides" element={<ProtectedRoute><GuidesPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
