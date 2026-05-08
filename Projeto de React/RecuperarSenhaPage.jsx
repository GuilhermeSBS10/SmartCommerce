import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { KeyRound, Eye, EyeOff } from 'lucide-react'
import { authService } from './api'
import { getFriendlyAuthErrorMessage } from './authHelpers'
import styles from './AuthPage.module.css'

export default function RecuperarSenhaPage() {
  const [form, setForm] = useState({ email: '', novaSenha: '', confirmarSenha: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    if (errorMessage) setErrorMessage('')
    if (successMessage) setSuccessMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (form.novaSenha.length < 6) {
      setErrorMessage('A nova senha deve ter no minimo 6 caracteres.')
      return
    }

    if (form.novaSenha !== form.confirmarSenha) {
      setErrorMessage('A confirmacao da senha precisa ser igual a nova senha.')
      return
    }

    setLoading(true)
    try {
      const { data } = await authService.recuperarSenha({
        email: form.email,
        novaSenha: form.novaSenha,
      })
      setSuccessMessage(data?.message || 'Senha atualizada com sucesso. Voce ja pode entrar.')
      toast.success('Senha redefinida com sucesso!')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      const message = getFriendlyAuthErrorMessage('recover', err)
      setErrorMessage(message)
      toast.error(message)
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
            <KeyRound size={26} />
          </div>
          <h1>Recuperar senha</h1>
          <p>Informe seu email cadastrado e escolha uma nova senha para voltar a acessar.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email cadastrado</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="novaSenha">Nova senha</label>
            <div className={styles.passwordWrapper}>
              <input
                id="novaSenha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimo 6 caracteres"
                value={form.novaSenha}
                onChange={(event) => updateField('novaSenha', event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(value => !value)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmarSenha">Confirmar nova senha</label>
            <div className={styles.passwordWrapper}>
              <input
                id="confirmarSenha"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita a nova senha"
                value={form.confirmarSenha}
                onChange={(event) => updateField('confirmarSenha', event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirmPassword(value => !value)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className={styles.errorMessage} role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className={styles.successMessage} role="status">
              {successMessage}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Redefinir senha'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Lembrou da senha? <Link to="/login">Voltar para entrar</Link>
        </p>
      </div>
    </div>
  )
}
