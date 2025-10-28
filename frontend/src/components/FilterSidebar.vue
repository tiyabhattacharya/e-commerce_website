<template>
  <div class="filter-sidebar">
    <h2 class="filter-title">Filters</h2>
    
    <!-- Search -->
    <div class="filter-section">
      <label class="filter-label">Search</label>
      <input 
        v-model="localSearch"
        @input="debouncedSearch"
        type="text" 
        placeholder="Search products..." 
        class="form-input"
      />
    </div>
    
    <!-- Category Filter -->
    <div class="filter-section">
      <label class="filter-label">Category</label>
      <div class="category-list">
        <button 
          @click="selectCategory('')"
          :class="['category-btn', { active: !filters.category }]"
        >
          All
        </button>
        <button 
          v-for="cat in categories"
          :key="cat"
          @click="selectCategory(cat)"
          :class="['category-btn', { active: filters.category === cat }]"
        >
          {{ cat }}
        </button>
      </div>
    </div>
    
    <!-- Price Range -->
    <div class="filter-section">
      <label class="filter-label">
        Price Range: ${{ localMinPrice }} - ${{ localMaxPrice }}
      </label>
      <div class="price-inputs">
        <input 
          v-model.number="localMinPrice"
          @change="updatePriceRange"
          type="range" 
          min="0" 
          max="2000" 
          step="50"
          class="price-slider"
        />
        <input 
          v-model.number="localMaxPrice"
          @change="updatePriceRange"
          type="range" 
          min="0" 
          max="2000" 
          step="50"
          class="price-slider"
        />
      </div>
    </div>
    
    <!-- Sale Filter -->
    <div class="filter-section">
      <label class="filter-label">Special Offers</label>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="onSale"
            @change="updateSaleFilter"
          />
          <span>On Sale Only</span>
        </label>
      </div>
    </div>
    
    <!-- Reset Button -->
    <button @click="resetFilters" class="btn btn-danger btn-block">
      Reset Filters
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'FilterSidebar',
  data() {
    return {
      categories: ['Electronics', 'Fashion', 'Home', 'Sports'],
      localSearch: '',
      localMinPrice: 0,
      localMaxPrice: 2000,
      onSale: false,
      debounceTimer: null
    }
  },
  computed: {
    ...mapState(['filters'])
  },
  methods: {
    selectCategory(category) {
      this.$store.commit('SET_FILTERS', { category })
      this.$store.dispatch('fetchProducts')
    },
    
    debouncedSearch() {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.$store.commit('SET_FILTERS', { search: this.localSearch })
        this.$store.dispatch('fetchProducts')
      }, 500)
    },
    
    updatePriceRange() {
      if (this.localMinPrice > this.localMaxPrice) {
        const temp = this.localMinPrice
        this.localMinPrice = this.localMaxPrice
        this.localMaxPrice = temp
      }
      
      this.$store.commit('SET_FILTERS', {
        minPrice: this.localMinPrice,
        maxPrice: this.localMaxPrice
      })
      this.$store.dispatch('fetchProducts')
    },
    
    updateSaleFilter() {
      this.$store.commit('SET_FILTERS', { isSale: this.onSale ? true : null })
      this.$store.dispatch('fetchProducts')
    },
    
    resetFilters() {
      this.localSearch = ''
      this.localMinPrice = 0
      this.localMaxPrice = 2000
      this.onSale = false
      
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
  mounted() {
    this.localMinPrice = this.filters.minPrice
    this.localMaxPrice = this.filters.maxPrice
    this.localSearch = this.filters.search
    this.onSale = this.filters.isSale === true
  },
  watch: {
    // keep local UI in sync if filters change elsewhere (reset, route change, etc.)
    filters: {
      handler(newFilters) {
        this.localMinPrice = newFilters.minPrice ?? 0
        this.localMaxPrice = newFilters.maxPrice ?? 2000
        this.localSearch = newFilters.search ?? ''
        this.onSale = newFilters.isSale === true
      },
      deep: true
    }
  },
  beforeUnmount() {
    // clear any pending debounce timer when component unmounts
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }
}
</script>

<style scoped>
.filter-sidebar {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 100px;
}

.filter-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-btn {
  padding: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-align: left;
}

.category-btn:hover {
  border-color: #6366f1;
  background: #f5f3ff;
}

.category-btn.active {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  color: white;
  border-color: transparent;
}

.price-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-slider {
  width: 100%;
  height: 6px;
  border-radius: 5px;
  background: #e5e7eb;
  outline: none;
  cursor: pointer;
}

.price-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn-block {
  width: 100%;
  margin-top: 12px;
}
</style>
