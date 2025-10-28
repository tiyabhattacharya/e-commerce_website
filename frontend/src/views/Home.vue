<template>
  <div class="home">
    <div class="container">
      <!-- Most Bought Section -->
      <section v-if="mostBought.length" class="most-bought-section">
        <h2 class="section-title">🔥 Most Bought Products</h2>
        <div class="most-bought-grid">
          <div 
            v-for="product in mostBought.slice(0, 5)" 
            :key="product.id"
            class="most-bought-card"
          >
            <img :src="product.image_url" :alt="product.title" />
            <div class="most-bought-info">
              <h4>{{ product.title }}</h4>
              <p class="price">${{ formatPrice(product.price) }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <div class="main-content">
        <!-- Sidebar -->
        <aside class="sidebar">
          <filter-sidebar />
        </aside>
        
        <!-- Products Grid -->
        <main class="products-section">
          <h2 class="section-title">All Products</h2>
          
          <div v-if="loading" class="spinner"></div>
          
          <div v-else-if="products.length" class="products-grid">
            <product-card 
              v-for="product in products" 
              :key="product.id"
              :product="product"
            />
          </div>
          
          <div v-else class="no-products">
            <p>No products found matching your filters.</p>
            <button @click="resetFilters" class="btn btn-primary">Reset Filters</button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ProductCard from '@/components/ProductCard.vue'
import FilterSidebar from '@/components/FilterSidebar.vue'

export default {
  name: 'Home',
  components: {
    ProductCard,
    FilterSidebar
  },
  computed: {
    ...mapState(['products', 'mostBought', 'loading'])
  },
  methods: {
    formatPrice(price) {
      const n = Number(price || 0)
      return isNaN(n) ? '0.00' : n.toFixed(2)
    },
    resetFilters() {
      this.$store.commit('SET_FILTERS', {
        category: '',
        minPrice: 0,
        maxPrice: 2000,
        search: '',
        isSale: null
      })
      this.$store.dispatch('fetchProducts')
    }
  },
  async created() {
    // ensure session/auth is loaded before other actions (reduces race conditions)
    try {
      await this.$store.dispatch('checkAuth')
    } catch (e) {
      // checkAuth clears user on failure; ignore
    }

    try {
      // fetch products and most bought (parallel)
      await Promise.all([
        this.$store.dispatch('fetchProducts'),
        this.$store.dispatch('fetchMostBought')
      ])
    } catch (err) {
      console.error('Error loading products:', err)
    }
  }
}
</script>

<style scoped>
.home {
  padding: 40px 0;
  min-height: calc(100vh - 70px);
}

.most-bought-section {
  margin-bottom: 50px;
  background: linear-gradient(135deg, #141414 0%, #1f2a44 100%);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.most-bought-section .section-title {
  color: white;
  font-size: 32px;
  margin-bottom: 30px;
}

.most-bought-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.most-bought-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.most-bought-card:hover {
  transform: scale(1.05);
}

.most-bought-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.most-bought-info {
  padding: 15px;
}

.most-bought-info h4 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #1f2937;
}

.most-bought-info .price {
  font-size: 20px;
  font-weight: 700;
  color: #ec4899;
}

.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 30px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.no-products {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.no-products p {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 20px;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .most-bought-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
