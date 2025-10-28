// frontend/src/api.js
import axios from 'axios'

const base = process.env.VUE_APP_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: base,
  withCredentials: true // keep this if you use session cookies
})

// optional: attach csrf token from cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'))
  return match ? match.pop() : null
}
api.interceptors.request.use(config => {
  const csrftoken = getCookie('csrftoken')
  if (csrftoken) config.headers['X-CSRFToken'] = csrftoken
  return config
})

export default api
