<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🍎 Calorie Tracker</h1>
      <p class="subtitle">Spremljajte vaše kalorije in dosegajte cilje</p>
      
      <div class="login-form">
        <!-- Za zdaj samo preprosta prijava -->
        <div class="input-group">
          <label>Uporabniško ime</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="Vnesite uporabniško ime"
            class="login-input"
          >
        </div>
        
        <div class="input-group">
          <label>Geslo</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Vnesite geslo"
            class="login-input"
          >
        </div>
        
        <button @click="login" class="login-btn">
          🔐 Prijava
        </button>
        
        <p class="demo-note">
          <strong>Demo:</strong> Uporabite poljubno ime in geslo
        </p>
      </div>
      
      <div class="test-account">
        <h3>🔄 Hitri test:</h3>
        <button @click="useTestAccount" class="test-btn">
          Uporabi testni račun: <strong>ana123</strong>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login() {
      if (this.username.trim() === '' || this.password.trim() === '') {
        alert('Prosimo, vnesite uporabniško ime in geslo!')
        return
      }
      
      // Shrani v localStorage (za demo)
      localStorage.setItem('currentUser', this.username)
      
      // Preusmeri na dashboard
      this.$router.push('/dashboard')
    },
    
    useTestAccount() {
      this.username = 'ana123'
      this.password = 'demo123'
      
      // Samodejna prijava po 500ms
      setTimeout(() => {
        this.login()
      }, 500)
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.2rem;
}

.subtitle {
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.login-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: border 0.3s;
}

.login-input:focus {
  outline: none;
  border-color: #3498db;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(to right, #3498db, #2ecc71);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
}

.demo-note {
  margin-top: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
  font-size: 0.9rem;
}

.test-account {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px dashed #eee;
}

.test-account h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.test-btn {
  width: 100%;
  padding: 14px;
  background: #f8f9fa;
  border: 2px solid #3498db;
  border-radius: 10px;
  color: #3498db;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.test-btn:hover {
  background: #3498db;
  color: white;
}
</style>