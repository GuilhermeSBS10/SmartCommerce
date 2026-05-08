import { useEffect, useState } from 'react'

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

export default function GoalModal({ goal, onSave, onClose }) {
  const [form, setForm] = useState({
    titulo: '',
    objetivo: '',
    valorAlvo: '',
    valorGuardado: '',
    prazo: new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!goal) return
    setForm({
      titulo: goal.titulo || '',
      objetivo: goal.objetivo || '',
      valorAlvo: goal.valorAlvo ?? '',
      valorGuardado: goal.valorGuardado ?? '',
      prazo: goal.prazo ? String(goal.prazo).slice(0, 10) : new Date().toISOString().slice(0, 10),
    })
  }, [goal])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave(
        {
          ...form,
          valorAlvo: Number(form.valorAlvo),
          valorGuardado: Number(form.valorGuardado),
        },
        goal?.id,
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(event) => event.stopPropagation()}>
        <h2 style={{ margin: 0 }}>{goal ? 'Editar cofrinho' : 'Novo cofrinho'}</h2>
        <p style={{ color: '#94a0b8', margin: '8px 0 20px' }}>
          Separe parte da sua economia para um objetivo e acompanhe quanto já foi guardado.
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label>
            Nome do cofrinho
            <input
              style={inputStyle}
              value={form.titulo}
              onChange={(event) => updateField('titulo', event.target.value)}
              placeholder="Ex.: Viagem de fim de ano"
              required
            />
          </label>

          <label>
            Objetivo
            <input
              style={inputStyle}
              value={form.objetivo}
              onChange={(event) => updateField('objetivo', event.target.value)}
              placeholder="Ex.: Juntar para passagens e hospedagem"
              required
            />
          </label>

          <div style={rowStyle}>
            <label>
              Quanto quer juntar
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                value={form.valorAlvo}
                onChange={(event) => updateField('valorAlvo', event.target.value)}
                required
              />
            </label>

            <label>
              Quanto já guardou
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                value={form.valorGuardado}
                onChange={(event) => updateField('valorGuardado', event.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Prazo
            <input
              style={inputStyle}
              type="date"
              value={form.prazo}
              onChange={(event) => updateField('prazo', event.target.value)}
              required
            />
          </label>

          <div style={actionStyle}>
            <button type="button" onClick={onClose} style={inputStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ ...inputStyle, background: '#00d09e', color: '#0f1117', fontWeight: 700 }}>
              {saving ? 'Salvando...' : 'Salvar cofrinho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
