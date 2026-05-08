import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authService, userService } from './api'
import { useTheme } from './ThemeContext'

const AuthContext = createContext(null)

function applyUserUiPreferences(user) {
  document.documentElement.dataset.compact = user?.compactMode ? 'true' : 'false'
  document.documentElement.dataset.animations = user?.animationsEnabled === false ? 'reduced' : 'full'
}

function mapUser(data) {
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone || '',
    cpf: data.cpf || '',
    theme: data.theme || 'dark',
    notificationsEnabled: data.notificationsEnabled ?? true,
    compactMode: data.compactMode ?? false,
    animationsEnabled: data.animationsEnabled ?? true,
  }
}

export function AuthProvider({ children }) {
  const { setTheme } = useTheme()
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sc_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [authLoading, setAuthLoading] = useState(true)

  const persistUser = useCallback((data) => {
    const mapped = mapUser(data)
    localStorage.setItem('sc_user', JSON.stringify(mapped))
    setUser(mapped)
    setTheme(mapped.theme)
    applyUserUiPreferences(mapped)
    return mapped
  }, [setTheme])

  useEffect(() => {
    const token = localStorage.getItem('sc_token')
    if (!token) {
      setAuthLoading(false)
      return
    }

    userService.me()
      .then(({ data }) => {
        persistUser(data)
      })
      .catch(() => {
        localStorage.removeItem('sc_token')
        localStorage.removeItem('sc_user')
        setUser(null)
      })
      .finally(() => setAuthLoading(false))
  }, [persistUser])

  const login = useCallback(async (email, senha) => {
    const { data } = await authService.login({ email, senha })
    localStorage.setItem('sc_token', data.token)
    persistUser(data)
    return data
  }, [persistUser])

  const register = useCallback(async (nome, email, senha) => {
    const { data } = await authService.register({ nome, email, senha })
    localStorage.setItem('sc_token', data.token)
    persistUser(data)
    return data
  }, [persistUser])

  const refreshUser = useCallback(async () => {
    const { data } = await userService.me()
    return persistUser(data)
  }, [persistUser])

  const updateUser = useCallback((data) => {
    return persistUser(data)
  }, [persistUser])

  const logout = useCallback(() => {
    localStorage.removeItem('sc_token')
    localStorage.removeItem('sc_user')
    setUser(null)
    applyUserUiPreferences(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, updateUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
