import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import { getFriendlyAuthErrorMessage } from './authHelpers'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', senha: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)
    try {
      await login(form.email, form.senha)
      setTransitioning(true)
      toast.success('Bem-vindo de volta!')
      setTimeout(() => navigate('/dashboard'), 900)
    } catch (err) {
      const msg = getFriendlyAuthErrorMessage('login', err)
      setErrorMessage(msg)
      toast.error(msg)
      setTransitioning(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <TrendingUp size={26} />
          </div>
          <h1>SmartCommerce</h1>
          <p>Controle suas finanças com inteligência</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => {
                setForm(f => ({ ...f, email: e.target.value }))
                if (errorMessage) setErrorMessage('')
              }}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="senha">Senha</label>
            <div className={styles.passwordWrapper}>
              <input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={form.senha}
                onChange={e => {
                  setForm(f => ({ ...f, senha: e.target.value }))
                  if (errorMessage) setErrorMessage('')
                }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.inlineActions}>
            <Link to="/recuperar-senha" className={styles.forgotLink}>
              Esqueci minha senha
            </Link>
          </div>

          {errorMessage && (
            <div className={styles.errorMessage} role="alert">
              {errorMessage}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Entrar'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </div>

      {transitioning && (
        <div className={styles.transitionOverlay}>
          <div className={styles.transitionCard}>
            <span className={styles.spinner} />
            <strong>Preparando seu painel</strong>
            <p>Carregando seus dados com segurança...</p>
          </div>
        </div>
      )}
    </div>
  )
}
