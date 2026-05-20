import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import CookieBanner from './components/ui/CookieBanner'
import ForumPage from './pages/ForumPage'
import SandboxPage from './pages/SandboxPage'
import DocsPage from './pages/DocsPage'
import CodeExchangePage from './pages/CodeExchangePage'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import PrivacyPage from './pages/PrivacyPage'
import useAuthStore from './store/useAuthStore'

export default function App() {
  const loadMe = useAuthStore((s) => s.loadMe)

  useEffect(() => { loadMe() }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/forum" replace />} />
            <Route path="/forum"     element={<ForumPage />} />
            <Route path="/sandbox"   element={<SandboxPage />} />
            <Route path="/docs"      element={<DocsPage />} />
            <Route path="/code"      element={<CodeExchangePage />} />
            <Route path="/solutions" element={<PlaceholderPage />} />
            <Route path="/profile"   element={<ProfilePage />} />
            <Route path="/admin"     element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>

      {/* Banner shows on every page including /login and /privacy */}
      <CookieBanner />
    </BrowserRouter>
  )
}
