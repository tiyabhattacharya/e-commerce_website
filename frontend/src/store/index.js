import { createStore } from 'vuex'
import axios from 'axios'

axios.defaults.baseURL = 'https://priya2625.pythonanywhere.com/api/'
axios.defaults.withCredentials = true

// --- CSRF helper + interceptor ---
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'))
  return match ? match.pop() : null
}

axios.interceptors.request.use(config => {
  const csrftoken = getCookie('csrftoken')
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken
  }
  return config
}, error => Promise.reject(error))

async function ensureCsrf() {
  try {
    const csrftoken = getCookie('csrftoken')
    if (!csrftoken) {
      // Safe GET to set CSRF cookie
      await axios.get('/')
    }
  } catch (err) {
    // ignore errors, caller handles
  }
}

export default createStore({
  state: {
    user: null,
    products: [],
    cart: [],
    orders: [],
    mostBought: [],
    filters: {
      category: '',
      minPrice: 0,
      maxPrice: 2000,
      search: '',
      isSale: null
    },
    loading: false
  },

  getters: {
    isAuthenticated: state => !!state.user,
    filteredProducts: state => state.products,
    cartTotal: state =>
      state.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0),
    cartItemCount: state =>
      state.cart.reduce((count, item) => count + item.quantity, 0)
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_PRODUCTS(state, products) {
      state.products = products
    },
    SET_CART(state, cart) {
      state.cart = cart
    },
    SET_ORDERS(state, orders) {
      state.orders = orders
    },
    SET_MOST_BOUGHT(state, products) {
      state.mostBought = products
    },
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    CLEAR_USER(state) {
      state.user = null
      state.cart = []
      state.orders = []
    }
  },

  actions: {
    async login({ commit, dispatch }, { mobile, otp, full_name }) {
      await ensureCsrf()
      const response = await axios.post('/auth/login/', { mobile, otp, full_name })
      commit('SET_USER', response.data.user)
      await dispatch('fetchCart')
      return response.data
    },

    async logout({ commit }) {
      try {
        await ensureCsrf()
        await axios.post('/auth/logout/')
        commit('CLEAR_USER')
      } catch (e) {
        console.error('Logout failed', e)
      }
    },

    async fetchProducts({ commit, state }) {
      commit('SET_LOADING', true)
      const params = {}
      if (state.filters.category) params.category = state.filters.category
      if (state.filters.search) params.search = state.filters.search
      if (state.filters.minPrice) params.min_price = state.filters.minPrice
      if (state.filters.maxPrice) params.max_price = state.filters.maxPrice
      if (state.filters.isSale !== null) params.is_sale = state.filters.isSale
      const response = await axios.get('/products/', { params })
      commit('SET_PRODUCTS', response.data)
      commit('SET_LOADING', false)
    },

    async fetchMostBought({ commit }) {
      const response = await axios.get('/products/most_bought/')
      commit('SET_MOST_BOUGHT', response.data)
    },

    async fetchCart({ commit }) {
      const response = await axios.get('/cart/')
      commit('SET_CART', response.data)
    },

    async addToCart({ dispatch }, productId) {
      await ensureCsrf()
      await axios.post('/cart/', { product_id: productId, quantity: 1 })
      await dispatch('fetchCart')
    },

    async updateCartQuantity({ dispatch }, { id, action }) {
      await ensureCsrf()
      await axios.post(`/cart/${id}/update_quantity/`, { action })
      await dispatch('fetchCart')
    },

    async removeFromCart({ dispatch }, id) {
      await ensureCsrf()
      await axios.delete(`/cart/${id}/`)
      await dispatch('fetchCart')
    },

    async fetchOrders({ commit }) {
      const response = await axios.get('/orders/')
      commit('SET_ORDERS', response.data)
    },

    async placeOrder({ dispatch }, paymentMode) {
      await ensureCsrf()
      await axios.post('/orders/', { payment_mode: paymentMode })
      await dispatch('fetchCart')
      await dispatch('fetchOrders')
      await dispatch('fetchMostBought')
    },

    async cancelOrder({ dispatch }, orderId) {
      await ensureCsrf()
      await axios.post(`/orders/${orderId}/cancel/`)
      await dispatch('fetchOrders')
      await dispatch('fetchMostBought')
    }
  }
})
