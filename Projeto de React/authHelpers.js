const SERVER_OFFLINE_MESSAGE = 'Não foi possível conectar ao servidor. Verifique se o backend está ligado.'

const fallbackMessages = {
  login: 'Cadastro não encontrado. Verifique os dados e tente novamente.',
  register: 'Não foi possível concluir o cadastro agora. Tente novamente em instantes.',
  recover: 'Cadastro não encontrado. Verifique os dados e tente novamente.',
}

export function getFriendlyAuthErrorMessage(mode, err) {
  const status = err.response?.status
  const message = err.response?.data?.message

  if (!err.response) return SERVER_OFFLINE_MESSAGE

  if (mode === 'login') {
    if (status === 401) return 'Email ou senha incorretos. Confira seus dados e tente novamente.'
    if (status === 400 && message) return message
    if (status === 404 || status === 503) return 'Cadastro não encontrado. Verifique os dados e tente novamente.'
  }

  if (mode === 'register') {
    if (status === 409) return message || 'Já existe uma conta com esses dados.'
    if (status === 400 && message) return message
    if (status === 503) return 'Não foi possível concluir o cadastro agora. Tente novamente em instantes.'
  }

  if (mode === 'recover') {
    if (status === 404 || status === 503) return 'Cadastro não encontrado. Verifique os dados e tente novamente.'
    if (message) return message
  }

  return message || fallbackMessages[mode] || 'Não foi possível concluir a operação.'
}
