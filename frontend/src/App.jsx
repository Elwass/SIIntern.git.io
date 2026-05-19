import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'
import StudentApplicationPage from './pages/StudentApplicationPage'
import AdminApplicationsPage from './pages/AdminApplicationsPage'
import MentorApplicationsPage from './pages/MentorApplicationsPage'
import StudentSectionPage from './pages/StudentSectionPage'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedRoute allowedRoles={["admin", "pembimbing_lapangan"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
          <Route path="/mentor" element={<MentorApplicationsPage />} />
          <Route path="/mentor/applications" element={<MentorApplicationsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/applications" element={<StudentApplicationPage />} />
          <Route path="/student/profile" element={<StudentSectionPage section="profile" />} />
          <Route path="/student/documents" element={<StudentSectionPage section="documents" />} />
          <Route path="/student/logbooks" element={<StudentSectionPage section="logbooks" />} />
          <Route path="/student/schedule" element={<StudentSectionPage section="schedule" />} />
          <Route path="/student/mentor" element={<StudentSectionPage section="mentor" />} />
          <Route path="/student/assessments" element={<StudentSectionPage section="assessments" />} />
          <Route path="/student/final-report" element={<StudentSectionPage section="final_report" />} />
          <Route path="/student/notifications" element={<StudentSectionPage section="notifications" />} />
        </Route>
      </Route>
    </Routes>
  )
}
