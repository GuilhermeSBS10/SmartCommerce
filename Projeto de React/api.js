import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Inject JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sc_token')
      localStorage.removeItem('sc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  recuperarSenha: (data) => api.post('/auth/recuperar-senha', data),
}

export const userService = {
  me: () => api.get('/usuarios/me'),
  atualizarPerfil: (data) => api.put('/usuarios/me/perfil', data),
  atualizarPreferencias: (data) => api.put('/usuarios/me/preferencias', data),
  atualizarSeguranca: (data) => api.put('/usuarios/me/seguranca', data),
}

export const transacaoService = {
  listar: (params) => api.get('/transacoes', { params }),
  criar: (data) => api.post('/transacoes', data),
  atualizar: (id, data) => api.put(`/transacoes/${id}`, data),
  deletar: (id) => api.delete(`/transacoes/${id}`),
  dashboard: (params) => api.get('/transacoes/dashboard', { params }),
}

export const metaService = {
  listar: () => api.get('/metas'),
  criar: (data) => api.post('/metas', data),
  atualizar: (id, data) => api.put(`/metas/${id}`, data),
  depositar: (id, valor) => api.patch(`/metas/${id}/depositar`, { valor }),
  retirar: (id, valor) => api.patch(`/metas/${id}/retirar`, { valor }),
  deletar: (id) => api.delete(`/metas/${id}`),
}

export default api
