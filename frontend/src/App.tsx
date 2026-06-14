import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SitesPage } from './pages/SitesPage';
import { VisitorsPage } from './pages/VisitorsPage';
import { OperatorsPage } from './pages/OperatorsPage';
import { GuidesPage } from './pages/GuidesPage';
import { ReportsPage } from './pages/ReportsPage';
import { AccommodationsPage } from './pages/AccommodationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UsersPage } from './pages/UsersPage';
import { SiteProfilePage } from './pages/SiteProfilePage';
import { OperatorProfilePage } from './pages/OperatorProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import BiManagementPage from './pages/BiManagementPage';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './components/MainLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
}

function RoleGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const user = useAuthStore((state) => state.user);
  // Optional chaining is safe here since ProtectedRoute ensures user is authenticated
  const hasRole = user?.roles?.some((role: any) => allowedRoles.includes(role.slug)) ?? false;
  
  if (!hasRole) {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/bi-management" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><BiManagementPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />
      <Route path="/sites/:id" element={<ProtectedRoute><SiteProfilePage /></ProtectedRoute>} />
      <Route path="/visitors" element={<ProtectedRoute><VisitorsPage /></ProtectedRoute>} />
      <Route path="/operators" element={<ProtectedRoute><OperatorsPage /></ProtectedRoute>} />
      <Route path="/operators/:id" element={<ProtectedRoute><OperatorProfilePage /></ProtectedRoute>} />
      <Route path="/guides" element={<ProtectedRoute><GuidesPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/accommodations" element={<ProtectedRoute><AccommodationsPage /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><AuditLogsPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><UsersPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><SettingsPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
