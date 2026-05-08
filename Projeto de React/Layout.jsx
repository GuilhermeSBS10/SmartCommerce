import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { LayoutDashboard, ArrowLeftRight, LogOut, TrendingUp, UserRound, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Até logo!')
    navigate('/login')
  }

  const initials = user?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'SC'

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <TrendingUp size={22} color="var(--accent)" />
          <span>Smart<strong>Commerce</strong></span>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/transacoes" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            <ArrowLeftRight size={18} />
            <span>Transações</span>
          </NavLink>
          <NavLink to="/perfil" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            <UserRound size={18} />
            <span>Perfil</span>
          </NavLink>
          <NavLink to="/configuracoes" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            <Settings2 size={18} />
            <span>Configurações</span>
          </NavLink>
        </nav>

        <div className={styles.userSection}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.nome}</span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
