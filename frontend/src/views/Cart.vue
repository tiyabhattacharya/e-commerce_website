<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">Shopping Cart</h1>
      
      <div v-if="cart.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <button @click="$router.push('/')" class="btn btn-primary">
          Continue Shopping
        </button>
      </div>
      
      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cart" 
            :key="item.id"
            class="cart-item"
          >
            <img :src="item.product.image_url" :alt="item.product.title" class="item-image" />
            
            <div class="item-details">
              <h3>{{ item.product.title }}</h3>
              <p class="item-category">{{ item.product.category }}</p>
              <p class="item-price">${{ formatPrice(item.product.price) }}</p>
            </div>
            
            <div class="item-actions">
              <div class="quantity-control">
                <button @click="decreaseQuantity(item.id)" class="qty-btn">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="increaseQuantity(item.id)" class="qty-btn">+</button>
              </div>
              
              <button @click="removeItem(item.id)" class="btn-remove">
                Remove
              </button>
            </div>
            
            <div class="item-total">
              ${{ formatPrice(item.product.price * item.quantity) }}
            </div>
          </div>
        </div>
        
        <div class="cart-summary">
          <h2>Order Summary</h2>
          
          <div class="summary-row">
            <span>Items ({{ cartItemCount }})</span>
            <span>${{ formatPrice(cartTotal) }}</span>
          </div>
          
          <div class="summary-row total">
            <span>Total</span>
            <span>${{ formatPrice(cartTotal) }}</span>
          </div>
          
          <div class="payment-options">
            <label class="radio-label">
              <input type="radio" v-model="paymentMode" value="COD" />
              <span>Cash on Delivery</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="paymentMode" value="ONLINE" />
              <span>Online Payment</span>
            </label>
          </div>
          <button 
            @click="checkout"
            :disabled="loading"
            class="btn btn-success btn-block btn-large"
          >
            {{ loading ? 'Processing...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'Cart',
  data() {
    return {
      loading: false,
      paymentMode: 'COD'
    }
  },
  computed: {
    ...mapState(['cart']),
    ...mapGetters(['cartTotal', 'cartItemCount'])
  },
  methods: {
    formatPrice(price) {
      const num = Number(price || 0)
      return isNaN(num) ? '0.00' : num.toFixed(2)
    },
    async increaseQuantity(id) {
      try {
        await this.$store.dispatch('updateCartQuantity', { id, action: 'increase' })
      } catch (err) {
        this.handleActionError(err)
      }
    },
    async decreaseQuantity(id) {
      try {
        await this.$store.dispatch('updateCartQuantity', { id, action: 'decrease' })
      } catch (err) {
        this.handleActionError(err)
      }
    },
    async removeItem(id) {
      if (!confirm('Remove this item from cart?')) return

      try {
        await this.$store.dispatch('removeFromCart', id)
      } catch (err) {
        this.handleActionError(err)
      }
    },
    async checkout() {
      this.loading = true
      try {
        await this.$store.dispatch('placeOrder', this.paymentMode)
        alert('Order placed successfully!')
        this.$router.push('/orders')
      } catch (error) {
        this.handleActionError(error, 'Error placing order. Please try again.')
      } finally {
        this.loading = false
      }
    },

    handleActionError(err, fallbackMessage = null) {
      // if server returned a JSON error, prefer that
      const serverMsg = err?.response?.data?.error || err?.response?.data?.detail
      const status = err?.response?.status

      if (status === 401 || status === 403) {
        // not authenticated — redirect to login to re-authenticate
        alert(serverMsg || 'Please login to continue.')
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }

      alert(serverMsg || fallbackMessage || 'An error occurred. Please try again.')
    }
  },
  async created() {
    // ensure store has auth/session restored before fetching cart (prevents auth-related 403)
    try {
      await this.$store.dispatch('checkAuth')
    } catch (e) {
      // no-op; checkAuth clears user on failure
    }
    // fetch cart items
    this.$store.dispatch('fetchCart')
  }
}
</script>

<style scoped>
.cart-page {
  padding: 40px 0;
  min-height: calc(100vh - 70px);
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 30px;
}

.empty-cart {
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

.empty-cart h2 {
  font-size: 28px;
  color: #1f2937;
  margin-bottom: 10px;
}

.empty-cart p {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 30px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: grid;
  grid-template-columns: 120px 1fr auto auto;
  gap: 20px;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.cart-item:hover {
  transform: translateY(-2px);
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.item-category {
  font-size: 14px;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 8px;
}

.item-price {
  font-size: 20px;
  font-weight: 700;
  color: #ec4899;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #6366f1;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  transition: background 0.3s ease;
}

.qty-btn:hover {
  background: #4f46e5;
}

.quantity {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  min-width: 30px;
  text-align: center;
}

.btn-remove {
  background: none;
  border: none;
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s ease;
}

.btn-remove:hover {
  color: #dc2626;
  text-decoration: underline;
}

.item-total {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  min-width: 100px;
  text-align: right;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 100px;
  height: fit-content;
}

.cart-summary h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 15px;
}

.summary-row.total {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
}

.payment-options {
  margin: 25px 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  transition: background 0.3s ease;
  border-radius: 6px;
}

.radio-label:hover {
  background: #e5e7eb;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn-large {
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .item-image {
    margin: 0 auto;
  }
  
  .item-total {
    text-align: center;
  }
}
</style>
