import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from './hooks/useAuthContext';
import HomePage from './pages/home/HomePage';
import RegistrationPage from './pages/registration/RegistrationPage';
import FreelancerDashboard from './pages/freelancer-dashboard/FreelancerDashboard';
import ClientDashboard from './pages/client-dashboard/ClientDashboard';
import ProfileView from './pages/profile-view/ProfileView';
import ProfileEdit from './pages/profile-edit/ProfileEdit';
import NavBar from './components/nav/NavBar';
import AnnouncementCreationPage from './pages/announcementCreation/AnnouncementCreationPage';

// Route protetta base - richiede autenticazione
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route protetta per ruolo specifico
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Reindirizza alla dashboard corretta se il ruolo non è autorizzato
    if (user.role === 'FREELANCER') {
      return <Navigate to="/freelancer-dashboard" replace />;
    } else if (user.role === 'CLIENT') {
      return <Navigate to="/client-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route pubbliche - redirect se già loggato
const PublicRoute = ({ children }) => {
  const { user } = useAuthContext();

  if (user) {
    if (user.role === 'FREELANCER') {
      return <Navigate to="/freelancer-dashboard" replace />;
    } else if (user.role === 'CLIENT') {
      return <Navigate to="/client-dashboard" replace />;
    }
  }

  return children;
};

// Reindirizza alla dashboard corretta in base al ruolo
const DashboardRedirect = () => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role === 'FREELANCER') {
    return <Navigate to="/freelancer-dashboard" replace />;
  } else if (user.role === 'CLIENT') {
    return <Navigate to="/client-dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <NavBar />
        <main className="app-main">
          <Routes>
            {/* Route pubbliche - redirect se già loggato */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              }
            />

            <Route
              path="/registration"
              element={
                <PublicRoute>
                  <RegistrationPage />
                </PublicRoute>
              }
            />

            {/* Dashboard Freelancer - SOLO per FREELANCER */}
            <Route
              path="/freelancer-dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['FREELANCER']}>
                  <FreelancerDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Dashboard Cliente - SOLO per CLIENT */}
            <Route
              path="/client-dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['CLIENT']}>
                  <ClientDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Creazione annunci - SOLO per CLIENT */}
            <Route
              path="/dashboard/announcement-creation"
              element={
                <RoleProtectedRoute allowedRoles={['CLIENT']}>
                  <AnnouncementCreationPage />
                </RoleProtectedRoute>
              }
            />

            {/* Profilo - accessibile a tutti gli utenti autenticati */}
            <Route
              path="/profile/:address"
              element={
                <ProtectedRoute>
                  <ProfileView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <ProfileEdit />
                </ProtectedRoute>
              }
            />

            {/* Route generica dashboard - reindirizza a quella corretta */}
            <Route
              path="/dashboard"
              element={<DashboardRedirect />}
            />

            {/* Catch-all route */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;