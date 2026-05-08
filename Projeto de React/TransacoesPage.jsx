import { useState, useEffect, useCallback, useMemo } from 'react'
import { transacaoService } from './api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Search, Filter, X, TrendingUp, TrendingDown, FileText, RefreshCw, CalendarRange, AlertTriangle } from 'lucide-react'
import { format, endOfMonth, endOfYear, startOfMonth, startOfYear, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import TransacaoModal from './TransacaoModal'
import { formatCurrency } from './formatters'
import { openPrintWindow } from './printUtils'
import styles from './TransacoesPage.module.css'

const CATEGORIAS_DESPESA = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Vestuário', 'Outros']
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Presente', 'Outros']
const PERIODS = [
  { value: 'all', label: 'Tudo' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
  { value: 'custom', label: 'Personalizado' },
]

function toDateInput(date) {
  return date.toISOString().slice(0, 10)
}

function resolvePeriod(period) {
  const now = new Date()

  switch (period) {
    case '7d':
      return { inicio: toDateInput(subDays(now, 6)), fim: toDateInput(now) }
    case '30d':
      return { inicio: toDateInput(subDays(now, 29)), fim: toDateInput(now) }
    case 'month':
      return { inicio: toDateInput(startOfMonth(now)), fim: toDateInput(endOfMonth(now)) }
    case 'year':
      return { inicio: toDateInput(startOfYear(now)), fim: toDateInput(endOfYear(now)) }
    default:
      return { inicio: '', fim: '' }
  }
}

function exportTransactionsPdf(transacoes) {
  const rows = transacoes.length
    ? transacoes.map((transacao) => `
        <tr>
          <td>${transacao.descricao}</td>
          <td>${transacao.tipo}</td>
          <td>${transacao.categoria}</td>
          <td>${format(new Date(`${transacao.data}T00:00:00`), "dd/MM/yyyy", { locale: ptBR })}</td>
          <td>${formatCurrency(transacao.valor)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="5">Nenhuma transação para exportar</td></tr>'

  return Boolean(openPrintWindow('Transações', `
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
      h1 { margin-bottom: 8px; }
      p { color: #6b7280; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
      th { background: #f3f4f6; }
    </style>
    <h1>Relatório de transações</h1>
    <p>Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}</p>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th>Tipo</th>
          <th>Categoria</th>
          <th>Data</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `))
}

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransacao, setEditingTransacao] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filters, setFilters] = useState({ tipo: '', categoria: '', inicio: '', fim: '', periodo: 'all' })
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.tipo) params.tipo = filters.tipo
      if (filters.categoria) params.categoria = filters.categoria
      if (filters.inicio) params.inicio = filters.inicio
      if (filters.fim) params.fim = filters.fim
      const res = await transacaoService.listar(params)
      setTransacoes(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar transações')
      toast.error('Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }, [filters.categoria, filters.fim, filters.inicio, filters.tipo])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (data, id) => {
    try {
      if (id) {
        await transacaoService.atualizar(id, data)
        toast.success('Transação atualizada!')
      } else {
        await transacaoService.criar(data)
        toast.success('Transação criada!')
      }
      setModalOpen(false)
      setEditingTransacao(null)
      load()
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao salvar'
      toast.error(msg)
      throw err
    }
  }

  const handleDelete = async (id) => {
    try {
      await transacaoService.deletar(id)
      toast.success('Transação removida')
      setDeleteConfirm(null)
      load()
    } catch {
      toast.error('Erro ao remover')
    }
  }

  const openEdit = (transacao) => {
    setEditingTransacao(transacao)
    setModalOpen(true)
  }

  const openNew = () => {
    setEditingTransacao(null)
    setModalOpen(true)
  }

  const clearFilters = () => {
    setFilters({ tipo: '', categoria: '', inicio: '', fim: '', periodo: 'all' })
    setSearch('')
  }

  const applyPeriod = (period) => {
    const dates = resolvePeriod(period)
    setFilters((current) => ({
      ...current,
      periodo: period,
      inicio: dates.inicio,
      fim: dates.fim,
    }))
  }

  const filtered = useMemo(() => transacoes.filter((transacao) =>
    !search || transacao.descricao.toLowerCase().includes(search.toLowerCase())
  ), [search, transacoes])

  const totals = useMemo(() => filtered.reduce((acc, transacao) => {
    if (transacao.tipo === 'RECEITA') acc.receitas += Number(transacao.valor)
    else acc.despesas += Number(transacao.valor)
    return acc
  }, { receitas: 0, despesas: 0 }), [filtered])

  const saldo = totals.receitas - totals.despesas
  const hasFilters = filters.tipo || filters.categoria || filters.inicio || filters.fim || search || filters.periodo !== 'all'

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}><CalendarRange size={14} /> Gestão de lançamentos</span>
          <h1>Transações</h1>
          <p>{filtered.length} registro{filtered.length !== 1 ? 's' : ''} no recorte atual</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.filterBtn} onClick={() => setShowFilters((value) => !value)}>
            <Filter size={15} />
            Filtros
            {hasFilters && <span className={styles.filterDot} />}
          </button>
          <button className={styles.filterBtn} onClick={() => exportTransactionsPdf(filtered) || toast.error('Não foi possível exportar o PDF.')}>
            <FileText size={15} />
            Exportar PDF
          </button>
          <button className={styles.filterBtn} onClick={load}>
            <RefreshCw size={15} />
            Atualizar
          </button>
          <button className={styles.addBtn} onClick={openNew}>
            <Plus size={16} />
            Nova Transação
          </button>
        </div>
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span>Receitas no período</span>
          <strong className={styles.positive}>{formatCurrency(totals.receitas)}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Despesas no período</span>
          <strong className={styles.negative}>{formatCurrency(totals.despesas)}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Saldo do recorte</span>
          <strong className={saldo >= 0 ? styles.positive : styles.negative}>{formatCurrency(saldo)}</strong>
        </div>
      </div>

      <div className={styles.periodSwitch}>
        {PERIODS.map((period) => (
          <button
            key={period.value}
            className={`${styles.periodChip} ${filters.periodo === period.value ? styles.periodChipActive : ''}`}
            onClick={() => applyPeriod(period.value)}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>
        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            <X size={14} />
            Limpar filtros
          </button>
        )}
      </div>

      {showFilters && (
        <div className={styles.filtersBar}>
          <select value={filters.tipo} onChange={(event) => setFilters((current) => ({ ...current, tipo: event.target.value, categoria: '' }))}>
            <option value="">Todos os tipos</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>

          <select value={filters.categoria} onChange={(event) => setFilters((current) => ({ ...current, categoria: event.target.value }))}>
            <option value="">Todas as categorias</option>
            {(filters.tipo === 'RECEITA'
              ? CATEGORIAS_RECEITA
              : filters.tipo === 'DESPESA'
                ? CATEGORIAS_DESPESA
                : [...CATEGORIAS_RECEITA, ...CATEGORIAS_DESPESA]
            ).map((categoria) => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.inicio}
            onChange={(event) => setFilters((current) => ({ ...current, periodo: 'custom', inicio: event.target.value }))}
            placeholder="Data início"
          />

          <input
            type="date"
            value={filters.fim}
            onChange={(event) => setFilters((current) => ({ ...current, periodo: 'custom', fim: event.target.value }))}
            placeholder="Data fim"
          />
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingState}>
            <RefreshCw size={22} className={styles.spinning} />
            <p>Carregando suas transações...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <AlertTriangle size={22} />
            <h3>Não conseguimos carregar sua lista</h3>
            <p>{error}</p>
            <button className={styles.addBtn} onClick={load}>Tentar novamente</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhuma transação encontrada nesse recorte.</p>
            <button className={styles.addBtn} onClick={openNew}>
              <Plus size={15} />
              Adicionar primeira transação
            </button>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((transacao) => (
                  <tr key={transacao.id}>
                    <td className={styles.descCell}>{transacao.descricao}</td>
                    <td>
                      <span className={`${styles.badge} ${transacao.tipo === 'RECEITA' ? styles.badgeReceita : styles.badgeDespesa}`}>
                        {transacao.tipo === 'RECEITA'
                          ? <><TrendingUp size={11} /> Receita</>
                          : <><TrendingDown size={11} /> Despesa</>}
                      </span>
                    </td>
                    <td className={styles.catCell}>{transacao.categoria}</td>
                    <td className={styles.dateCell}>{format(new Date(`${transacao.data}T00:00:00`), 'dd MMM yyyy', { locale: ptBR })}</td>
                    <td className={`${styles.valueCell} ${transacao.tipo === 'RECEITA' ? styles.positive : styles.negative}`}>
                      {transacao.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(transacao.valor)}
                    </td>
                    <td className={styles.actionsCell}>
                      <button className={styles.editBtn} onClick={() => openEdit(transacao)} title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(transacao)} title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.mobileList}>
              {filtered.map((transacao) => (
                <div key={transacao.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardTop}>
                    <div>
                      <h3>{transacao.descricao}</h3>
                      <p>{transacao.categoria}</p>
                    </div>
                    <span className={`${styles.badge} ${transacao.tipo === 'RECEITA' ? styles.badgeReceita : styles.badgeDespesa}`}>
                      {transacao.tipo === 'RECEITA' ? 'Receita' : 'Despesa'}
                    </span>
                  </div>
                  <div className={styles.mobileMeta}>
                    <span>{format(new Date(`${transacao.data}T00:00:00`), 'dd MMM yyyy', { locale: ptBR })}</span>
                    <strong className={transacao.tipo === 'RECEITA' ? styles.positive : styles.negative}>
                      {transacao.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(transacao.valor)}
                    </strong>
                  </div>
                  <div className={styles.mobileActions}>
                    <button className={styles.editBtn} onClick={() => openEdit(transacao)} title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(transacao)} title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <TransacaoModal
          transacao={editingTransacao}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTransacao(null) }}
        />
      )}

      {deleteConfirm && (
        <div className={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmCard} onClick={(event) => event.stopPropagation()}>
            <h3>Confirmar exclusão</h3>
            <p>Deseja remover "<strong>{deleteConfirm.descricao}</strong>"?</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(deleteConfirm.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
