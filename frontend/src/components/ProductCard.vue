<template>
  <div class="product-card">
    <div class="product-image-wrapper">
      <img :src="product.image_url" :alt="product.title" class="product-image" />
      <span v-if="product.is_sale" class="sale-badge">SALE</span>
    </div>
    
    <div class="product-info">
      <h3 class="product-title">{{ product.title }}</h3>
      <p class="product-category">{{ product.category }}</p>
      <p class="product-description">{{ truncatedDescription }}</p>
      
      <div class="product-footer">
        <span class="product-price">${{ formatPrice(product.price) }}</span>
        
        <button 
          v-if="isAuthenticated"
          @click="addToCart" 
          :disabled="loading"
          class="btn btn-primary btn-sm"
        >
          {{ loading ? 'Adding...' : 'Add to Cart' }}
        </button>
        <button v-else @click="$router.push('/login')" class="btn btn-outline btn-sm">
          Login to Buy
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated']),
    truncatedDescription() {
      return this.product.description.length > 80
        ? this.product.description.substring(0, 80) + '...'
        : this.product.description
    }
  },
  methods: {
    formatPrice(price) {
      return parseFloat(price).toFixed(2)
    },
    async addToCart() {
      this.loading = true
      try {
        await this.$store.dispatch('addToCart', this.product.id)
        // friendly confirmation
        alert('Added to cart!')
      } catch (error) {
        // Prefer server message if available
        const serverMsg = error?.response?.data?.error || error?.response?.data?.detail
        const status = error?.response?.status

        if (status === 401 || status === 403) {
          // Not authenticated / forbidden — redirect to login so user can authenticate
          // (you can show a toast/notification here instead if you have one)
          this.$router.push('/login')
        } else {
          alert(serverMsg || 'Error adding to cart')
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f3f4f6;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.sale-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #10b981;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.product-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.product-category {
  font-size: 13px;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.product-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.product-price {
  font-size: 24px;
  font-weight: 700;
  color: #ec4899;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}
</style>
