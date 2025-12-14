<template>
  <div class="meals-container">
    <!-- Header -->
    <header class="meals-header">
      <h1>🍽️ Sledenje obrokom</h1>
      <button @click="goToDashboard" class="back-btn">← Nazaj na Dashboard</button>
    </header>

    <main class="meals-main">
      <!-- AddMealForm -->
      <AddMealForm @meal-added="loadMeals" />

      <!-- Današnji obroki -->
      <section class="card today-meals">
        <div class="card-header">
          <h2>📅 Današnji obroki</h2>
          <button @click="loadMeals" class="refresh-btn" :disabled="loading">
            🔄 {{ loading ? 'Nalagam...' : 'Osveži' }}
          </button>
        </div>

        <!-- Skupne kalorije -->
        <div class="summary">
          <div class="summary-item">
            <span class="label">Skupaj obrokov:</span>
            <span class="value">{{ meals.length }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Skupne kalorije:</span>
            <span class="value calories">{{ totalCalories }} kcal</span>
          </div>
        </div>

        <!-- Seznam obrokov -->
        <div v-if="loading" class="loading">⏳ Nalagam obroke...</div>

        <div v-else-if="meals.length === 0" class="no-meals">
          <p>Danes še nimaš nobenega obroka. Dodaj svoj prvi obrok zgoraj!</p>
        </div>

        <div v-else class="meals-list">
          <div v-for="meal in meals" :key="meal.id" class="meal-card">
            <div class="meal-header">
              <div class="meal-type">
                <span class="icon">{{ getMealIcon(meal.type) }}</span>
                <h3>{{ meal.type }}</h3>
              </div>
              <div class="meal-info">
                <span class="time">🕐 {{ formatTime(meal.date) }}</span>
                <span class="calories">🔥 {{ meal.totalCalories }} kcal</span>
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
              <span class="meal-date">📅 {{ formatDate(meal.date) }}</span>
              <button @click="deleteMeal(meal.id)" class="delete-btn" title="Izbriši obrok">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AddMealForm from '@/components/AddMealForm.vue'
import { mealApi } from '@/api'

export default {
  name: 'MealsView',
  components: { AddMealForm },
  data() {
    return {
      meals: [],
      loading: false,
      error: null,
    }
  },
  mounted() {
    this.loadMeals()
  },
  computed: {
    totalCalories() {
      return this.meals.reduce((sum, meal) => sum + meal.totalCalories, 0)
    },
  },
  methods: {
    goToDashboard() {
      this.$router.push('/dashboard')
    },

    async loadMeals() {
      this.loading = true
      this.error = null
      try {
        // Po potrebi prilagodi API pot
        console.log("v view bo klicau api")
        const res = await mealApi.get('/mealsToday')
        this.meals = res.data
        
      } catch (err) {
        console.error('Napaka pri nalaganju obrokov:', err)
        this.error = 'Napaka pri nalaganju obrokov'
        // Za testiranje - dodaj testne podatke če API še ne deluje
        this.meals = this.getMockMeals()
      } finally {
        this.loading = false
      }
    },

    async deleteMeal(mealId) {
      if (!confirm('Ste prepričani, da želite izbrisati ta obrok?')) {
        return
      }

      try {
        await mealApi.delete(`/api/meals/${mealId}`)
        this.loadMeals() // Osveži seznam
      } catch (err) {
        console.error('Napaka pri brisanju obroka:', err)
        alert('Napaka pri brisanju obroka')
      }
    },

    getMealIcon(type) {
      const icons = {
        Zajtrk: '🍳',
        Kosilo: '🍲',
        Večerja: '🍽️',
        Prigrizek: '🍎',
      }
      return icons[type] || '🍴'
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('sl-SI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },

    formatTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleTimeString('sl-SI', {
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    // Testni podatki (odstrani ko API deluje)
    // getMockMeals() {
    //   return [
    //     {
    //       id: 1,
    //       type: 'Zajtrk',
    //       date: new Date().toISOString(),
    //       totalCalories: 350,
    //       foods: [
    //         { name: 'Jajca', amount: 100, calories: 155 },
    //         { name: 'Avokado', amount: 50, calories: 80 },
    //         { name: 'Kruh', amount: 60, calories: 155 }
    //       ]
    //     },
    //     {
    //       id: 2,
    //       type: 'Kosilo',
    //       date: new Date().toISOString(),
    //       totalCalories: 550,
    //       foods: [
    //         { name: 'Piščanec', amount: 150, calories: 330 },
    //         { name: 'Riž', amount: 100, calories: 130 },
    //         { name: 'Brokoli', amount: 80, calories: 27 }
    //       ]
    //     }
    //   ]
    // }
  },
}
</script>

<style scoped>
.meals-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.meals-header {
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

.back-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #2980b9;
  transform: translateX(-2px);
}

.meals-main {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.today-meals {
  margin-top: 25px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
}

.card-header h2 {
  margin: 0;
  color: #2c3e50;
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
}

.refresh-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
  background: #27ae60;
}

.summary {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
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

.loading,
.no-meals {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 18px;
}

.no-meals {
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px dashed #ddd;
}

.meals-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.meal-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
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

.meal-type .icon {
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

.time,
.calories {
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

.meal-date {
  font-size: 14px;
  color: #7f8c8d;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background: #c0392b;
}

.error {
  color: #e74c3c;
  text-align: center;
  padding: 15px;
  background: #ffeaea;
  border-radius: 8px;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .meals-header {
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

  .summary {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
