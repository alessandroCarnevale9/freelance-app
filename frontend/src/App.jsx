
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from './pages/home/HomePage';
import DashBoardPage from './pages/dashboard/DashboardPage';
import RegistrationPage from './pages/registration/RegistrationPage';
import NavBar from './components/nav/NavBar';
import AnnouncementCreationPage from './pages/announcementCreation/AnnouncementCreationPage';

function App() {

  return (
    <BrowserRouter>
      <div className="app-root">
        <NavBar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/registration" element={<RegistrationPage/>} />
            <Route path="/dashboard" element={<DashBoardPage />} />
            <Route path="/dashboard/announcement-creation" element={<AnnouncementCreationPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
