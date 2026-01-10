<template>
  <div class="past-meals-container">
    <!-- Header -->
    <header class="past-meals-header">
      <h1>Zgodovina obrokov</h1>
      <button @click="goToMeals" class="back-btn">Dodaj obrok</button>
      <button @click="goToDashboard" class="back-btn">← Nazaj na Dashboard</button>
    </header>

    <main class="past-meals-main">
      <!-- Filters Section -->
      <section class="card filters-section">
        <div class="card-header">
          <h2>Pregled preteklih dni</h2>
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
          <h2>Obroki za {{ formattedSelectedDate }}</h2>
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
          <p>Nalagam obroke za {{ formattedSelectedDate }}...</p>
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
      ],
      userId: null,
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
  async mounted() {
    await this.getCurrentUser()
    this.loadMealsForDate()
  },
  methods: {
    async getCurrentUser() {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const response = await fetch("http://localhost:8081/api/auth/getUser", {
          method: "GET",
          headers: { "Authorization": `Bearer ${accessToken}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Napaka pri pridobivanju uporabnika');

        this.userId = data.user.id;
      } catch (err) {
        console.error('Napaka v getCurrentUser:', err);
      }
    },

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
    
    // handleMealUpdated() {
    //   this.loadMealsForDate()
    //   this.closeEditForm()
    // },

    async handleMealUpdated() {
      await this.loadMealsForDate()
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
          params: { date: this.selectedDate, userId: this.userId }

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
  @import '@/style/MealsHistory.css';
</style>
