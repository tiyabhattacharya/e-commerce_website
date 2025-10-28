// frontend/src/api.js
import axios from 'axios'

// Use the environment variable VUE_APP_API_URL or default to the deployed backend API URL
const base = process.env.VUE_APP_API_URL || 'https://priya2625.pythonanywhere.com/api'

// Create an axios instance with the backend API base URL
const api = axios.create({
  baseURL: base,
  withCredentials: true // send cookies for CSRF authentication
})

// Utility function to get cookie by name (e.g. CSRF token)
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'))
  return match ? match.pop() : null
}

// Axios request interceptor to add CSRF token header from cookie
api.interceptors.request.use(config => {
  const csrftoken = getCookie('csrftoken')
  if (csrftoken) config.headers['X-CSRFToken'] = csrftoken
  return config
})

export default api
