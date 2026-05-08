import { MoonStar, Settings2, SunMedium } from 'lucide-react'
import toast from 'react-hot-toast'
import { userService } from './api'
import { useAuth } from './AuthContext'
import { useTheme } from './ThemeContext'
import styles from './AccountPage.module.css'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme, setTheme } = useTheme()

  const persistPreferences = async (nextPreferences) => {
    try {
      const { data } = await userService.atualizarPreferencias(nextPreferences)
      updateUser(data)
      setTheme(data.theme)
      toast.success('Preferências salvas')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível salvar as preferências')
    }
  }

  const togglePreference = (key) => {
    persistPreferences({
      theme,
      notificationsEnabled: key === 'notificationsEnabled' ? !user.notificationsEnabled : user.notificationsEnabled,
      compactMode: key === 'compactMode' ? !user.compactMode : user.compactMode,
      animationsEnabled: key === 'animationsEnabled' ? !user.animationsEnabled : user.animationsEnabled,
    })
  }

  const handleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    toggleTheme()
    persistPreferences({
      theme: nextTheme,
      notificationsEnabled: user.notificationsEnabled,
      compactMode: user.compactMode,
      animationsEnabled: user.animationsEnabled,
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Settings2 size={14} /> Configurações</span>
          <h1>Preferências do sistema</h1>
          <p>Escolha o tema, salve preferências gerais e personalize a experiência do painel.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Tema</h2>
              <p>Alterne entre modo claro e escuro com persistência local e na conta.</p>
            </div>

            <div className={styles.themeCard}>
              <div>
                <strong>{theme === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}</strong>
                <p>O tema acompanha sua preferência em novos acessos.</p>
              </div>
              <button className={styles.themeButton} onClick={handleTheme}>
                {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
                {theme === 'dark' ? 'Ativar claro' : 'Ativar escuro'}
              </button>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Preferências gerais</h2>
              <p>Escolha como o sistema deve se comportar no seu uso diário.</p>
            </div>

            <div className={styles.preferences}>
              <button className={styles.preferenceItem} onClick={() => togglePreference('notificationsEnabled')}>
                <div className={styles.preferenceInfo}>
                  <strong>Mensagens e avisos</strong>
                  <p>Mostra mensagens de sucesso e erro com mais destaque.</p>
                </div>
                <span className={`${styles.switch} ${user.notificationsEnabled ? styles.switchOn : ''}`}>
                  <span className={styles.switchThumb} />
                </span>
              </button>

              <button className={styles.preferenceItem} onClick={() => togglePreference('compactMode')}>
                <div className={styles.preferenceInfo}>
                  <strong>Modo compacto</strong>
                  <p>Reduz o espaçamento visual em cards e painéis.</p>
                </div>
                <span className={`${styles.switch} ${user.compactMode ? styles.switchOn : ''}`}>
                  <span className={styles.switchThumb} />
                </span>
              </button>

              <button className={styles.preferenceItem} onClick={() => togglePreference('animationsEnabled')}>
                <div className={styles.preferenceInfo}>
                  <strong>Animações</strong>
                  <p>Controla transições e microinterações da interface.</p>
                </div>
                <span className={`${styles.switch} ${user.animationsEnabled ? styles.switchOn : ''}`}>
                  <span className={styles.switchThumb} />
                </span>
              </button>
            </div>
          </section>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Resumo atual</h2>
            <p>Visão rápida das preferências em uso.</p>
          </div>

          <div className={styles.detailsList}>
            <div className={styles.detailsItem}>
              <span>Tema</span>
              <strong>{theme === 'dark' ? 'Escuro' : 'Claro'}</strong>
            </div>
            <div className={styles.detailsItem}>
              <span>Avisos</span>
              <strong>{user.notificationsEnabled ? 'Ativados' : 'Desativados'}</strong>
            </div>
            <div className={styles.detailsItem}>
              <span>Layout</span>
              <strong>{user.compactMode ? 'Compacto' : 'Confortável'}</strong>
            </div>
            <div className={styles.detailsItem}>
              <span>Animações</span>
              <strong>{user.animationsEnabled ? 'Ativas' : 'Reduzidas'}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
