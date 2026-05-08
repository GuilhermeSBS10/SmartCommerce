import { useEffect, useState } from 'react'

const TIPOS = ['RECEITA', 'DESPESA']
const CATEGORIAS = {
  RECEITA: ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Presente', 'Outros'],
  DESPESA: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Vestuário', 'Outros'],
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 17, 23, 0.72)',
  display: 'grid',
  placeItems: 'center',
  padding: '24px',
  zIndex: 50,
}

const cardStyle = {
  width: '100%',
  maxWidth: '520px',
  background: '#151925',
  border: '1px solid #283042',
  borderRadius: '20px',
  padding: '24px',
  color: '#e8edf5',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.35)',
}

const formStyle = {
  display: 'grid',
  gap: '16px',
}

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
}

const inputStyle = {
  width: '100%',
  marginTop: '6px',
  borderRadius: '12px',
  border: '1px solid #283042',
  background: '#0f1117',
  color: '#e8edf5',
  padding: '12px 14px',
}

const actionStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '8px',
}

export default function TransacaoModal({ transacao, onSave, onClose }) {
  const [form, setForm] = useState({
    descricao: '',
    tipo: 'DESPESA',
    categoria: 'Alimentação',
    valor: '',
    data: new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!transacao) return
    setForm({
      descricao: transacao.descricao || '',
      tipo: transacao.tipo || 'DESPESA',
      categoria: transacao.categoria || 'Alimentação',
      valor: transacao.valor ?? '',
      data: transacao.data ? String(transacao.data).slice(0, 10) : new Date().toISOString().slice(0, 10),
    })
  }, [transacao])

  useEffect(() => {
    const categorias = CATEGORIAS[form.tipo]
    if (!categorias.includes(form.categoria)) {
      setForm((current) => ({ ...current, categoria: categorias[0] }))
    }
  }, [form.tipo, form.categoria])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave(
        {
          ...form,
          valor: Number(form.valor),
        },
        transacao?.id,
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(event) => event.stopPropagation()}>
        <h2 style={{ margin: 0 }}>{transacao ? 'Editar transação' : 'Nova transação'}</h2>
        <p style={{ color: '#94a0b8', margin: '8px 0 20px' }}>
          Preencha os dados para salvar a transação.
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label>
            Descrição
            <input
              style={inputStyle}
              value={form.descricao}
              onChange={(event) => handleChange('descricao', event.target.value)}
              placeholder="Ex.: Supermercado"
              required
            />
          </label>

          <div style={rowStyle}>
            <label>
              Tipo
              <select
                style={inputStyle}
                value={form.tipo}
                onChange={(event) => handleChange('tipo', event.target.value)}
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </label>

            <label>
              Categoria
              <select
                style={inputStyle}
                value={form.categoria}
                onChange={(event) => handleChange('categoria', event.target.value)}
              >
                {CATEGORIAS[form.tipo].map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={rowStyle}>
            <label>
              Valor
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                value={form.valor}
                onChange={(event) => handleChange('valor', event.target.value)}
                required
              />
            </label>

            <label>
              Data
              <input
                style={inputStyle}
                type="date"
                value={form.data}
                onChange={(event) => handleChange('data', event.target.value)}
                required
              />
            </label>
          </div>

          <div style={actionStyle}>
            <button type="button" onClick={onClose} style={inputStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ ...inputStyle, background: '#00d09e', color: '#0f1117', fontWeight: 700 }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
