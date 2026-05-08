import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './AuthContext'
import { ThemeProvider, useTheme } from './ThemeContext'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import RecuperarSenhaPage from './RecuperarSenhaPage'
import DashboardPage from './DashboardPage'
import TransacoesPage from './TransacoesPage'
import ProfilePage from './ProfilePage'
import SettingsPage from './SettingsPage'
import Layout from './Layout'

function PrivateRoute({ children }) {
  const { user, authLoading } = useAuth()
  if (authLoading) return <AppSplash />
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, authLoading } = useAuth()
  if (authLoading) return <AppSplash />
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppSplash() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 52,
          height: 52,
          margin: '0 auto 16px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, var(--accent), #00d09e)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
        }} />
        <strong style={{ display: 'block', marginBottom: 6 }}>Carregando seu ambiente</strong>
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Só um instante...</span>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { theme } = useTheme()
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#0f1117' : '#ffffff',
            color: theme === 'dark' ? '#e8edf5' : '#0f172a',
            border: theme === 'dark' ? '1px solid #1e2636' : '1px solid #dbe4f0',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00d09e', secondary: theme === 'dark' ? '#0f1117' : '#ffffff' } },
          error: { iconTheme: { primary: '#ff4d6d', secondary: theme === 'dark' ? '#0f1117' : '#ffffff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/recuperar-senha" element={<PublicRoute><RecuperarSenhaPage /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="transacoes" element={<TransacoesPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
