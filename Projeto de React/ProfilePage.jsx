import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ShieldCheck, UserRound } from 'lucide-react'
import { userService } from './api'
import { useAuth } from './AuthContext'
import styles from './AccountPage.module.css'

function maskCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function isValidCpf(cpf) {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (new Set(digits).size === 1) return false

  let first = 0
  for (let index = 0; index < 9; index += 1) first += Number(digits[index]) * (10 - index)
  first = 11 - (first % 11)
  if (first >= 10) first = 0

  let second = 0
  for (let index = 0; index < 10; index += 1) second += Number(digits[index]) * (11 - index)
  second = 11 - (second % 11)
  if (second >= 10) second = 0

  return first === Number(digits[9]) && second === Number(digits[10])
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    cpf: maskCpf(user?.cpf || ''),
  })
  const [security, setSecurity] = useState({
    novoEmail: user?.email || '',
    novaSenha: '',
    senhaAtual: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSecurity, setSavingSecurity] = useState(false)

  const sanitizedCpf = useMemo(() => profile.cpf.replace(/\D/g, ''), [profile.cpf])

  const saveProfile = async (event) => {
    event.preventDefault()
    if (sanitizedCpf && !isValidCpf(profile.cpf)) {
      toast.error('CPF inválido')
      return
    }

    setSavingProfile(true)
    try {
      const { data } = await userService.atualizarPerfil({
        nome: profile.nome,
        email: profile.email,
        telefone: profile.telefone,
        cpf: sanitizedCpf,
      })
      updateUser(data)
      toast.success('Perfil atualizado com sucesso')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível atualizar o perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const saveSecurity = async (event) => {
    event.preventDefault()
    setSavingSecurity(true)
    try {
      const { data } = await userService.atualizarSeguranca(security)
      updateUser(data)
      setSecurity((current) => ({ ...current, senhaAtual: '', novaSenha: '' }))
      toast.success('Dados de segurança atualizados')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível atualizar a segurança da conta')
    } finally {
      setSavingSecurity(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><UserRound size={14} /> Perfil e conta</span>
          <h1>Seus dados</h1>
          <p>Edite informações pessoais e mantenha a segurança da sua conta sob controle.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Perfil</h2>
              <p>Dados usados para identificar e personalizar sua conta.</p>
            </div>

            <form className={styles.form} onSubmit={saveProfile}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="nome">Nome</label>
                  <input id="nome" value={profile.nome} onChange={(event) => setProfile((current) => ({ ...current, nome: event.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="telefone">Telefone</label>
                  <input id="telefone" value={profile.telefone} onChange={(event) => setProfile((current) => ({ ...current, telefone: event.target.value }))} />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="cpf">CPF</label>
                  <input id="cpf" value={profile.cpf} onChange={(event) => setProfile((current) => ({ ...current, cpf: maskCpf(event.target.value) }))} placeholder="000.000.000-00" />
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.primaryButton} disabled={savingProfile}>
                  {savingProfile ? 'Salvando...' : 'Salvar perfil'}
                </button>
              </div>
            </form>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Segurança da conta</h2>
              <p>Alterações sensíveis sempre exigem sua senha atual.</p>
            </div>

            <form className={styles.form} onSubmit={saveSecurity}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="novoEmail">Novo email</label>
                  <input id="novoEmail" type="email" value={security.novoEmail} onChange={(event) => setSecurity((current) => ({ ...current, novoEmail: event.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="novaSenha">Nova senha</label>
                  <input id="novaSenha" type="password" value={security.novaSenha} onChange={(event) => setSecurity((current) => ({ ...current, novaSenha: event.target.value }))} />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="senhaAtual">Senha atual</label>
                <input id="senhaAtual" type="password" value={security.senhaAtual} onChange={(event) => setSecurity((current) => ({ ...current, senhaAtual: event.target.value }))} required />
              </div>

              <div className={styles.actions}>
                <button className={styles.primaryButton} disabled={savingSecurity}>
                  {savingSecurity ? 'Atualizando...' : 'Salvar segurança'}
                </button>
              </div>
            </form>
          </section>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Resumo da conta</h2>
            <p>Uma visão rápida do que está cadastrado hoje.</p>
          </div>

          <div className={styles.detailsList}>
            <div className={styles.detailsItem}>
              <span>Nome</span>
              <strong>{user?.nome || '—'}</strong>
            </div>
            <div className={styles.detailsItem}>
              <span>Email</span>
              <strong>{user?.email || '—'}</strong>
            </div>
            <div className={styles.detailsItem}>
              <span>Telefone</span>
              <strong>{user?.telefone || 'Não informado'}</strong>
            </div>
            <div className={styles.detailsItem}>
              <span>CPF</span>
              <strong>{user?.cpf ? maskCpf(user.cpf) : 'Não informado'}</strong>
            </div>
            <div className={styles.detailsItem}>
              <span>Segurança</span>
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} />
                Verificação por senha atual
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
