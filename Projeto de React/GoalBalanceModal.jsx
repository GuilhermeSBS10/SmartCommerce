import { useState } from 'react'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 17, 23, 0.72)',
  display: 'grid',
  placeItems: 'center',
  padding: '24px',
  zIndex: 55,
}

const cardStyle = {
  width: '100%',
  maxWidth: '420px',
  background: '#151925',
  border: '1px solid #283042',
  borderRadius: '20px',
  padding: '24px',
  color: '#e8edf5',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.35)',
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

export default function GoalBalanceModal({ mode, goal, onConfirm, onClose }) {
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onConfirm(Number(value))
    } finally {
      setSaving(false)
    }
  }

  const title = mode === 'deposit' ? 'Depositar no cofrinho' : 'Retirar do cofrinho'
  const helper = mode === 'deposit'
    ? 'Informe quanto você quer guardar neste objetivo.'
    : 'Informe quanto deseja retirar do valor já guardado.'

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(event) => event.stopPropagation()}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <p style={{ color: '#94a0b8', margin: '8px 0 16px' }}>
          {goal?.titulo} — {helper}
        </p>

        <form onSubmit={submit}>
          <label>
            Valor
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              required
              autoFocus
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={inputStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ ...inputStyle, background: mode === 'deposit' ? '#00d09e' : '#ffb020', color: '#0f1117', fontWeight: 700 }}>
              {saving ? 'Salvando...' : mode === 'deposit' ? 'Depositar' : 'Retirar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
