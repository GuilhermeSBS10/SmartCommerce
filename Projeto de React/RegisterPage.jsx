import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import { getFriendlyAuthErrorMessage } from './authHelpers'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    if (form.senha.length < 6) {
      const msg = 'Senha deve ter no mínimo 6 caracteres'
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    setLoading(true)
    try {
      await register(form.nome, form.email, form.senha)
      setTransitioning(true)
      toast.success('Conta criada com sucesso!')
      setTimeout(() => navigate('/dashboard'), 900)
    } catch (err) {
      const msg = getFriendlyAuthErrorMessage('register', err)
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
          <h1>Criar Conta</h1>
          <p>Comece a controlar suas finanças hoje</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              placeholder="Seu nome"
              value={form.nome}
              onChange={e => {
                setForm(f => ({ ...f, nome: e.target.value }))
                if (errorMessage) setErrorMessage('')
              }}
              required
              minLength={2}
            />
          </div>

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
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={e => {
                  setForm(f => ({ ...f, senha: e.target.value }))
                  if (errorMessage) setErrorMessage('')
                }}
                required
                minLength={6}
                autoComplete="new-password"
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

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Criar conta'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>

      {transitioning && (
        <div className={styles.transitionOverlay}>
          <div className={styles.transitionCard}>
            <span className={styles.spinner} />
            <strong>Quase lá</strong>
            <p>Configurando sua área financeira...</p>
          </div>
        </div>
      )}
    </div>
  )
}
