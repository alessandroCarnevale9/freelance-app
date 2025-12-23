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

// Componente per proteggere le route che richiedono autenticazione
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente per reindirizzare utenti già loggati dalla home
const PublicRoute = ({ children }) => {
  const { user } = useAuthContext();

  if (user) {
    console.log('PublicRoute - User data:', user);
    // Reindirizza alla dashboard appropriata in base al ruolo
    if (user.role === 'FREELANCER') {
      return <Navigate to="/freelancer-dashboard" replace />;
    } else if (user.role === 'CLIENT') {
      return <Navigate to="/client-dashboard" replace />;
    }
  }

  return children;
};

// Componente per reindirizzare alla dashboard corretta
const DashboardRedirect = () => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  console.log('DashboardRedirect - User data:', user);

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
              element={<RegistrationPage />}
            />

            {/* Route protette - richiedono autenticazione */}
            <Route
              path="/freelancer-dashboard"
              element={
                <ProtectedRoute>
                  <FreelancerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client-dashboard"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Route profilo */}
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

            {/* Catch-all route - reindirizza alla home */}
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