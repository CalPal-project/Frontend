<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>📊 Nadzorna plošča</h1>
        <div class="user-info">
          <span class="welcome"
            >Pozdravljen, <strong>{{ currentUser }}</strong
            >!</span>
          <button @click="logout" class="logout-btn">🚪 Odjava</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Kratki pregled -->
      <div class="overview-section">
        <h2>🔄 Dnevni pregled</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #ffeaa7">🔥</div>
            <div class="stat-content">
              <h3>1,250 kcal</h3>
              <p>Današnje kalorije</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #a29bfe">🎯</div>
            <div class="stat-content">
              <h3>750 kcal</h3>
              <p>Preostalo do cilja</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fd79a8">⚖️</div>
            <div class="stat-content">
              <h3>65.2 kg</h3>
              <p>Trenutna teža</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Hitri gumbi za navigacijo -->
      <div class="navigation-section">
        <h2>🚀 Hitra navigacija</h2>
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

      <!-- Goal Manager komponenta (prikazana tukaj) -->
      <!-- <div v-if="showGoalManager" class="goal-manager-section">
        <h2>🎯 Upravljanje ciljev</h2>
        <GoalManager />
        <button @click="hideGoalManager" class="close-btn">✕ Zapri upravljanje ciljev</button>
      </div> -->

      <!-- Zadnja aktivnost -->
      <div class="activity-section">
        <div class="activity-header">
          <h2>📝 Zadnja aktivnost</h2>
          <button @click="loadLastMeal" class="refresh-btn-small" :disabled="loadingActivity">
            🔄 {{ loadingActivity ? 'Osvežujem...' : 'Osveži' }}
          </button>
        </div>
        
        <!-- Loading state -->
        <div v-if="loadingActivity" class="loading-activity">
          <p>⏳ Nalagam zadnji obrok...</p>
        </div>
        
        <!-- Error state -->
        <div v-else-if="activityError" class="error-activity">
          <p>❌ {{ activityError }}</p>
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
import { mealApi } from '@/api'

export default {
  name: 'DashboardView',
  components: {
    GoalManager,
  },
  data() {
    return {
      currentUser: 'Testni uporabnik',
      showGoalManager: false,
      lastMeal: null,
      loadingActivity: false,
      activityError: null
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },
  mounted() {
    // Preberi uporabnika iz localStorage
    const user = localStorage.getItem('currentUser')
    if (user) {
      this.currentUser = user
    }
    
    // Naloži zadnji obrok
    this.loadLastMeal()
  },
  methods: {
    logout() {
      localStorage.removeItem('currentUser')
      this.$router.push('/login')
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
        const response = await mealApi.get('/mealsToday')
        
        if (response.data && response.data.length > 0) {
          console.log("Dobili smo zadnji obrok:", response.data)
          const meals = response.data
          // Sortiraj po datumu (najnovejši prvi)
          meals.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
          this.lastMeal = meals[0]
          
          // Debug izpis za preverjanje podatkov
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
        // Tukaj lahko odpreš modal za urejanje ali navigiraš na urejanje
        this.$router.push({
          path: '/meals',
          query: { edit: this.lastMeal.id }
        })
      }
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Header */
.dashboard-header {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  color: #2c3e50;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome {
  font-size: 1.1rem;
  color: #555;
}

.logout-btn {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #c0392b;
}

/* Main content */
.dashboard-main {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
}

/* Sections */
.overview-section,
.navigation-section,
.goal-manager-section,
.activity-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

/* Activity section specific */
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.refresh-btn-small {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.refresh-btn-small:hover:not(:disabled) {
  background: #27ae60;
}

.refresh-btn-small:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.loading-activity,
.error-activity,
.no-activity {
  text-align: center;
  padding: 30px;
  color: #7f8c8d;
}

.error-activity {
  background: #ffeaea;
  border-radius: 10px;
  border: 1px solid #f5c6cb;
}

.retry-btn-small {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.retry-btn-small:hover {
  background: #c82333;
}

.empty-state {
  text-align: center;
  padding: 30px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.add-meal-btn {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.add-meal-btn:hover {
  background: #27ae60;
  transform: translateY(-2px);
}

/* Activity list */
.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  background: #f8f9fa;
  transition: all 0.3s;
}

.activity-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.activity-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.activity-type {
  font-weight: 600;
  color: #2c3e50;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-time {
  color: #7f8c8d;
  font-size: 14px;
  background: white;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid #ddd;
}

.activity-content {
  margin-bottom: 15px;
}

.meal-summary {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.calories-badge {
  background: rgb(232,244,253);
  color: rgb(52,152,219);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.foods-count {
  color: #7f8c8d;
  font-size: 14px;
}

/* All foods list */
.all-foods-list {
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.all-foods-title {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.foods-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.food-item-detailed {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-item-detailed:last-child {
  border-bottom: none;
}

.food-item-content {
  flex: 1;
}

.food-name-detailed {
  display: block;
  color: #2c3e50;
  margin-bottom: 5px;
}

.food-details-detailed {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7f8c8d;
  font-size: 14px;
}

.food-amount {
  background: #e8f4fd;
  color: #3498db;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.food-separator {
  color: #bdc3c7;
}

.food-calories {
  color: rgb(52,152,219);
  font-weight: 600;
}

.food-per100g {
  color: #95a5a6;
  font-size: 13px;
}

.food-id {
  font-size: 12px;
  color: #95a5a6;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  font-family: monospace;
}

.activity-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.edit-btn-small,
.add-more-btn {
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  justify-content: center;
}

.edit-btn-small {
  background: #3498db;
  color: white;
}

.edit-btn-small:hover {
  background: #2980b9;
}

.add-more-btn {
  background: #2ecc71;
  color: white;
}

.add-more-btn:hover {
  background: #27ae60;
}

.activity-footer {
  border-top: 1px solid #e0e0e0;
  padding-top: 15px;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-date {
  color: #7f8c8d;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.meal-id {
  color: #95a5a6;
  font-size: 12px;
  background: #f8f9fa;
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
}

/* Navigation buttons */
.nav-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s;
  text-align: left;
}

.meal-btn {
  background: linear-gradient(to right, #a1c4fd, #c2e9fb);
  color: #2c3e50;
}

.goal-btn {
  background: linear-gradient(to right, #ff9a9e, #fad0c4);
  color: #2c3e50;
}

.history-btn {
  background: linear-gradient(to right, #84fab0, #8fd3f4);
  color: #2c3e50;
}

.nav-btn:hover {
  transform: translateX(10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1.5rem;
  margin-right: 15px;
}

.btn-text {
  flex: 1;
}

.btn-arrow {
  font-size: 1.3rem;
  opacity: 0.7;
}

/* Goal manager section */
.close-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #7f8c8d;
}

/* Footer */
.dashboard-footer {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  margin-top: 40px;
  border-top: 1px solid #eee;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .activity-header-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .activity-time {
    align-self: flex-start;
  }
  
  .meal-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .activity-actions {
    flex-direction: column;
  }
  
  .activity-date {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .food-item-detailed {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .food-details-detailed {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .activity-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .nav-buttons {
    gap: 10px;
  }
  
  .nav-btn {
    padding: 15px;
  }
}
</style>