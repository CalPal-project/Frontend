<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>🍎 CalPal</h1>
        <div class="user-info">
          <span class="welcome"
            >Pozdravljen, <strong>{{ username }}</strong
            >!</span>
          <button @click="logoutButton" class="logout-btn">Odjava</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Glavni pozdrav s statistiko -->
      <div class="main-welcome-section">
        <div class="main-welcome-card">
          <div class="welcome-content-main">
            <h2> Dobrodošel nazaj, {{ username }}!</h2>
            <p class="motivation-text-large">{{ getMotivationMessage() }}</p>
          </div>
        </div>
      </div>

      <!-- Hitri gumbi za navigacijo -->
      <div class="navigation-section">
        <h2>Hitri dostop</h2>
        <div class="nav-buttons">
          <button @click="goToMealTracking" class="nav-btn meal-btn">
            <span class="btn-icon">🍽️</span>
            <span class="btn-text">Sledenje obrokom</span>
            <span class="btn-arrow">→</span>
          </button>
          <button @click="goToGoalManagement" class="nav-btn goal-btn">
            <span class="btn-icon">🎯</span>
            <span class="btn-text">Upravljanje ciljev</span>
            <span class="btn-arrow">→</span>
          </button>
          <button @click="goToMealHistory" class="nav-btn history-btn">
            <span class="btn-icon">📊</span>
            <span class="btn-text">Pregled prejšnjih obrokov</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>

      <!-- Zadnja aktivnost -->
      <div class="activity-section">
        <div class="activity-header">
          <h2>Zadnji dodan obrok</h2>
          <button @click="loadLastMeal" class="refresh-btn-small" :disabled="loadingActivity">
            🔄 {{ loadingActivity ? 'Osvežujem...' : 'Osveži' }}
          </button>
        </div>
        
        <!-- Loading state -->
        <div v-if="loadingActivity" class="loading-activity">
          <p>Nalagam zadnji obrok...</p>
        </div>
        
        <!-- Error state -->
        <div v-else-if="activityError" class="error-activity">
          <p>{{ activityError }}</p>
          <button @click="loadLastMeal" class="retry-btn-small">Poskusi znova</button>
        </div>
        
        <!-- Activity list with last meal -->
        <ul v-else-if="lastMeal" class="activity-list">
          <li class="activity-item">
            <div class="activity-header-inner">
              <span class="activity-type">{{ getFullMealType(lastMeal.mealType) }}</span>
              <span class="activity-time">{{ formatRelativeTime(lastMeal.dateTime) }}</span>
            </div>
            
            <div class="activity-content">
              <div class="meal-summary">
                <span class="calories-badge">{{ lastMeal.calories || 0 }} kcal</span>
                <span class="foods-count">{{ lastMeal.foods?.length || 0 }} hran{{ getFoodCountSuffix(lastMeal.foods?.length || 0) }}</span>
              </div>
              
              <!-- VSE HRANE - Popoln seznam -->
              <div v-if="lastMeal.foods && lastMeal.foods.length > 0" class="all-foods-list">
                <h4 class="all-foods-title">Vse hrane v obroku:</h4>
                <ul class="foods-list">
                  <li v-for="(food, index) in lastMeal.foods" :key="index" class="food-item-detailed">
                    <div class="food-item-content">
                      <span class="food-name-detailed">
                        <strong>{{ food.foodName || 'Neznana hrana' }}</strong>
                      </span>
                      <div class="food-details-detailed">
                        <span class="food-amount">{{ food.amount }}g</span>
                        <span class="food-separator">•</span>
                        <span class="food-calories">{{ food.calories || 0 }} kcal</span>
                        <span v-if="food.caloriesPer100g" class="food-per100g">
                          ({{ food.caloriesPer100g }} kcal/100g)
                        </span>
                      </div>
                    </div>
                    <div v-if="food.foodId" class="food-id">
                      ID: {{ food.foodId }}
                    </div>
                  </li>
                </ul>
              </div>
              
              <div class="activity-actions">
                <button @click="editLastMeal" class="edit-btn-small">
                  Uredi obrok
                </button>
                <button @click="goToMealTracking" class="add-more-btn">
                  Dodaj nov obrok
                </button>
              </div>
            </div>
            
            <div class="activity-footer">
              <span class="activity-date">
                📅 {{ formatDate(lastMeal.dateTime) }}
                🕐 {{ formatTime(lastMeal.dateTime) }}
              </span>
            </div>
          </li>
        </ul>
        
        <!-- Empty state -->
        <div v-else class="no-activity">
          <div class="empty-state">
            <div class="empty-icon">🍽️</div>
            <h3>Še nimaš dodanih obrokov</h3>
            <p>Začni s sledenjem svojim obrokom in doseganjem ciljev!</p>
            <button @click="$router.push('/meals')" class="add-meal-btn">
              + Dodaj prvi obrok
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="dashboard-footer">
      <p>Calorie Tracker App </p>
    </footer>
  </div>
</template>

<script>
import GoalManager from '@/views/GoalManagerView.vue'
import EditGoalForm from '@/components/EditGoalForm.vue';
import { mealApi, userApi } from '@/api'
import { auth } from '@/Authentication';

export default {
  name: 'DashboardView',
  components: {
    GoalManager,
  },
  data() {
    return {
      currentUser: null,
      showGoalManager: false,
      lastMeal: null,
      loadingActivity: false,
      activityError: null,
      userToken: null,
      userId: null,
      username: null,
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },
  async mounted() {
    await this.getCurrentUser()

    const user = localStorage.getItem('currentUser')
    if (user) {
      this.currentUser = user
    }

    try {
      const authData = await auth.isAuthenticated();
      
      if (!authData) {
        console.log("Authentication failed");
        this.$router.push('/login');
        return;
      }
      
      if (authData.user) {
        this.currentUser = authData.user;
      }
      
      await this.loadLastMeal();
      
    } catch(error) {
      console.error("Authentication failed:", error);
      this.$router.push('/login');
    }
  },
  methods: {
    async getCurrentUser() {
      try {
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
          console.error("No access token in localStorage.");
          return;
        }

        const response = await fetch("http://localhost:8081/api/auth/getUser", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });

        const data = await response.json();
        console.log("RAW RESPONSE:", data);

        if (!response.ok) {
          console.error("API error:", data);
          return;
        }

        this.username = data.user.username;
        this.userId = data.user.id;

        console.log("Current user:", this.username, "ID:", this.userId);

      } catch (error) {
        console.error("Napaka v getCurrentUser:", error);
      }
    },

    logoutButton() {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('token_expiry')
      localStorage.removeItem('currentUser')
      
      sessionStorage.clear()
      this.$router.push('/login')
      
      console.log('Uporabnik uspešno odjavljen')
    },

    hideGoalManager() {
      this.showGoalManager = false
    },

    goToMealTracking() {
      this.$router.push('/meals')
    },
    
    goToMealHistory(){
      this.$router.push('/mealshistory')
    },

    goToGoalManagement() {
      this.$router.push('/goalmanager')
    },
    
    async loadLastMeal() {
      this.loadingActivity = true
      this.activityError = null
      
      try {
        const response = await mealApi.get(`/mealsToday?userId=${this.userId}`)
        
        if (response.data && response.data.length > 0) {
          console.log("Dobili smo zadnji obrok:", response.data)
          const meals = response.data
          meals.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
          this.lastMeal = meals[0]
          
          console.log("Zadnji obrok podrobnosti:", {
            id: this.lastMeal.id,
            mealType: this.lastMeal.mealType,
            calories: this.lastMeal.calories,
            foodsCount: this.lastMeal.foods?.length,
            foods: this.lastMeal.foods
          })
        } else {
          this.lastMeal = null
        }
        
      } catch (error) {
        console.error('Napaka pri nalaganju zadnjega obroka:', error)
        this.activityError = 'Napaka pri nalaganju zadnjega obroka'
        this.lastMeal = null
      } finally {
        this.loadingActivity = false
      }
    },
    
    getFullMealType(c) {
      switch(c) {
        case 'Z': return 'Zajtrk'
        case 'K': return 'Kosilo'
        case 'V': return 'Večerja'
        case 'P': return 'Prigrizek'
        default: return 'Obrok'
      }
    },
    
    formatRelativeTime(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'pravkar'
      if (diffMins < 60) return `pred ${diffMins} min${diffMins === 1 ? 'uto' : 'utami'}`
      if (diffHours < 24) return `pred ${diffHours} ur${diffHours === 1 ? 'o' : 'ami'}`
      if (diffDays < 7) return `pred ${diffDays} dnev${diffDays === 1 ? 'om' : 'i'}`
      
      return this.formatDate(dateString)
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('sl-SI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    formatTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleTimeString('sl-SI', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getFoodCountSuffix(count) {
      if (count === 1) return 'a'
      if (count === 2) return 'i'
      if (count === 3 || count === 4) return 'e'
      return ''
    },
    
    editLastMeal() {
      if (this.lastMeal) {
        this.$router.push({
          path: '/meals',
          query: { edit: this.lastMeal.id }
        })
      }
    },

    getMotivationMessage() {
      const hours = new Date().getHours();
      if (hours < 12) return 'Lep dan za začetek zdravih navad! 🌞';
      if (hours < 18) return 'Ohrani zagon in nadaljuj z dobrimi izbirami! 💪';
      return 'Danes si dobro opravil! Nadaljuj tako jutri! 🌙';
    }
  }
}
</script>

<style scoped>
  @import '@/style/DashboardView.css';
  
</style>