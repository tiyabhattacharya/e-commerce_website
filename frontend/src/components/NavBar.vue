<template>
  <nav class="navbar">
    <div class="container nav-content">
      <div class="nav-brand" @click="$router.push('/')">
        <span class="brand-icon">🛒</span>
        <span class="brand-text">ShopHub</span>
      </div>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        
        <template v-if="isAuthenticated">
          <router-link to="/cart" class="nav-link cart-link">
            Cart
            <span v-if="cartItemCount" class="cart-badge">{{ cartItemCount }}</span>
          </router-link>
          <router-link to="/orders" class="nav-link">Orders</router-link>
          <button @click="handleLogout" class="btn btn-outline" :disabled="loading">
            {{ loading ? 'Logging out...' : 'Logout' }}
          </button>
        </template>
        
        <router-link v-else to="/login" class="btn btn-primary">Login</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'NavBar',
  data() {
    return {
      loading: false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'cartItemCount'])
  },
  methods: {
    async handleLogout() {
      this.loading = true
      try {
        // ensure csrftoken cookie exists before POST (prevents 403)
        await axios.get('/api/')
        await this.$store.dispatch('logout')
        this.$router.push('/login')
      } catch (err) {
        console.error('Logout error:', err)
        // user-visible fallback
        alert(err?.response?.data?.error || 'Logout failed. Try again.')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  /* background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%); */
  background: linear-gradient(135deg, #141414 0%, #1f2a44 100%);


  padding: 15px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.nav-brand:hover {
  transform: scale(1.05);
}

.brand-icon {
  font-size: 32px;
}

.brand-text {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.3);
}

.cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .nav-links {
    gap: 10px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .brand-text {
    font-size: 20px;
  }
}
</style>
