import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";
import HomePage from "./pages/home/HomePage";
import RegistrationPage from "./pages/registration/RegistrationPage";
import FreelancerDashboard from "./pages/freelancer-dashboard/FreelancerDashboard";
import Dashboard from "./pages/dashboard/DashboardPage";
import ClientDashboard from "./pages/client-dashboard/ClientDashboard";
import ProfileView from "./pages/profile-view/ProfileView";
import ProfileEdit from "./pages/profile-edit/ProfileEdit";
import NavBar from "./components/nav/NavBar";
import AnnouncementCreationPage from "./pages/announcementCreation/AnnouncementCreationPage";
import AnnouncementListPage from "./pages/announcementsList/AnnouncementListPage";
import AnnouncementDetailsPage from "./pages/announcementDetails/AnnouncementDetailsPage";
import AnnouncementReviewPage from "./pages/announcementReviewClient/AnnouncementReviewPage";
import AnnouncementReviewFreelancerPage from "./pages/announcementReviewFreelancer/AnnouncementReviewFreelancerPage";
import AnnouncementEditPage from "./pages/announcementEdit/AnnouncementEditPage";

// Componente per proteggere le route che richiedono autenticazione
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role) {
    if (role == user.role) {
      return children;
    } else {
      return <Navigate to="/" replace />;
    }
  } else {
    return children;
  }
};

// Componente per reindirizzare utenti già loggati dalla home
const PublicRoute = ({ children }) => {
  const { user } = useAuthContext();

  if (user) {
    // Reindirizza alla dashboard appropriata in base al ruolo
    if (user.role === "FREELANCER") {
      return <Navigate to="/freelancer-dashboard" replace />;
    } else if (user.role === "CLIENT") {
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

  console.log("DashboardRedirect - User data:", user);

  if (user.role === "FREELANCER") {
    return <Navigate to="/freelancer-dashboard" replace />;
  } else if (user.role === "CLIENT") {
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

            <Route path="/registration" element={<RegistrationPage />} />

            {/* Route protette - richiedono autenticazione */}
            <Route
              path="/freelancer-dashboard"
              element={
                <ProtectedRoute role="FREELANCER">
                  <FreelancerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client-dashboard"
              element={
                <ProtectedRoute role="CLIENT">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Route annunci - protetta */}
            <Route
              path="/dashboard/announcement-creation"
              element={
                <ProtectedRoute role="CLIENT">
                  <AnnouncementCreationPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/announcement-edit/:id"
              element={
                <ProtectedRoute role="CLIENT">
                  <AnnouncementEditPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/announcements-list"
              element={
                <ProtectedRoute role="FREELANCER">
                  <AnnouncementListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/announcements-list/:id"
              element={
                <ProtectedRoute role="FREELANCER">
                  <AnnouncementDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client-dashboard/announcement/:id"
              element={
                <ProtectedRoute role="CLIENT">
                  <AnnouncementReviewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/freelancer-dashboard/announcement/:id"
              element={
                <ProtectedRoute role="FREELANCER">
                  <AnnouncementReviewFreelancerPage />
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
                <ProtectedRoute role="FREELANCER">
                  <ProfileEdit />
                </ProtectedRoute>
              }
            />

            {/* Route generica dashboard - reindirizza a quella corretta */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Catch-all route - reindirizza alla home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
