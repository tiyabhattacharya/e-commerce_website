<template>
  <div id="app">
    <nav-bar />
    <router-view />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    NavBar
  },
  async created() {
    try {
      // ensure server sets csrftoken cookie (safe GET) before any POSTs
      await axios.get('/api/')

      // restore authenticated user (if session cookie exists)
      await this.$store.dispatch('checkAuth')
    } catch (err) {
      console.error('App init error (CSRF/auth):', err)
      // non-fatal — app will still function; actions will handle failures
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>
