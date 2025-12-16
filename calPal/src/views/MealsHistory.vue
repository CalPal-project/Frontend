<template>
  <div class="past-meals-container">
    <!-- Header -->
    <header class="past-meals-header">
      <h1>📊 Zgodovina obrokov</h1>
      <button @click="goToMeals" class="back-btn">Dodaj obrok</button>
      <button @click="goToDashboard" class="back-btn">← Nazaj na Dashboard</button>
    </header>

    <main class="past-meals-main">
      <!-- Filters Section -->
      <section class="card filters-section">
        <div class="card-header">
          <h2>🔍 Pregled preteklih dni</h2>
        </div>
        
        <div class="filters">
          <!-- Date Selection -->
          <div class="filter-group">
            <label for="datePicker">Izberi datum:</label>
            <input
              type="date"
              id="datePicker"
              v-model="selectedDate"
              @change="loadMealsForDate"
              :max="maxDate"
              class="date-picker"
            />
          </div>

          <!-- Date Navigation -->
          <div class="date-navigation">
            <button 
              @click="previousDay" 
              class="nav-btn"
              :disabled="loading"
            >
              ← Prejšnji dan
            </button>
            <span class="current-date">{{ formattedSelectedDate }}</span>
            <button 
              @click="nextDay" 
              class="nav-btn"
              :disabled="loading || isToday"
            >
              Naslednji dan →
            </button>
          </div>

          <!-- Quick Date Select -->
          <div class="quick-dates">
            <button 
              v-for="day in quickDays" 
              :key="day.value"
              @click="selectQuickDate(day.value)"
              class="quick-date-btn"
              :class="{ active: isQuickDateActive(day.value) }"
            >
              {{ day.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- Edit Modal -->
      <EditMealForm
        v-if="showEditForm"
        :show="showEditForm"
        :meal="editingMeal"
        @close="closeEditForm"
        @meal-updated="handleMealUpdated"
      />

      <!-- Meals for Selected Date -->
      <section class="card date-meals">
        <div class="card-header">
          <h2>🍽️ Obroki za {{ formattedSelectedDate }}</h2>
          <button @click="loadMealsForDate" class="refresh-btn" :disabled="loading">
            🔄 {{ loading ? 'Nalagam...' : 'Osveži' }}
          </button>
        </div>

        <!-- Summary -->
        <div class="summary">
          <div class="summary-item">
            <span class="label">Skupaj obrokov:</span>
            <span class="value">{{ meals.length }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Skupne kalorije:</span>
            <span class="value calories">{{ totalCalories }} kcal</span>
          </div>
          <div class="summary-item">
            <span class="label">Povprečje na obrok:</span>
            <span class="value">{{ averageCaloriesPerMeal }} kcal</span>
          </div>
        </div>

        <!-- Loading/Empty States -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>⏳ Nalagam obroke za {{ formattedSelectedDate }}...</p>
        </div>

        <div v-else-if="meals.length === 0" class="no-meals">
          <div class="empty-state">
            <div class="empty-icon">🍽️</div>
            <h3>Ni obrokov za ta dan</h3>
            <p>Za izbrani datum nimaš shranjenih nobenih obrokov.</p>
            <p>Izberi drug datum ali se vrni na današnje obroke.</p>
          </div>
        </div>

        <!-- Meals List -->
        <div v-else class="meals-list">
          <div v-for="meal in meals" :key="meal.id" class="meal-card">
            <div class="meal-header">
              <div class="meal-type">
                <h3>{{ getFullMealType(meal.mealType) }}</h3>
              </div>
              <div class="meal-info">
                <span class="time">🕐 {{ formatTime(meal.dateTime) }}</span>
                <span class="calories">🔥 {{ meal.calories }} kcal</span>
              </div>
            </div>

            <div class="meal-foods">
              <h4>Vsebuje:</h4>
              <ul>
                <li v-for="(food, index) in meal.foods" :key="index" class="food-item">
                  <span class="food-name">{{ food.foodName }}</span>
                  <span class="food-details">{{ food.amount }}g = {{ food.calories }} kcal</span>
                </li>
              </ul>
            </div>

            <div class="meal-footer">
              <div class="meal-actions">
                <button @click="openEditForm(meal)" class="update-btn" title="Uredi obrok">
                  Uredi
                </button>
                <button @click="deleteMeal(meal.id)" class="delete-btn" title="Izbriši obrok">
                  Izbriši
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="loadMealsForDate" class="retry-btn">Poskusi znova</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import EditMealForm from '@/components/EditMealForm.vue'
import { mealApi } from '@/api'

export default {
  name: 'PastMealsView',
  components: { EditMealForm },
  data() {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    return {
      selectedDate: todayStr,
      maxDate: todayStr,
      meals: [],
      loading: false,
      error: null,
      editingMeal: null,
      showEditForm: false,
      quickDays: [
        { label: 'Danes', value: 0 },
        { label: 'Včeraj', value: -1 },
        { label: 'Pred 2 dnevoma', value: -2 },
        { label: 'Pred 3 dnevoma', value: -3 },
        { label: 'Ta teden', value: 'week' }
      ]
    }
  },
  computed: {
    formattedSelectedDate() {
      const date = new Date(this.selectedDate)
      return date.toLocaleDateString('sl-SI', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    isToday() {
      const today = new Date().toISOString().split('T')[0]
      return this.selectedDate === today
    },
    totalCalories() {
      return this.meals.reduce((total, meal) => {
        return total + (meal.calories || 0)
      }, 0)
    },
    averageCaloriesPerMeal() {
      if (this.meals.length === 0) return 0
      return Math.round(this.totalCalories / this.meals.length)
    }
  },
  mounted() {
    this.loadMealsForDate()
  },
  methods: {
    goToMeals() {
      this.$router.push('/meals')
    },
    
    goToDashboard() {
      this.$router.push('/dashboard')
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
    
    openEditForm(meal) {
      console.log('Odpiram urejanje obroka:', meal)
      this.editingMeal = meal
      this.showEditForm = true
    },
    
    closeEditForm() {
      this.showEditForm = false
      this.editingMeal = null
    },
    
    handleMealUpdated() {
      this.loadMealsForDate()
      this.closeEditForm()
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
    
    async loadMealsForDate() {
      this.loading = true
      this.error = null
      
      try {
        // Pošljemo datum v formatu YYYY-MM-DD
        const response = await mealApi.get('/date', {
          params: { date: this.selectedDate }
        })
        
        this.meals = response.data || []
        console.log(`Naloženi obroki za ${this.selectedDate}:`, this.meals)
        
      } catch (err) {
        console.error('Napaka pri nalaganju obrokov:', err)
        this.error = 'Napaka pri nalaganju obrokov. Preverite povezavo.'
        this.meals = []
      } finally {
        this.loading = false
      }
    },
    
    previousDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() - 1)
      this.selectedDate = date.toISOString().split('T')[0]
      this.loadMealsForDate()
    },
    
    nextDay() {
      if (this.isToday) return
      
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() + 1)
      this.selectedDate = date.toISOString().split('T')[0]
      this.loadMealsForDate()
    },
    
    selectQuickDate(days) {
      if (days === 'week') {
        // Pridobi začetek tedna (ponedeljek)
        const today = new Date()
        const dayOfWeek = today.getDay()
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        const monday = new Date(today.setDate(diff))
        this.selectedDate = monday.toISOString().split('T')[0]
      } else {
        const date = new Date()
        date.setDate(date.getDate() + days)
        this.selectedDate = date.toISOString().split('T')[0]
      }
      this.loadMealsForDate()
    },
    
    isQuickDateActive(days) {
      if (days === 'week') {
        // Preveri če je izbran začetek tedna
        const selected = new Date(this.selectedDate)
        const today = new Date()
        const dayOfWeek = today.getDay()
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        const monday = new Date(today.setDate(diff))
        return selected.toISOString().split('T')[0] === monday.toISOString().split('T')[0]
      } else {
        const date = new Date()
        date.setDate(date.getDate() + days)
        return this.selectedDate === date.toISOString().split('T')[0]
      }
    },
    
    async deleteMeal(id) {
      if (!confirm('Ste prepričani, da želite izbrisati ta obrok?')) {
        return
      }
      
      try {
        await mealApi.delete(`/deleteMeal?id=${id}`)
        // Odstrani obrok iz seznama
        this.meals = this.meals.filter(meal => meal.id !== id)
      } catch (err) {
        console.error('Napaka pri brisanju obroka:', err)
        alert('Napaka pri brisanju obroka: ' + (err.response?.data?.message || err.message))
      }
    }
  }
}
</script>

<style scoped>
.past-meals-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.past-meals-header {
  background: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.past-meals-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
}

.back-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.back-btn:hover {
  background: #2980b9;
  transform: translateX(-2px);
}

.past-meals-main {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h2 {
  margin: 0;
  color: #2c3e50;
}

/* Filters Section */
.filters {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
}

.date-picker {
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
  cursor: pointer;
}

.date-picker:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.date-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 15px 0;
}

.current-date {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 200px;
  text-align: center;
}

.nav-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.nav-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.nav-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.quick-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.quick-date-btn {
  background: #ecf0f1;
  color: #2c3e50;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.quick-date-btn:hover {
  background: #d5dbdb;
}

.quick-date-btn.active {
  background: #3498db;
  color: white;
}

/* Summary */
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.value.calories {
  color: #e74c3c;
}

/* Loading State */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #7f8c8d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.no-meals {
  padding: 40px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px dashed #ddd;
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
  margin-bottom: 5px;
}

/* Meals List */
.meals-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.meal-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.meal-type {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meal-icon {
  font-size: 24px;
}

.meal-type h3 {
  margin: 0;
  font-size: 18px;
}

.meal-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.time, .calories {
  font-size: 14px;
  opacity: 0.9;
}

.meal-foods {
  padding: 20px;
  background: white;
}

.meal-foods h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.meal-foods ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.food-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.food-item:last-child {
  border-bottom: none;
}

.food-name {
  color: #2c3e50;
}

.food-details {
  color: #7f8c8d;
  font-size: 14px;
}

.meal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.meal-id {
  font-size: 12px;
  color: #95a5a6;
  font-family: monospace;
}

.meal-actions {
  display: flex;
  gap: 10px;
}

.update-btn, .delete-btn {
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.update-btn {
  background: #3498db;
  color: white;
}

.update-btn:hover {
  background: #2980b9;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}

/* Error Message */
.error {
  padding: 20px;
  background: #ffeaea;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  text-align: center;
  color: #721c24;
}

.error p {
  margin: 0 0 15px 0;
}

.retry-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #c82333;
}

.refresh-btn {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.refresh-btn:hover:not(:disabled) {
  background: #27ae60;
}

.refresh-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .past-meals-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .meal-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .meal-info {
    flex-direction: column;
    gap: 5px;
  }
  
  .date-navigation {
    flex-direction: column;
    gap: 10px;
  }
  
  .current-date {
    min-width: auto;
  }
  
  .meal-footer {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .meal-actions {
    width: 100%;
    justify-content: center;
  }
  
  .summary {
    grid-template-columns: 1fr;
  }
}
</style>