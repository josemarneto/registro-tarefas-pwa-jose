import apiClient from './config.js'

const authApi = {
  login(email, password) {
    return apiClient.post('/api/token', { email, password })
  },
}

export default authApi