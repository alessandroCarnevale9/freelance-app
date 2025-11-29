
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from './pages/home/HomePage';
import RegistrationPage from './pages/registration/RegistrationPage';
import NavBar from './components/nav/NavBar';

function App() {

  return (
    <BrowserRouter>
      <div className="app-root">
        <NavBar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="registration" element={<RegistrationPage/>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
