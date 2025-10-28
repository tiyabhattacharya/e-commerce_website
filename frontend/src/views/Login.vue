<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Welcome Back!</h1>
          <p>Login to continue shopping</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">Mobile Number</label>
            <input 
              v-model="mobile"
              type="tel" 
              placeholder="Enter your mobile number"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input 
              v-model="fullName"
              type="text" 
              placeholder="Enter your full name"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">OTP</label>
            <input 
              v-model="otp"
              type="text" 
              placeholder="Enter OTP (123456)"
              class="form-input"
              required
            />
            <small class="form-hint">Demo OTP: 123456</small>
          </div>
          
          <button 
            type="submit" 
            :disabled="loading"
            class="btn btn-primary btn-block btn-large"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
          
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
        
        <div class="login-footer">
          <p>Demo Credentials:</p>
          <p><strong>Mobile:</strong> 9999999999</p>
          <p><strong>OTP:</strong> 123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      mobile: '',
      fullName: '',
      otp: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = ''

      try {
        // Dispatch login action that should call backend login_with_otp
        // Payload matches backend: { mobile, otp, full_name }
        const payload = {
          mobile: this.mobile,
          otp: this.otp,
          full_name: this.fullName || 'User'
        }

        await this.$store.dispatch('login', payload)

        // on successful login redirect to home (or desired route)
        this.$router.push('/')
      } catch (err) {
        // Prefer server-provided error message, fallback to generic text
        this.error = err?.response?.data?.error || err?.response?.data?.detail || 'Login failed. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.login-header p {
  color: #6b7280;
  font-size: 16px;
}

.login-form {
  margin-bottom: 30px;
}

.form-hint {
  display: block;
  margin-top: 8px;
  color: #6b7280;
  font-size: 13px;
}

.btn-large {
  padding: 15px;
  font-size: 16px;
  font-weight: 700;
  margin-top: 10px;
}

.error-message {
  color: #ef4444;
  text-align: center;
  margin-top: 15px;
  font-weight: 600;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.login-footer p {
  color: #6b7280;
  font-size: 14px;
  margin: 5px 0;
}

.login-footer strong {
  color: #1f2937;
}
</style>
