// src/api.js
// small centralized axios instance used by the app (imported as @/api)
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'   // backend URL
axios.defaults.withCredentials = true              // allow cookies (session/csrf)

// Optional: attach CSRF token header automatically if csrftoken cookie exists
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'))
  return match ? match.pop() : null
}
axios.interceptors.request.use(config => {
  const csrftoken = getCookie('csrftoken')
  if (csrftoken) config.headers['X-CSRFToken'] = csrftoken
  return config
}, err => Promise.reject(err))

export default axios
