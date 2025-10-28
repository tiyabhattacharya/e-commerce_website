<template>
  <div class="orders-page">
    <div class="container">
      <h1 class="page-title">My Orders</h1>
      
      <div v-if="orders.length === 0" class="empty-orders">
        <div class="empty-icon">📦</div>
        <h2>No orders yet</h2>
        <p>Start shopping to see your orders here!</p>
        <button @click="$router.push('/')" class="btn btn-primary">
          Start Shopping
        </button>
      </div>
      
      <div v-else class="orders-list">
        <div 
          v-for="order in orders" 
          :key="order.id"
          :class="['order-card', { cancelled: order.is_cancelled }]"
        >
          <div class="order-header">
            <div>
              <h3>Order #{{ order.id }}</h3>
              <p class="order-date">{{ formatDate(order.created_at) }}</p>
            </div>
            <span 
              :class="['order-status', { cancelled: order.is_cancelled }]"
            >
              {{ order.is_cancelled ? 'Cancelled' : 'Active' }}
            </span>
          </div>
          
          <div class="order-body">
            <img 
              :src="order.product.image_url" 
              :alt="order.product.title" 
              class="order-image"
            />
            
            <div class="order-details">
              <h4>{{ order.product.title }}</h4>
              <p class="order-category">{{ order.product.category }}</p>
              <div class="order-info">
                <span>Quantity: <strong>{{ order.quantity }}</strong></span>
                <span>Price: <strong>${{ formatPrice(order.price) }}</strong></span>
                <span>Payment: <strong>{{ order.payment_mode }}</strong></span>
              </div>
            </div>
            
            <div class="order-actions">
              <div class="order-total">
                <span>Total</span>
                <span class="total-amount">${{ formatPrice(order.price * order.quantity) }}</span>
              </div>
              
              <button 
                v-if="!order.is_cancelled"
                @click="cancelOrder(order.id)"
                class="btn btn-danger"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Orders',
  computed: {
    ...mapState(['orders'])
  },
  methods: {
    formatPrice(price) {
      const n = Number(price || 0)
      return isNaN(n) ? '0.00' : n.toFixed(2)
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    async cancelOrder(orderId) {
      if (!confirm('Are you sure you want to cancel this order?')) return
      try {
        await this.$store.dispatch('cancelOrder', orderId)
        alert('Order cancelled successfully!')
        // refresh orders
        await this.$store.dispatch('fetchOrders')
      } catch (err) {
        this.handleActionError(err, 'Error cancelling order. Please try again.')
      }
    },

    handleActionError(err, fallbackMessage = 'An error occurred. Please try again.') {
      const serverMsg = err?.response?.data?.error || err?.response?.data?.detail
      const status = err?.response?.status

      if (status === 401 || status === 403) {
        alert(serverMsg || 'Please login to continue.')
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }

      alert(serverMsg || fallbackMessage)
    }
  },
  async created() {
    // ensure auth/session is restored before fetching protected data
    try {
      await this.$store.dispatch('checkAuth')
    } catch (e) {
      // ignore — checkAuth clears user on failure
    }

    try {
      await this.$store.dispatch('fetchOrders')
    } catch (err) {
      console.error('Error fetching orders:', err)
    }
  }
}
</script>

<style scoped>
.orders-page {
  padding: 40px 0;
  min-height: calc(100vh - 70px);
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 30px;
}

.empty-orders {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-orders h2 {
  font-size: 28px;
  color: #1f2937;
  margin-bottom: 10px;
}

.empty-orders p {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 30px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
}

.order-card.cancelled {
  opacity: 0.7;
  background: #f9fafb;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.order-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 5px;
}

.order-date {
  font-size: 14px;
  color: #6b7280;
}

.order-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  background: #10b981;
  color: white;
}

.order-status.cancelled {
  background: #ef4444;
}

.order-body {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 24px;
  align-items: center;
}

.order-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.order-details h4 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.order-category {
  font-size: 14px;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 12px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 15px;
  color: #6b7280;
}

.order-info strong {
  color: #1f2937;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: flex-end;
}

.order-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.order-total span:first-child {
  font-size: 14px;
  color: #6b7280;
}

.total-amount {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

@media (max-width: 768px) {
  .order-body {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .order-image {
    margin: 0 auto;
  }
  
  .order-actions {
    align-items: center;
  }
  
  .order-total {
    align-items: center;
  }
}
</style>
