import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles.css'
import axios from 'axios'

// ✅ Configure axios globally
axios.defaults.baseURL = 'https://priya2625.pythonanywhere.com' // change if backend runs elsewhere
axios.defaults.withCredentials = true // important for sending/receiving cookies (CSRF/session)

// Optionally attach axios to global properties
const app = createApp(App)
app.config.globalProperties.$axios = axios

app.use(store)
app.use(router)
app.mount('#app')
