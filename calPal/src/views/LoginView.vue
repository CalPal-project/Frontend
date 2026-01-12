<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🍎 CalPal</h1>
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
          <span v-if="loading">Prijavljam...</span>
          <span v-else>Prijava</span>
        </button>

        <p class="register-link">
          Še nimate računa? 
          <a href="#" @click.prevent="showRegister = true">Registrirajte se tukaj</a>
        </p>
      </div>

      <!-- Registracijski obrazec -->
      <div v-if="showRegister" class="register-form">
        <h3>Registracija novega računa</h3>
        
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
            <span v-if="loading">Ustvarjam račun...</span>
            <span v-else>Registriraj</span>
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

        const responseText = await response.text()
        
        let data
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse response:', responseText)
          throw new Error(`Strežnik je vrnil neveljaven odgovor: ${response.status} ${response.statusText}`)
        }

        if (response.ok) {
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          localStorage.setItem('currentUser', JSON.stringify(data.user || { username: this.username }))
          
          if (data.expires_in) {
            localStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000))
          }
          
          this.successMessage = 'Uspešno prijavljeni!'
          console.log("uporabnik uspesno prijavljen")
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

      if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
        this.errorMessage = 'Prosimo, izpolnite vsa obvezna polja (zvezdica *)'
        return
      }

      if (this.registerData.password !== this.registerData.confirmPassword) {
        this.errorMessage = 'Gesli se ne ujemata!'
        return
      }


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

        const responseText = await response.text()
        let data
        try {
          data = JSON.parse(responseText)
        } catch {
          data = { detail: responseText }
        }

        if (response.status === 201) {

          this.successMessage = 'Račun uspešno ustvarjen!'

          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)
            localStorage.setItem('currentUser', JSON.stringify({ 
              username: data.username || this.registerData.username 
            }))
          }

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
  },
  mounted() {
    const token = localStorage.getItem('access_token')
    if (token) {
      const expiry = localStorage.getItem('token_expiry')
      if (expiry && Date.now() < parseInt(expiry)) {
        this.$router.push('/dashboard')
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('token_expiry')
        localStorage.removeItem('currentUser')
      }
    }

    console.log('Frontend je pripravljen za povezavo z backendom na http://localhost:8080')
  }
}
</script>

<style scoped>
  @import '@/style/LoginView.css';
</style>
