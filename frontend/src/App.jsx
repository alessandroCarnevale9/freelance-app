import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from './hooks/useAuthContext';
import HomePage from './pages/home/HomePage';
import RegistrationPage from './pages/registration/RegistrationPage';
import FreelancerDashboard from './pages/freelancer-dashboard/FreelancerDashboard';
import ClientDashboard from './pages/client-dashboard/ClientDashboard';
import NavBar from './components/nav/NavBar';

// Helper function per ottenere i dati utente dalla struttura nidificata
const getUserData = (authUser) => {
  if (!authUser) return null;

  // Gestisce la struttura nidificata: user.returnUser.user
  if (authUser.returnUser?.user) {
    return authUser.returnUser.user;
  }

  // Fallback se la struttura è diversa
  if (authUser.user) {
    return authUser.user;
  }

  // Se non ci sono annidamenti
  return authUser;
};

// Componente per proteggere le route che richiedono autenticazione
const ProtectedRoute = ({ children }) => {
  const { user: authUser } = useAuthContext();

  if (!authUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente per reindirizzare utenti già loggati dalla home
const PublicRoute = ({ children }) => {
  const { user: authUser } = useAuthContext();

  if (authUser) {
    const userData = getUserData(authUser);
    console.log('PublicRoute - User data:', userData);

    // Reindirizza alla dashboard appropriata in base al ruolo
    if (userData?.role === 'FREELANCER') {
      return <Navigate to="/freelancer-dashboard" replace />;
    } else if (userData?.role === 'CLIENT') {
      return <Navigate to="/client-dashboard" replace />;
    }
  }

  return children;
};

// Componente per reindirizzare alla dashboard corretta
const DashboardRedirect = () => {
  const { user: authUser } = useAuthContext();

  if (!authUser) {
    return <Navigate to="/" replace />;
  }

  const userData = getUserData(authUser);
  console.log('DashboardRedirect - User data:', userData);

  if (userData?.role === 'FREELANCER') {
    return <Navigate to="/freelancer-dashboard" replace />;
  } else if (userData?.role === 'CLIENT') {
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