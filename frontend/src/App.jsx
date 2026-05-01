import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import MentorDashboard from './pages/MentorDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/mentor" element={<MentorDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/report" element={<ReportPage />} />
    </Routes>
  )
}
