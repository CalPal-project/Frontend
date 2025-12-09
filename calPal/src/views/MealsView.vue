<template>
  <div class="meals-container">
    <!-- Header -->
    <header class="meals-header">
      <div class="header-content">
        <h1>🍽️ Sledenje obrokom</h1>
        <div class="header-actions">
          <button @click="goToDashboard" class="back-btn">← Nazaj na Dashboard</button>
          <span class="user-info">Uporabnik: {{ currentUser }}</span>
        </div>
      </div>
    </header>
    
    <!-- Main content -->
    <main class="meals-main">
      <!-- Danes -->
      <div class="today-section">
        <h2>📅 Današnji obroki</h2>
        <div class="date-display">
          {{ todayDate }}
        </div>
        
        <!-- Kalorijski meter -->
        <div class="calorie-meter">
          <div class="meter-header">
            <h3>🔥 Kalorije: {{ totalCalories }} / {{ dailyGoal }} kcal</h3>
            <span class="meter-percentage">{{ caloriePercentage }}%</span>
          </div>
          <div class="meter-bar">
            <div 
              class="meter-fill" 
              :style="{ width: caloriePercentage + '%' }"
              :class="{ 'over-limit': caloriePercentage > 100 }"
            ></div>
          </div>
          <div class="meter-labels">
            <span>0</span>
            <span>{{ dailyGoal }} kcal</span>
          </div>
        </div>
        
        <!-- Seznam obrokov -->
        <div class="meals-list">
          <h3>Vaši obroki danes:</h3>
          
          <div v-if="meals.length === 0" class="no-meals">
            <p>🎉 Danes še niste vnesli nobenega obroka!</p>
            <button @click="addSampleMeal" class="add-sample-btn">
              + Dodaj testni obrok
            </button>
          </div>
          
          <div v-else class="meals-items">
            <div v-for="(meal, index) in meals" :key="index" class="meal-item">
              <div class="meal-info">
                <span class="meal-time">{{ meal.time }}</span>
                <span class="meal-name">{{ meal.name }}</span>
                <span class="meal-calories">{{ meal.calories }} kcal</span>
              </div>
              <button @click="removeMeal(index)" class="remove-meal-btn">🗑️</button>
            </div>
          </div>
        </div>
        
        <!-- Dodaj nov obrok -->
        <div class="add-meal-section">
          <h3>➕ Dodaj nov obrok</h3>
          <div class="add-meal-form">
            <input 
              v-model="newMeal.name" 
              type="text" 
              placeholder="Ime obroka (npr. 'Zajtrk: ovsenka')"
              class="meal-input"
            >
            <input 
              v-model="newMeal.calories" 
              type="number" 
              placeholder="Kalorije (kcal)"
              class="meal-input calories-input"
            >
            <button @click="addMeal" class="add-btn">
              Dodaj obrok
            </button>
          </div>
          
          <div class="quick-actions">
            <button 
              v-for="quickMeal in quickMeals" 
              :key="quickMeal.name"
              @click="addQuickMeal(quickMeal)"
              class="quick-btn"
            >
              {{ quickMeal.emoji }} {{ quickMeal.name }} ({{ quickMeal.calories }} kcal)
            </button>
          </div>
        </div>
      </div>
      
      <!-- Statistike -->
      <div class="stats-section">
        <h2>📈 Statistike</h2>
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-value">{{ meals.length }}</div>
            <div class="stat-label">Obrokov danes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ averageCalories }}</div>
            <div class="stat-label">Povprečje/obrok</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ remainingCalories }}</div>
            <div class="stat-label">Preostalo kcal</div>
          </div>
        </div>
        
        <div class="macros">
          <h3>🍎 Makrohranila</h3>
          <div class="macro-item">
            <span class="macro-name">Beljakovine</span>
            <div class="macro-bar">
              <div class="macro-fill protein"></div>
            </div>
            <span class="macro-value">65g</span>
          </div>
          <div class="macro-item">
            <span class="macro-name">Ogljikovi hidrati</span>
            <div class="macro-bar">
              <div class="macro-fill carbs"></div>
            </div>
            <span class="macro-value">180g</span>
          </div>
          <div class="macro-item">
            <span class="macro-name">Maščobe</span>
            <div class="macro-bar">
              <div class="macro-fill fats"></div>
            </div>
            <span class="macro-value">45g</span>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="meals-footer">
      <button @click="resetDay" class="reset-btn">🔄 Ponastavi dan</button>
      <p>Calorie Tracker • Sledenje obrokom</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'MealsView',
  data() {
    return {
      currentUser: 'Testni uporabnik',
      dailyGoal: 2000,
      meals: [
        { name: 'Zajtrk: Ovsenka z jagodami', time: '08:30', calories: 350 },
        { name: 'Kosilo: Piščanec z rižem', time: '12:45', calories: 550 },
        { name: 'Prigrizek: Jabolko', time: '15:30', calories: 95 }
      ],
      newMeal: {
        name: '',
        calories: ''
      },
      quickMeals: [
        { emoji: '🥗', name: 'Solata', calories: 150 },
        { emoji: '🥪', name: 'Sendvič', calories: 300 },
        { emoji: '🍎', name: 'Jabolko', calories: 95 },
        { emoji: '🥤', name: 'Sok', calories: 120 }
      ]
    }
  },
  computed: {
    todayDate() {
      const now = new Date()
      return now.toLocaleDateString('sl-SI', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    },
    
    totalCalories() {
      return this.meals.reduce((sum, meal) => sum + parseInt(meal.calories), 0)
    },
    
    caloriePercentage() {
      return Math.min(Math.round((this.totalCalories / this.dailyGoal) * 100), 100)
    },
    
    averageCalories() {
      if (this.meals.length === 0) return 0
      return Math.round(this.totalCalories / this.meals.length)
    },
    
    remainingCalories() {
      return Math.max(this.dailyGoal - this.totalCalories, 0)
    }
  },
  mounted() {
    const user = localStorage.getItem('currentUser')
    if (user) {
      this.currentUser = user
    }
    
    // Dodaj čas za nove obroke
    this.updateMealTimes()
  },
  methods: {
    goToDashboard() {
      this.$router.push('/dashboard')
    },
    
    addMeal() {
      if (!this.newMeal.name.trim() || !this.newMeal.calories) {
        alert('Prosimo, vnesite ime in kalorije obroka!')
        return
      }
      
      const calories = parseInt(this.newMeal.calories)
      if (isNaN(calories) || calories <= 0) {
        alert('Prosimo, vnesite veljavno število kalorij!')
        return
      }
      
      const now = new Date()
      const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0')
      
      this.meals.push({
        name: this.newMeal.name,
        time: timeString,
        calories: calories
      })
      
      // Reset forma
      this.newMeal.name = ''
      this.newMeal.calories = ''
    },
    
    addQuickMeal(quickMeal) {
      const now = new Date()
      const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0')
      
      this.meals.push({
        name: `${quickMeal.emoji} ${quickMeal.name}`,
        time: timeString,
        calories: quickMeal.calories
      })
    },
    
    addSampleMeal() {
      const sampleMeals = [
        { name: 'Jogurt z oreščki', calories: 250 },
        { name: 'Piščančji burger', calories: 450 },
        { name: 'Tortilja s šunko', calories: 320 }
      ]
      
      const randomMeal = sampleMeals[Math.floor(Math.random() * sampleMeals.length)]
      const now = new Date()
      const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0')
      
      this.meals.push({
        name: randomMeal.name,
        time: timeString,
        calories: randomMeal.calories
      })
    },
    
    removeMeal(index) {
      this.meals.splice(index, 1)
    },
    
    updateMealTimes() {
      // Samo za demo - doda čas trenutnim obrokom
      const times = ['08:30', '12:45', '15:30']
      this.meals.forEach((meal, index) => {
        if (!meal.time && times[index]) {
          meal.time = times[index]
        }
      })
    },
    
    resetDay() {
      if (confirm('Ali ste prepričani, da želite ponastaviti današnje obroke?')) {
        this.meals = []
      }
    }
  }
}
</script>

<style scoped>
.meals-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
}

/* Header */
.meals-header {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #2980b9;
}

.user-info {
  color: #7f8c8d;
  font-weight: 500;
}

/* Main content */
.meals-main {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

/* Today section */
.today-section,
.stats-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.date-display {
  font-size: 1.2rem;
  color: #3498db;
  margin-bottom: 25px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

/* Calorie meter */
.calorie-meter {
  margin-bottom: 30px;
}

.meter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.meter-header h3 {
  margin: 0;
  color: #2c3e50;
}

.meter-percentage {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2ecc71;
}

.meter-bar {
  height: 25px;
  background: #ecf0f1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(to right, #2ecc71, #3498db);
  border-radius: 12px;
  transition: width 0.5s ease;
}

.meter-fill.over-limit {
  background: linear-gradient(to right, #e74c3c, #f39c12);
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Meals list */
.meals-list {
  margin-bottom: 30px;
}

.no-meals {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  color: #7f8c8d;
}

.add-sample-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: transform 0.3s;
}

.meal-item:hover {
  transform: translateX(5px);
  background: #f0f3f5;
}

.meal-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.meal-time {
  font-weight: bold;
  color: #3498db;
  min-width: 60px;
}

.meal-name {
  flex: 1;
  color: #2c3e50;
}

.meal-calories {
  font-weight: bold;
  color: #e74c3c;
}

.remove-meal-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #95a5a6;
  transition: color 0.3s;
}

.remove-meal-btn:hover {
  color: #e74c3c;
}

/* Add meal form */
.add-meal-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.meal-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.calories-input {
  max-width: 150px;
}

.add-btn {
  padding: 12px 25px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.add-btn:hover {
  background: #27ae60;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quick-btn {
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.quick-btn:hover {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

/* Stats section */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Macros */
.macro-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.macro-name {
  min-width: 140px;
  color: #2c3e50;
  font-weight: 500;
}

.macro-bar {
  flex: 1;
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.macro-fill {
  height: 100%;
  border-radius: 10px;
}

.macro-fill.protein {
  width: 65%;
  background: linear-gradient(to right, #3498db, #2980b9);
}

.macro-fill.carbs {
  width: 80%;
  background: linear-gradient(to right, #2ecc71, #27ae60);
}

.macro-fill.fats {
  width: 45%;
  background: linear-gradient(to right, #f39c12, #e67e22);
}

.macro-value {
  min-width: 50px;
  text-align: right;
  font-weight: bold;
  color: #2c3e50;
}

/* Footer */
.meals-footer {
  max-width: 1200px;
  margin: 30px auto;
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  border-top: 1px solid #eee;
}

.reset-btn {
  padding: 12px 25px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 15px;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: #c0392b;
}

/* Responsive */
@media (max-width: 900px) {
  .meals-main {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .add-meal-form {
    flex-direction: column;
  }
  
  .calories-input {
    max-width: 100%;
  }
}
</style>