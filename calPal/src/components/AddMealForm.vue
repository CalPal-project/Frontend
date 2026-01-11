<template>
  <div class="add-meal-form card">
    <h2>Dodaj obrok</h2>

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
        <p>gramov</p>
        <button @click="addFoodToMeal" class="btn-add" :disabled="!foodAmount || foodAmount <= 0">
         Dodaj hrano
        </button>
      </div>
    </div>

    <!-- Seznam dodanih hran -->
    <div v-if="selectedFoods.length > 0" class="added-foods">
      <h3>Dodane hrane:</h3>
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
      <button @click="saveMeal" class="btn-save" :disabled="!canSaveMeal">Shrani obrok</button>
      <button @click="resetForm" class="btn-reset"> Ponastavi</button>
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
      userId: null
    }
  },
  mounted() {
    this.getCurrentUser()
  },
  computed: {
    totalMealCalories() {
      return this.selectedFoods.reduce((sum, food) => sum + food.calories, 0)
    },

    totalSelectedCalories() {
      return this.totalMealCalories
    },

    canSaveMeal() {
      return this.mealType && this.selectedFoods.length > 0
    },
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

        this.userId = data.user.id;

        console.log( "UserID:", this.userId);

      } catch (error) {
        console.error("Napaka v getCurrentUser:", error);
      }
    },
    onSearchInput() {
      this.showDropdown = this.search.length >= 2

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
        const res = await mealApi.get('/findFood', {
          params: { ime: this.search },
        })

        console.log('API Response:', res.data)
        this.foods = res.data || []
        this.error = null
      } catch (err) {
        console.error('API Error:', err)
        console.error('Error response:', err.response)

        this.foods = []
        this.error = 'Napaka pri iskanju hrane'
      }
    },

    selectFood(food) {
      this.selectedFood = { ...food }
      this.foodAmount = 100
      this.showDropdown = false
      this.foods = [] 
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
        foodName: this.selectedFood.foodName, 
        amount: this.foodAmount,
        calories: calories,
      })
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

      const payload = {
        mealType: this.mealType.charAt(0), 
        dateTime: dateTime,
        calories: this.totalMealCalories,
        foods: this.selectedFoods.map((food) => ({
          foodId: food.id,
          amount: food.amount,
        })),
        userId: this.userId
      }
      console.log('Saving meal:', payload)

      try {
        const res = await mealApi.post('/addMeal', payload)
        console.log("meal saved")

        let calorieGoal = null;

        try{
          const response = await goalApi.get(`/getCalorieGoal?userId=${this.userId}`)

          let goal = response.data
  
          if(goal){
            try{
              //to popravi za uporabnika
              await goalApi.put(`/updateProgressCalories?id=${goal.id}&eatenCals=${this.totalMealCalories}`)
            } catch (updateErr) {
              console.error('Error updating calorie goal:', updateErr)
            }
          }
        } catch (goalErr) {
          console.error('error nismo nasli goala', goalErr)
        }
        this.successMessage = 'Obrok uspešno dodan!'

        setTimeout(() => {
          this.resetForm()
          this.$emit('meal-added')
        }, 1500)
      } catch (err) {
        console.error('Save error:', err)
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
  @import '@/style/AddMealForm.css';
</style>
