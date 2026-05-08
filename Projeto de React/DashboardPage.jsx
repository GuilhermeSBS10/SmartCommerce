import { useEffect, useMemo, useState } from 'react'
import { transacaoService, metaService } from './api'
import { useAuth } from './AuthContext'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, RefreshCw, Target, FileText,
  PiggyBank, AlertTriangle, CalendarRange, Plus, Pencil, Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import GoalModal from './GoalModal'
import GoalBalanceModal from './GoalBalanceModal'
import { formatCurrency } from './formatters'
import { openPrintWindow } from './printUtils'
import styles from './DashboardPage.module.css'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const COLORS = ['#7c6af7', '#00d09e', '#ff4d6d', '#4d9fff', '#f5c542', '#ff8c42', '#a855f7', '#06b6d4']
const RANGE_OPTIONS = [
  { value: '6m', label: '6 meses' },
  { value: '12m', label: '12 meses' },
  { value: 'all', label: 'Tudo' },
]

function monthLabel(item) {
  return `${MONTHS[item.mes - 1]}/${item.ano}`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map((point, index) => (
        <p key={index} style={{ color: point.color, fontSize: 13, fontWeight: 600 }}>
          {point.name}: {formatCurrency(point.value)}
        </p>
      ))}
    </div>
  )
}

function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}><Target size={22} /></div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      {actionLabel && onAction && (
        <button className={styles.primaryAction} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('6m')
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [balanceModal, setBalanceModal] = useState({ open: false, mode: 'deposit', goal: null })

  const rangeParams = useMemo(() => {
    if (range === 'all') return {}
    const months = range === '12m' ? 11 : 5
    return {
      inicio: format(startOfMonth(subMonths(new Date(), months)), 'yyyy-MM-dd'),
      fim: format(new Date(), 'yyyy-MM-dd'),
    }
  }, [range])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await transacaoService.dashboard(rangeParams)
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível carregar o dashboard agora.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [range])

  const monthlyData = useMemo(() => {
    if (!data) return []

    const map = {}
    data.receitasPorMes?.forEach((item) => {
      const key = `${item.ano}-${item.mes}`
      if (!map[key]) map[key] = { name: monthLabel(item), receitas: 0, despesas: 0, order: item.ano * 100 + item.mes }
      map[key].receitas = Number(item.total)
    })
    data.despesasPorMes?.forEach((item) => {
      const key = `${item.ano}-${item.mes}`
      if (!map[key]) map[key] = { name: monthLabel(item), receitas: 0, despesas: 0, order: item.ano * 100 + item.mes }
      map[key].despesas = Number(item.total)
    })

    return Object.values(map).sort((a, b) => a.order - b.order)
  }, [data])

  const annualData = data?.comparativoAnual || []
  const despesasPie = data?.despesasPorCategoria?.map((item) => ({
    name: item.categoria,
    value: Number(item.total),
  })) || []
  const goals = data?.metas || []
  const insights = data?.insights

  const balanceSeries = monthlyData.map((item) => ({
    ...item,
    saldo: item.receitas - item.despesas,
  }))

  const annualTrend = annualData.length >= 2
    ? Number(annualData[annualData.length - 1].saldo) - Number(annualData[annualData.length - 2].saldo)
    : 0

  const exportDashboardPdf = () => {
    if (!data) return

    const goalsMarkup = goals.length
      ? goals.map((goal) => `
          <tr>
            <td>${goal.titulo}</td>
            <td>${goal.objetivo}</td>
            <td>${formatCurrency(goal.valorGuardado)}</td>
            <td>${formatCurrency(goal.valorAlvo)}</td>
            <td>${formatCurrency(goal.valorRestante)}</td>
            <td>${goal.percentual.toFixed(1)}%</td>
          </tr>
        `).join('')
      : '<tr><td colspan="6">Nenhum cofrinho cadastrado</td></tr>'

    const reportWindow = openPrintWindow('Resumo Financeiro', `
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
        h1, h2 { margin-bottom: 8px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
        .card { border: 1px solid #d1d5db; border-radius: 12px; padding: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
        th { background: #f3f4f6; }
        .muted { color: #6b7280; }
      </style>
      <h1>Resumo financeiro de ${user?.nome || 'Usuário'}</h1>
      <p class="muted">Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}</p>
      <div class="grid">
        <div class="card"><strong>Saldo total</strong><div>${formatCurrency(data.saldoTotal)}</div></div>
        <div class="card"><strong>Saldo disponível</strong><div>${formatCurrency(data.saldoDisponivel)}</div></div>
        <div class="card"><strong>Total guardado</strong><div>${formatCurrency(data.totalGuardadoCofrinhos)}</div></div>
        <div class="card"><strong>Receitas</strong><div>${formatCurrency(data.totalReceitas)}</div></div>
        <div class="card"><strong>Despesas</strong><div>${formatCurrency(data.totalDespesas)}</div></div>
      </div>
      <h2>Cofrinhos</h2>
      <table>
        <thead>
          <tr>
            <th>Cofrinho</th>
            <th>Objetivo</th>
            <th>Guardado</th>
            <th>Alvo</th>
            <th>Falta</th>
            <th>Progresso</th>
          </tr>
        </thead>
        <tbody>${goalsMarkup}</tbody>
      </table>
    `)

    if (!reportWindow) {
      toast.error('Não foi possível abrir a janela de exportação.')
    }
  }

  const handleSaveGoal = async (formData, id) => {
    try {
      if (id) {
        await metaService.atualizar(id, formData)
        toast.success('Cofrinho atualizado!')
      } else {
        await metaService.criar(formData)
        toast.success('Cofrinho criado!')
      }
      setGoalModalOpen(false)
      setEditingGoal(null)
      await load()
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao salvar cofrinho'
      toast.error(message)
      throw err
    }
  }

  const handleDeleteGoal = async (goalId) => {
    try {
      await metaService.deletar(goalId)
      toast.success('Cofrinho removido!')
      await load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao remover cofrinho')
    }
  }

  const handleBalanceChange = async (value) => {
    const currentGoal = balanceModal.goal
    if (!currentGoal) return

    try {
      if (balanceModal.mode === 'deposit') {
        await metaService.depositar(currentGoal.id, value)
        toast.success('Valor depositado no cofrinho!')
      } else {
        await metaService.retirar(currentGoal.id, value)
        toast.success('Valor retirado do cofrinho!')
      }
      setBalanceModal({ open: false, mode: 'deposit', goal: null })
      await load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível atualizar o cofrinho')
      throw err
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingShell}>
        <div className={styles.loadingPanel}>
          <RefreshCw size={28} className={styles.spinning} />
          <h2>Preparando seu painel</h2>
          <p>Estamos reunindo seus cofrinhos, comparativos e indicadores.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <AlertTriangle size={26} />
        <h2>Algo saiu do esperado</h2>
        <p>{error}</p>
        <button className={styles.primaryAction} onClick={load}>Tentar novamente</button>
      </div>
    )
  }

  const saldoTotal = Number(data?.saldoTotal || 0)
  const saldoDisponivel = Number(data?.saldoDisponivel || 0)
  const totalGuardado = Number(data?.totalGuardadoCofrinhos || 0)
  const receitas = Number(data?.totalReceitas || 0)
  const despesas = Number(data?.totalDespesas || 0)
  const latestYear = annualData[annualData.length - 1]
  const previousYear = annualData[annualData.length - 2]

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><CalendarRange size={14} /> Painel estratégico</span>
          <h1>Olá, {user?.nome?.split(' ')[0]}! Aqui está sua visão financeira.</h1>
          <p>Cofrinhos, tendências e comparativos para te ajudar a decidir melhor.</p>
        </div>
        <div className={styles.heroActions}>
          <div className={styles.rangeSwitch}>
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`${styles.rangeChip} ${range === option.value ? styles.rangeChipActive : ''}`}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button className={styles.secondaryAction} onClick={exportDashboardPdf}>
            <FileText size={15} />
            Exportar PDF
          </button>
          <button className={styles.secondaryAction} onClick={load}>
            <RefreshCw size={15} />
            Atualizar
          </button>
        </div>
      </div>

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.cardSaldo}`}>
          <div className={styles.cardIcon} style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
            <Wallet size={20} />
          </div>
          <div>
            <p className={styles.cardLabel}>Saldo Total</p>
            <p className={`${styles.cardValue} ${saldoTotal >= 0 ? styles.positive : styles.negative}`}>{formatCurrency(saldoTotal)}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
            <Wallet size={20} />
          </div>
          <div>
            <p className={styles.cardLabel}>Saldo Disponível</p>
            <p className={`${styles.cardValue} ${saldoDisponivel >= 0 ? styles.positive : styles.negative}`}>{formatCurrency(saldoDisponivel)}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
            <PiggyBank size={20} />
          </div>
          <div>
            <p className={styles.cardLabel}>Guardado em Cofrinhos</p>
            <p className={styles.cardValue}>{formatCurrency(totalGuardado)}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p className={styles.cardLabel}>Receitas</p>
            <p className={`${styles.cardValue} ${styles.positive}`}>{formatCurrency(receitas)}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <p className={styles.cardLabel}>Despesas</p>
            <p className={`${styles.cardValue} ${styles.negative}`}>{formatCurrency(despesas)}</p>
          </div>
        </div>
      </div>

      <div className={styles.insightsGrid}>
        <div className={styles.insightCard}>
          <span className={styles.insightLabel}>Volume de atividade</span>
          <strong>{insights?.totalTransacoes || 0} transações</strong>
          <p>Movimentações registradas na sua conta.</p>
        </div>
        <div className={styles.insightCard}>
          <span className={styles.insightLabel}>Categoria campeã</span>
          <strong>{insights?.categoriaCampea || 'Sem dados'}</strong>
          <p>Onde seu dinheiro mais saiu até agora.</p>
        </div>
        <div className={styles.insightCard}>
          <span className={styles.insightLabel}>Maior despesa</span>
          <strong>{formatCurrency(insights?.maiorDespesa)}</strong>
          <p>{insights?.descricaoMaiorDespesa || 'Sem despesas registradas'}</p>
        </div>
        <div className={styles.insightCard}>
          <span className={styles.insightLabel}>Ticket médio</span>
          <strong>{formatCurrency(insights?.ticketMedio)}</strong>
          <p>Valor médio de cada movimentação.</p>
        </div>
        <div className={styles.insightCard}>
          <span className={styles.insightLabel}>Saldo médio mensal</span>
          <strong>{formatCurrency(insights?.saldoMedioMensal)}</strong>
          <p>Média do saldo disponível considerando seus meses ativos.</p>
        </div>
        <div className={styles.insightCard}>
          <span className={styles.insightLabel}>Tendência anual</span>
          <strong className={annualTrend >= 0 ? styles.positive : styles.negative}>
            {annualTrend >= 0 ? '+' : ''}{formatCurrency(annualTrend)}
          </strong>
          <p>Diferença do saldo do último ano contra o anterior.</p>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartCard}>
          <h2>Evolução mensal</h2>
          <p className={styles.chartSub}>Receitas e despesas no período selecionado</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d09e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d09e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#00d09e" fill="url(#gradReceitas)" strokeWidth={2} />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ff4d6d" fill="url(#gradDespesas)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem histórico ainda" subtitle="Cadastre transações para visualizar a curva mensal." />
          )}
        </div>

        <div className={styles.chartCard}>
          <h2>Despesas por categoria</h2>
          <p className={styles.chartSub}>Passe o mouse para explorar cada categoria</p>
          {despesasPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={despesasPie} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
                  {despesasPie.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Nenhuma despesa registrada" subtitle="As categorias aparecem aqui assim que você começar a lançar gastos." />
          )}
        </div>
      </div>

      <div className={styles.chartsSecondary}>
        <div className={styles.chartCard}>
          <h2>Saldo por mês</h2>
          <p className={styles.chartSub}>Uma leitura rápida de meses fortes e meses apertados</p>
          {balanceSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={balanceSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="saldo" name="Saldo" radius={[6, 6, 0, 0]}>
                  {balanceSeries.map((entry, index) => (
                    <Cell key={index} fill={entry.saldo >= 0 ? '#00d09e' : '#ff4d6d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem saldo mensal ainda" subtitle="Seu comparativo mensal aparece depois das primeiras transações." />
          )}
        </div>

        <div className={styles.chartCard}>
          <h2>Comparativo anual</h2>
          <p className={styles.chartSub}>Receitas, despesas e saldo por ano</p>
          {annualData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="ano" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#00d09e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#ff4d6d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saldo" name="Saldo" fill="#4d9fff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem comparativo anual" subtitle="Quando houver meses registrados em um ou mais anos, o histórico aparece aqui." />
          )}
        </div>
      </div>

      <div className={styles.comparisonBand}>
        <div className={styles.compareCard}>
          <span>Ano atual</span>
          <strong>{latestYear ? latestYear.ano : '—'}</strong>
          <p>{latestYear ? formatCurrency(latestYear.saldo) : 'Sem dados suficientes'}</p>
        </div>
        <div className={styles.compareCard}>
          <span>Ano anterior</span>
          <strong>{previousYear ? previousYear.ano : '—'}</strong>
          <p>{previousYear ? formatCurrency(previousYear.saldo) : 'Sem base para comparar'}</p>
        </div>
        <div className={styles.compareCard}>
          <span>Variação</span>
          <strong className={annualTrend >= 0 ? styles.positive : styles.negative}>
            {annualTrend >= 0 ? '+' : ''}{formatCurrency(annualTrend)}
          </strong>
          <p>Diferença entre os dois últimos anos.</p>
        </div>
      </div>

      <div className={styles.goalsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Cofrinhos</h2>
            <p>Separe parte das suas economias em objetivos claros e acompanhe o progresso.</p>
          </div>
          <button className={styles.primaryAction} onClick={() => { setEditingGoal(null); setGoalModalOpen(true) }}>
            <Plus size={16} />
            Novo cofrinho
          </button>
        </div>

        {goals.length === 0 ? (
          <EmptyState
            title="Nenhum cofrinho criado"
            subtitle="Crie cofrinhos para separar dinheiro por objetivo, como viagem, reserva ou compras planejadas."
            actionLabel="Criar primeiro cofrinho"
            onAction={() => { setEditingGoal(null); setGoalModalOpen(true) }}
          />
        ) : (
          <div className={styles.goalsGrid}>
            {goals.map((goal) => (
              <div key={goal.id} className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <div>
                    <span className={styles.goalType}>Cofrinho</span>
                    <h3>{goal.titulo}</h3>
                    <p>{goal.objetivo} • até {format(new Date(`${goal.prazo}T00:00:00`), "dd MMM yyyy", { locale: ptBR })}</p>
                  </div>
                  <div className={styles.goalActions}>
                    <button className={`${styles.actionPill} ${styles.actionDeposit}`} onClick={() => setBalanceModal({ open: true, mode: 'deposit', goal })}>
                      Depositar
                    </button>
                    <button className={`${styles.actionPill} ${styles.actionWithdraw}`} onClick={() => setBalanceModal({ open: true, mode: 'withdraw', goal })}>
                      Retirar
                    </button>
                    <button className={`${styles.iconButton} ${styles.iconButtonSoft}`} onClick={() => { setEditingGoal(goal); setGoalModalOpen(true) }}>
                      <Pencil size={14} />
                    </button>
                    <button className={`${styles.iconButton} ${styles.iconButtonDanger}`} onClick={() => handleDeleteGoal(goal.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.goalMetrics}>
                  <strong>{formatCurrency(goal.valorGuardado)}</strong>
                  <span>de {formatCurrency(goal.valorAlvo)}</span>
                </div>
                <div className={styles.goalBar}>
                  <div className={styles.goalBarFill} style={{ width: `${Math.min(goal.percentual, 100)}%` }} />
                </div>
                <div className={styles.goalFooter}>
                  <span>{goal.percentual.toFixed(1)}% guardado • {formatCurrency(goal.valorMensalSugerido)}/mês</span>
                  <span>{goal.concluida ? 'Objetivo alcançado' : `Faltam ${formatCurrency(goal.valorRestante)}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {goalModalOpen && (
        <GoalModal
          goal={editingGoal}
          onSave={handleSaveGoal}
          onClose={() => {
            setGoalModalOpen(false)
            setEditingGoal(null)
          }}
        />
      )}

      {balanceModal.open && (
        <GoalBalanceModal
          mode={balanceModal.mode}
          goal={balanceModal.goal}
          onConfirm={handleBalanceChange}
          onClose={() => setBalanceModal({ open: false, mode: 'deposit', goal: null })}
        />
      )}
    </div>
  )
}
