import { createStore } from 'vuex'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

// --- CSRF helper + interceptor ---
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'));
  return match ? match.pop() : null;
}

// Ensure each request includes X-CSRFToken if cookie exists
axios.interceptors.request.use(config => {
  const csrftoken = getCookie('csrftoken');
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  return config;
}, error => Promise.reject(error));
// --- end CSRF helper + interceptor ---

// Ensure CSRF cookie exists — call before unsafe requests
async function ensureCsrf() {
  try {
    const csrftoken = getCookie('csrftoken');
    if (!csrftoken) {
      // request a safe GET so server sets csrftoken cookie
      await axios.get('/api/');
    }
  } catch (err) {
    // swallow — request may fail in uncommon cases; caller will handle action errors
    // console.debug('ensureCsrf error', err)
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
    
    filteredProducts: state => {
      return state.products
    },
    
    cartTotal: state => {
      return state.cart.reduce((total, item) => {
        return total + (item.product.price * item.quantity)
      }, 0)
    },
    
    cartItemCount: state => {
      return state.cart.reduce((count, item) => count + item.quantity, 0)
    }
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
    async checkAuth({ commit }) {
      try {
        const response = await axios.get('/api/auth/user/')
        commit('SET_USER', response.data)
        return response.data
      } catch (error) {
        commit('CLEAR_USER')
        return null
      }
    },
    
    // call: dispatch('login', { mobile, otp, full_name })
    async login({ commit, dispatch }, { mobile, otp, full_name = 'User' }) {
      try {
        // ensure csrftoken cookie exists before POST
        await ensureCsrf()

        // backend expects mobile + otp (and optional full_name)
        const response = await axios.post('/api/auth/login/', {
          mobile,
          otp,
          full_name
        });

        commit('SET_USER', response.data.user);
        await dispatch('fetchCart');
        return response.data;
      } catch (error) {
        // bubble up error so Login.vue can show message / show OTP input
        throw error;
      }
    },

    async logout({ commit }) {
      try {
        // ensure csrftoken cookie exists before POST
        await ensureCsrf()
        await axios.post('/api/auth/logout/')
        commit('CLEAR_USER')
      } catch (error) {
        console.error('Logout error:', error)
      }
    },
    
    async fetchProducts({ commit, state }) {
      try {
        commit('SET_LOADING', true)
        const params = {}
        
        if (state.filters.category) params.category = state.filters.category
        if (state.filters.search) params.search = state.filters.search
        if (state.filters.minPrice) params.min_price = state.filters.minPrice
        if (state.filters.maxPrice) params.max_price = state.filters.maxPrice
        if (state.filters.isSale !== null) params.is_sale = state.filters.isSale
        
        const response = await axios.get('/api/products/', { params })
        commit('SET_PRODUCTS', response.data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchMostBought({ commit }) {
      try {
        const response = await axios.get('/api/products/most_bought/')
        commit('SET_MOST_BOUGHT', response.data)
      } catch (error) {
        console.error('Error fetching most bought products:', error)
      }
    },
    
    async fetchCart({ commit }) {
      try {
        const response = await axios.get('/api/cart/')
        commit('SET_CART', response.data)
      } catch (error) {
        console.error('Error fetching cart:', error)
      }
    },
    
    async addToCart({ dispatch }, productId) {
      try {
        // ensure csrftoken cookie exists before POST
        await ensureCsrf()
        await axios.post('/api/cart/', {
          product_id: productId,
          quantity: 1
        });
        await dispatch('fetchCart');
      } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }
    },

    async updateCartQuantity({ dispatch }, { id, action }) {
      try {
        // ensure csrftoken cookie exists before POST
        await ensureCsrf()
        await axios.post(`/api/cart/${id}/update_quantity/`, { action })
        await dispatch('fetchCart')
      } catch (error) {
        console.error('Error updating cart:', error)
      }
    },
    
    async removeFromCart({ dispatch }, id) {
      try {
        // ensure csrftoken cookie exists before DELETE
        await ensureCsrf()
        await axios.delete(`/api/cart/${id}/`)
        await dispatch('fetchCart')
      } catch (error) {
        console.error('Error removing from cart:', error)
      }
    },
    
    async fetchOrders({ commit }) {
      try {
        const response = await axios.get('/api/orders/')
        commit('SET_ORDERS', response.data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    },
    
    async placeOrder({ dispatch }, paymentMode) {
      try {
        // ensure csrftoken cookie exists before POST
        await ensureCsrf()
        await axios.post('/api/orders/', { payment_mode: paymentMode })
        await dispatch('fetchCart')
        await dispatch('fetchOrders')
        await dispatch('fetchMostBought')
      } catch (error) {
        console.error('Error placing order:', error)
        throw error
      }
    },
    
    async cancelOrder({ dispatch }, orderId) {
      try {
        // ensure csrftoken cookie exists before POST
        await ensureCsrf()
        await axios.post(`/api/orders/${orderId}/cancel/`)
        await dispatch('fetchOrders')
        await dispatch('fetchMostBought')
      } catch (error) {
        console.error('Error cancelling order:', error)
        throw error
      }
    }
  }
})
