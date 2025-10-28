import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Cart from '../views/Cart.vue'
import Orders from '../views/Orders.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// async guard: ensure store checks auth (session cookie) before redirecting
router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // attempt to refresh auth state if not already authenticated
    if (!store.getters.isAuthenticated) {
      try {
        await store.dispatch('checkAuth')
      } catch (e) {
        // ignore — checkAuth clears user on failure
      }
    }

    if (store.getters.isAuthenticated) {
      next()
    } else {
      // preserve intended destination to go back after successful login
      next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  } else {
    next()
  }
})

export default router
