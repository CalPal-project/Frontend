<template>
  <div class="add-meal-form card">
    <h2>➕ Dodaj obrok</h2>

    <!-- Tip obroka -->
    <div class="form-group">
      <label>Tip obroka:</label>
      <select v-model="mealType" class="form-control">
        <option disabled value="">Izberi tip obroka</option>
        <option value="Z">Zajtrk</option>
        <option value="K">Kosilo</option>
        <option value="V">Večerja</option>
        <option value="P">Prigrizek</option>
      </select>
    </div>

    <!-- Iskanje hrane -->
    <div class="form-group">
      <label>Išči hrano:</label>
      <input
        type="text"
        v-model="search"
        @input="onSearchInput"
        placeholder="Vnesi ime hrane..."
        class="form-control"
      />

      <!-- Dropdown s predlogi -->
      <ul v-if="showDropdown && foods.length" class="dropdown">
        <li v-for="food in foods" :key="food.id" @click="selectFood(food)" class="dropdown-item">
          <strong>{{ food.foodName }}</strong> – {{ food.calories }} kcal/100g
        </li>
        <li v-if="foods.length === 0 && search.length >= 2" class="dropdown-item no-results">
          Ni rezultatov
        </li>
      </ul>
    </div>

    <!-- Izbrana hrana + količina -->
    <div v-if="selectedFood" class="selected-food form-group">
      <h4>Izbrana hrana: {{ selectedFood.foodName }}</h4>
      <div class="amount-controls">
        <input
          type="number"
          v-model.number="foodAmount"
          placeholder="Količina (g)"
          class="form-control amount-input"
          min="1"
          step="1"
        />
        <button @click="addFoodToMeal" class="btn-add" :disabled="!foodAmount || foodAmount <= 0">
          Dodaj hrano
        </button>
      </div>
    </div>

    <!-- Seznam dodanih hran -->
    <div v-if="selectedFoods.length > 0" class="added-foods">
      <h3>🍽️ Dodane hrane:</h3>
      <ul class="food-list">
        <li v-for="(food, index) in selectedFoods" :key="index" class="food-item">
          <span class="food-name">{{ food.foodName }}</span>
          <span class="food-details">{{ food.amount }}g = {{ food.calories }} kcal</span>
          <button @click="removeFood(index)" class="btn-remove">✕</button>
        </li>
      </ul>

      <div class="total-calories">
        <strong>Skupaj: {{ totalSelectedCalories }} kcal</strong>
      </div>
    </div>

    <!-- Shranjevanje obroka -->
    <div class="form-actions">
      <button @click="saveMeal" class="btn-save" :disabled="!canSaveMeal">💾 Shrani obrok</button>
      <button @click="resetForm" class="btn-reset">🔄 Ponastavi</button>
    </div>

    <!-- Sporočila o napakah/success -->
    <div v-if="error" class="alert error">
      {{ error }}
    </div>
    <div v-if="successMessage" class="alert success">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { goalApi, mealApi } from '@/api'

export default {
  name: 'AddMealForm',
  data() {
    return {
      mealType: '',
      search: '',
      foods: [],
      selectedFood: null,
      foodAmount: 100,
      selectedFoods: [],
      error: null,
      successMessage: null,
      showDropdown: false,
      searchTimeout: null,
    }
  },
  computed: {
    // Izračunaj skupne kalorije obroka
    totalMealCalories() {
      return this.selectedFoods.reduce((sum, food) => sum + food.calories, 0)
    },

    // Posamezne kalorije za prikaz (če še potrebuješ)
    totalSelectedCalories() {
      return this.totalMealCalories
    },

    canSaveMeal() {
      return this.mealType && this.selectedFoods.length > 0
    },
  },
  methods: {
    onSearchInput() {
      this.showDropdown = this.search.length >= 2

      // Debounce search
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      this.searchTimeout = setTimeout(() => {
        this.performSearch()
      }, 300)
    },

    async performSearch() {
      if (this.search.length < 2) {
        this.foods = []
        return
      }

      try {
        console.log('🔍 Searching API for:', this.search)

        // Testiraj obe poti
        const res = await mealApi.get('/findFood', {
          params: { ime: this.search },
        })

        console.log('✅ API Response:', res.data)
        this.foods = res.data || []
        this.error = null
      } catch (err) {
        console.error('❌ API Error:', err)
        console.error('Error response:', err.response)

        this.foods = []
        this.error = 'Napaka pri iskanju hrane'

        // // Debug - dodaj testne podatke
        // if (process.env.NODE_ENV === 'development') {
        //   this.foods = [
        //     { id: 1, foodName: 'Test hrana 1', calories: 100 },
        //     { id: 2, foodName: 'Test hrana 2', calories: 200 }
        //   ]
        // }
      }
    },

    selectFood(food) {
      console.log('👉 Selected food:', food)
      this.selectedFood = { ...food }
      this.foodAmount = 100
      this.showDropdown = false
      // NE: this.search = '' // To povzroči infinite loop!
      this.foods = [] // samo počisti dropdown
    },

    addFoodToMeal() {
      if (!this.foodAmount || this.foodAmount <= 0) {
        this.error = 'Vnesi veljavno količino'
        return
      }

      if (!this.selectedFood) {
        this.error = 'Najprej izberi hrano'
        return
      }

      const calories = Math.round((this.selectedFood.calories * this.foodAmount) / 100)

      this.selectedFoods.push({
        id: this.selectedFood.id,
        //foodName: this.selectedFood.foodName, // Shrani kot 'name' za prikaz
        foodName: this.selectedFood.foodName, // Ohrani original
        amount: this.foodAmount,
        calories: calories,
      })

      console.log('➕ Added food:', this.selectedFoods[this.selectedFoods.length - 1])

      this.selectedFood = null
      this.foodAmount = 100
      this.search = ''
      this.error = null
    },

    removeFood(index) {
      this.selectedFoods.splice(index, 1)
    },

    async saveMeal() {
      this.error = null
      this.successMessage = null

      if (!this.canSaveMeal) {
        this.error = 'Izberi tip obroka in dodaj vsaj eno hrano'
        return
      }

      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0') // 1 → "01"
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      const dateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`

      // Pravilna struktura za tvoj backend
      const payload = {
        mealType: this.mealType.charAt(0), // Samo prva črka: 'Z', 'K', 'V', 'P'
        dateTime: dateTime,
        calories: this.totalMealCalories,
        foods: this.selectedFoods.map((food) => ({
          foodId: food.id,
          amount: food.amount,
        })),
      }
      console.log('total calories', this.totalMealCalories)
      console.log('💾 Saving meal:', payload)

      try {
        const res = await mealApi.post('/addMeal', payload)
        console.log("meal saved")

        let calorieGoal = null;

        try{
          
          const response = await goalApi.get('/getCalorieGoal')
          console.log("nasli smo goal", response)

          let goal = response.data
  
          if(goal){
            try{
              await goalApi.put(`/updateProgressCalories?id=${goal.id}&eatenCals=${this.totalMealCalories}`)
              console.log("posodobili smo goal")
            }catch (updateErr) {
              console.error('❌ Error updating calorie goal:', updateErr)
              // Ne ustavi celotnega procesa, samo zabeleži napako
            }
          }
        }catch (goalErr) {
          console.error('error nismo nasli goala', goalErr)
          // Ne ustavi celotnega procesa, samo zabeleži napako
        }

        console.log('✅ Meal saved:', res.data)
        this.successMessage = '✅ Obrok uspešno dodan!'

        setTimeout(() => {
          this.resetForm()
          this.$emit('meal-added')
        }, 1500)
      } catch (err) {
        console.error('❌ Save error:', err)
        this.error = 'Napaka pri shranjevanju obroka'
      }
    },

    resetForm() {
      this.mealType = ''
      this.search = ''
      this.foods = []
      this.selectedFood = null
      this.foodAmount = 100
      this.selectedFoods = []
      this.error = null
      this.successMessage = null
      this.showDropdown = false

      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = null
      }
    },
  },
}
</script>

<style scoped>
.add-meal-form {
  background: white;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 5px;
}

.dropdown {
  border: 1px solid #ddd;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 0;
  margin: 5px 0 0 0;
  list-style: none;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.dropdown-item {
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.no-results {
  color: #7f8c8d;
  cursor: default;
}

.selected-food {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.amount-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}

.amount-input {
  flex: 0 0 120px;
}

.btn-add {
  padding: 10px 20px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-add:hover:not(:disabled) {
  background: #219955;
}

.btn-add:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.added-foods {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.food-list {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.food-name {
  font-weight: 600;
  color: #2c3e50;
}

.food-details {
  color: #7f8c8d;
  font-size: 14px;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.total-calories {
  text-align: right;
  padding: 15px;
  background: #f1c40f;
  border-radius: 8px;
  color: #2c3e50;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.btn-save {
  flex: 1;
  padding: 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #2980b9;
}

.btn-save:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-reset {
  padding: 15px 20px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-reset:hover {
  background: #7f8c8d;
}

.alert {
  padding: 12px 15px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
}

.error {
  background: #ffeaea;
  color: #c0392b;
  border: 1px solid #f5c6cb;
}

.success {
  background: #e8f7ee;
  color: #27ae60;
  border: 1px solid #c3e6cb;
}

h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}
</style>
