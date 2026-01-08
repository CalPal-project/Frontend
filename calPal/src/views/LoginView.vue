<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🍎 Calorie Tracker</h1>
      <p class="subtitle">Aplikacija za spremljanje kalorij in ciljev</p>

      <!-- Sporočila o napakah -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Sporočilo o uspehu -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div class="login-form">
        <div class="input-group">
          <label>Uporabniško ime</label>
          <input
            v-model="username"
            type="text"
            placeholder="Vnesite uporabniško ime"
            class="login-input"
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <label>Geslo</label>
          <input
            v-model="password"
            type="password"
            placeholder="Vnesite geslo"
            class="login-input"
            :disabled="loading"
          />
        </div>

        <button @click="login" class="login-btn" :disabled="loading">
          <span v-if="loading">⏳ Prijavljam...</span>
          <span v-else>Prijava</span>
        </button>

        <p class="register-link">
          Še nimate računa? 
          <a href="#" @click.prevent="showRegister = true">Registrirajte se tukaj</a>
        </p>
      </div>

      <!-- Registracijski obrazec -->
      <div v-if="showRegister" class="register-form">
        <h3>📝 Registracija novega računa</h3>
        
        <div class="input-group">
          <label>Uporabniško ime *</label>
          <input
            v-model="registerData.username"
            type="text"
            placeholder="Vnesite uporabniško ime"
            class="login-input"
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <label>Email *</label>
          <input
            v-model="registerData.email"
            type="email"
            placeholder="Vnesite email"
            class="login-input"
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <label>Ime</label>
          <input
            v-model="registerData.firstName"
            type="text"
            placeholder="Vnesite ime"
            class="login-input"
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <label>Priimek</label>
          <input
            v-model="registerData.lastName"
            type="text"
            placeholder="Vnesite priimek"
            class="login-input"
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <label>Geslo *</label>
          <input
            v-model="registerData.password"
            type="password"
            placeholder="Vnesite geslo"
            class="login-input"
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <label>Ponovite geslo *</label>
          <input
            v-model="registerData.confirmPassword"
            type="password"
            placeholder="Ponovite geslo"
            class="login-input"
            :disabled="loading"
          />
        </div>

        <div class="button-group">
          <button @click="register" class="register-btn" :disabled="loading">
            <span v-if="loading">⏳ Ustvarjam račun...</span>
            <span v-else>✅ Registriraj</span>
          </button>
          <button @click="cancelRegister" class="cancel-btn" :disabled="loading">
            ✕ Prekliči
          </button>
        </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <!-- Sporočilo o uspehu -->
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
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
      password: '',
      loading: false,
      errorMessage: '',
      successMessage: '',
      showRegister: false,
      registerData: {
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    async login() {
      if (this.username.trim() === '' || this.password.trim() === '') {
        this.errorMessage = 'Prosimo, vnesite uporabniško ime in geslo!'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        // Pošlji zahtevek na backend API
        const response = await fetch('http://localhost:8081/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        })

        // Preberi odgovor kot tekst (ne json, če pride do napake)
        const responseText = await response.text()
        
        let data
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse response:', responseText)
          throw new Error(`Strežnik je vrnil neveljaven odgovor: ${response.status} ${response.statusText}`)
        }

        if (response.ok) {
          // Shrani token v localStorage
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          localStorage.setItem('currentUser', JSON.stringify(data.user || { username: this.username }))
          
          if (data.expires_in) {
            localStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000))
          }
          
          this.successMessage = 'Uspešno prijavljeni!'
          console.log("uporabnik uspesno prijavljen")
          // Preusmeri na dashboard po kratki zamudi
          setTimeout(() => {
            this.$router.push('/dashboard')
          }, 1000)
        } else {
          this.errorMessage = data.error || data.message || 'Neveljavno uporabniško ime ali geslo'
        }
      } catch (error) {
        console.error('Login error:', error)
        this.errorMessage = error.message || 'Napaka pri prijavi'
      } finally {
        this.loading = false
      }
    },

    async register() {
      // Preveri vnos
      if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
        this.errorMessage = 'Prosimo, izpolnite vsa obvezna polja (zvezdica *)'
        return
      }

      if (this.registerData.password !== this.registerData.confirmPassword) {
        this.errorMessage = 'Gesli se ne ujemata!'
        return
      }

      // if (this.registerData.password.length < 6) {
      //   this.errorMessage = 'Geslo mora biti vsaj 6 znakov dolgo'
      //   return
      // }

      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const response = await fetch('http://localhost:8081/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.registerData.username,
            email: this.registerData.email,
            firstName: this.registerData.firstName,
            lastName: this.registerData.lastName,
            password: this.registerData.password
          })
        })

        // Preberi odgovor kot tekst
        const responseText = await response.text()
        let data
        try {
          data = JSON.parse(responseText)
        } catch {
          data = { detail: responseText }
        }

        if (response.status === 201) {
          // Uspešna registracija
          this.successMessage = 'Račun uspešno ustvarjen!'
          
          // Shrani token in informacije
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)
            localStorage.setItem('currentUser', JSON.stringify({ 
              username: data.username || this.registerData.username 
            }))
          }
          
          // Samodejna prijava po 2 sekundah
          setTimeout(() => {
            this.$router.push('/dashboard')
          }, 2000)
        } else if (response.status === 409) {
          this.errorMessage = 'Uporabnik s tem imenom že obstaja'
        } else {
          this.errorMessage = data.detail || data.error || data.status || 'Napaka pri registraciji'
        }
      } catch (error) {
        console.error('Registration error:', error)
        if (error.message.includes('Failed to fetch')) {
          this.errorMessage = 'Napaka pri povezavi s strežnikom. Preverite, ali je backend zagnan.'
        } else {
          this.errorMessage = error.message || 'Napaka pri registraciji'
        }
      } finally {
        this.loading = false
      }
    },

    cancelRegister() {
      this.showRegister = false
      this.registerData = {
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
      }
      this.errorMessage = ''
    },

    useTestAccount() {
      this.username = 'demo123'
      this.password = 'demo123'
      
      // Samodejna prijava po 500ms
      setTimeout(() => {
        this.login()
      }, 500)
    }
  },
  mounted() {
    // Preveri, če je uporabnik že prijavljen
    const token = localStorage.getItem('access_token')
    if (token) {
      // Preveri veljavnost tokena
      const expiry = localStorage.getItem('token_expiry')
      if (expiry && Date.now() < parseInt(expiry)) {
        // Token je še veljaven, preusmeri na dashboard
        this.$router.push('/dashboard')
      } else {
        // Token je potekel, počisti
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('token_expiry')
        localStorage.removeItem('currentUser')
      }
    }
    
    // Dodajmo tudi debug info v konzolo
    console.log('Frontend je pripravljen za povezavo z backendom na http://localhost:8080')
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
  max-width: 500px;
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

.error-message {
  background: #ffe6e6;
  color: #d32f2f;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #d32f2f;
  margin-top: 10px;
}

.success-message {
  background: #e6ffed;
  color: #2e7d32;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #2e7d32;
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

.input-group label::after {
  content: ' *';
  color: #e74c3c;
  opacity: 0.7;
}

.input-group label:not([for*="username"]):not([for*="email"]):not([for*="password"]):not([for*="confirmPassword"])::after {
  content: '';
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

.login-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.login-btn, .register-btn, .cancel-btn {
  width: 100%;
  padding: 16px;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  margin-top: 10px;
}

.login-btn {
  background: linear-gradient(to right, #3498db, #2ecc71);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
}

.register-btn {
  background: linear-gradient(to right, #27ae60, #2ecc71);
}

.cancel-btn {
  background: #95a5a6;
  margin-top: 10px;
}

.login-btn:disabled, .register-btn:disabled, .cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 10px;
}

.button-group button {
  flex: 1;
}

.register-link {
  margin-top: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.register-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

.register-form {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px dashed #eee;
}

.register-form h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.test-btn:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>