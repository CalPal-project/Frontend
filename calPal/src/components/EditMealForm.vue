  <template>
    <!-- EDIT MEAL MODAL POPUP -->
    <div v-if="show" class="edit-meal-modal">
      <div class="modal-overlay" @click="close"></div>
      
      <div class="modal-content">
        <div class="modal-header">
          <h2>Uredi obrok</h2>
          <button @click="close" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submit" class="edit-form">
            <!-- Tip obroka -->
            <div class="form-group">
              <label>Tip obroka:</label>
              <select 
                v-model="formData.mealType" 
                required
                class="form-control"
              >
                <option value="Z">Zajtrk</option>
                <option value="K">Kosilo</option>
                <option value="V">Večerja</option>
                <option value="P">Prigrizek</option>
              </select>
            </div>
            
            <!-- Datum in čas -->
            <div class="form-group">
              <label>Datum in čas:</label>
              <input
                type="datetime-local"
                v-model="formData.dateTime"
                required
                class="form-control"
              />
            </div>
            
            <!-- Seznam hran -->
            <div class="foods-section">
              <h3>Hrana v obroku:</h3>
              
              <div v-for="(food, index) in formData.foods" :key="index" class="food-item-edit">
                <div class="food-row">
                  <!-- Iskanje hrane -->
                  <div class="form-group food-search-group">
                    <input
                      type="text"
                      v-model="food.searchText"
                      @input="onFoodSearchInput(food, index)"
                      :placeholder="getFoodPlaceholder(food)"
                      class="form-control food-search-input"
                    />
                    
                    <!-- Dropdown s predlogi -->
                    <ul v-if="food.showDropdown && food.searchResults.length" class="dropdown">
                      <li 
                        v-for="result in food.searchResults" 
                        :key="result.id" 
                        @click="selectSearchResult(food, result)"
                        class="dropdown-item"
                      >
                        <strong>{{ result.foodName }}</strong> – {{ result.caloriesPer100g }} kcal/100g
                      </li>
                    </ul>
                  </div>
                  
                  <!-- Količina -->
                  <div class="form-group amount-group">
                    <input
                      type="number"
                      v-model="food.amount"
                      @input="updateFoodCalories(food)"
                      placeholder="Količina (g)"
                      min="1"
                      required
                      class="form-control amount-input"
                    />
                  </div>
                  
                  <!-- Kalorije -->
                  <div class="calories-display">
                    <span class="calories-text">{{ food.calories || 0 }} kcal</span>
                  </div>
                  
                  <!-- Gumb za odstranitev -->
                  <button 
                    type="button" 
                    @click="removeFood(index)" 
                    class="btn-remove"
                    title="Odstrani hrano"
                  >
                    ✕
                  </button>
                </div>
                
                <!-- Prikaz izbrane hrane -->
                <div v-if="food.foodId && food.foodName" class="selected-food-info">
                  <small>
                    <strong>Trenutno:</strong> {{ food.foodName }} 
                    ({{ food.caloriesPer100g }} kcal/100g)
                  </small>
                </div>
              </div>
              
              <!-- Gumb za dodajanje nove hrane -->
              <button type="button" @click="addFood" class="btn-add-food">
                + Dodaj novo hrano
              </button>
            </div>
            
            <!-- Skupne kalorije -->
            <div class="total-section">
              <div class="total-calories">
                <strong>Skupne kalorije obroka: {{ totalCalories }} kcal</strong>
              </div>
            </div>
            
            <!-- Gumbi -->
            <div class="form-actions">
              <button type="button" @click="close" class="btn-cancel">
                Prekliči
              </button>
              <button type="submit" :disabled="saving" class="btn-save">
                {{ saving ? 'Shranjujem...' : 'Shrani spremembe' }}
              </button>
            </div>
            
            <!-- Sporočila -->
            <div v-if="error" class="alert error">
              {{ error }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>

  <script>
  import { mealApi } from '@/api'

  export default {
    name: 'EditMealForm',
    props: {
      show: Boolean,
      meal: Object // Meal ki ga urejamo
    },
    data() {
      return {
        formData: {
          mealType: 'Z',
          dateTime: '',
          foods: []
        },
        availableFoods: [],
        saving: false,
        error: null,
        searchTimeouts: {},
        userId: null
      }
    },
    watch: {
      meal: {
        immediate: true,
        handler(newMeal) {
          if (newMeal) {
            this.loadMealData(newMeal)
          }
        }
      }
    },
    computed: {
      totalCalories() {
        return this.formData.foods.reduce((total, food) => {
          return total + (food.calories || 0)
        }, 0)
      }
    },
    async mounted() {
      await this.loadAllFoods(),
      this.getCurrentUser()
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
      async loadAllFoods() {
        try {
          const response = await mealApi.get('/findFood', { params: { ime: '' } })
          this.availableFoods = response.data || []
        } catch (error) {
          console.error('Napaka pri nalaganju hrane:', error)
        }
      },
      
      loadMealData(meal) {
        const date = new Date(meal.dateTime)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`
  

        this.formData = {
          mealType: meal.mealType,
          dateTime: formattedDate,
          foods: meal.foods.map(food => ({
            foodId: food.id ,
            foodName: food.foodName,
            caloriesPer100g: food.calories,
            amount: food.amount,
            calories: food.calories,
            searchText: food.foodName || '',
            searchResults: [],
            showDropdown: false
          }))
        }
        
        console.log('Loaded foods for editing:', this.formData.foods)
      },
      
      getFoodPlaceholder(food) {
        return food.foodName || 'Išči hrano...'
      },
      
      calculateCaloriesPer100g(food) {
        if (!food.amount || food.amount === 0 || !food.calories) return 0
        return Math.round((food.calories / food.amount) * 100)
      },
      
      onFoodSearchInput(food, index) {
        if (food.searchText === food.foodName) {
          food.showDropdown = false
          return
        }
        
        food.showDropdown = food.searchText.length >= 2
        
        if (this.searchTimeouts[index]) {
          clearTimeout(this.searchTimeouts[index])
        }
        
        this.searchTimeouts[index] = setTimeout(() => {
          this.performFoodSearch(food, index)
        }, 300)
      },
      
      async performFoodSearch(food, index) {
        if (food.searchText.length < 2) {
          food.searchResults = []
          return
        }
        
        try {
          const searchTerm = food.searchText.toLowerCase()
          const results = this.availableFoods.filter(f => 
            f.foodName.toLowerCase().includes(searchTerm)
          )
          
          food.searchResults = results.slice(0, 10)
          
          if (results.length === 0) {
            const response = await mealApi.get('/findFood', {
              params: { ime: food.searchText }
            })
            food.searchResults = response.data || []
          }
          
        } catch (error) {
          console.error('Napaka pri iskanju hrane:', error)
          food.searchResults = []
        }
      },
      
      selectSearchResult(food, result) {
        food.foodId = result.id
        food.foodName = result.foodName
        food.caloriesPer100g = result.caloriesPer100g || result.calories
        food.searchText = result.foodName 
        food.showDropdown = false
        food.searchResults = []
        this.updateFoodCalories(food)
      },
      
      updateFoodCalories(food) {
        if (food.foodId && food.amount && food.caloriesPer100g) {
          food.calories = Math.round((food.caloriesPer100g * food.amount) / 100)
        } else {
          food.calories = 0
        }
      },
      
      addFood() {
        this.formData.foods.push({
          foodId: null,
          foodName: '',
          caloriesPer100g: 0,
          amount: 100,
          calories: 0,
          searchText: '',
          searchResults: [],
          showDropdown: false
        })
      },
      
      removeFood(index) {
        this.formData.foods.splice(index, 1)
      },
      
      async submit() {
        this.saving = true
        this.error = null
        
        try {
          const foodsWithoutId = this.formData.foods.filter(f => !f.foodId)
          if (foodsWithoutId.length > 0) {
            for (const food of foodsWithoutId) {
              if (food.searchText && food.searchText.trim() !== '') {
                try {
                  const response = await mealApi.get('/findFood', {
                    params: { ime: food.searchText }
                  })
                  if (response.data && response.data.length > 0) {
                    const foundFood = response.data[0]
                    food.foodId = foundFood.id
                    food.foodName = foundFood.foodName
                    food.caloriesPer100g = foundFood.caloriesPer100g || foundFood.calories
                    console.log(`Found food ID for "${food.searchText}": ${foundFood.id}`)
                  } else {
                    this.error = `Hrane "${food.searchText}" ni bilo mogoče najti. Prosimo izberite hrano iz predlaganega seznama.`
                    this.saving = false
                    return
                  }
                } catch (searchError) {
                  console.error('Napaka pri iskanju hrane:', searchError)
                  this.error = `Napaka pri iskanju hrane "${food.searchText}".`
                  this.saving = false
                  return
                }
              } else {
                this.error = 'Prosimo izberite hrano za vse elemente v obroku.'
                this.saving = false
                return
              }
            }
          }

          const mealData = {
            mealType: this.formData.mealType,
            dateTime: this.formData.dateTime + ':00',
            calories: this.totalCalories,
            foods: this.formData.foods.map(food => ({
              foodId: food.foodId, 
              amount: parseFloat(food.amount)
            })),
            userId: this.userId
          }
          
          await mealApi.put(`/updateMeal?id=${this.meal.id}`, mealData)
          
          this.$emit('meal-updated')
          this.close()
          
        } catch (error) {
          console.error('Napaka pri posodabljanju obroka:', error)
          this.error = 'Napaka pri shranjevanju sprememb: ' + (error.response?.data?.error || error.message)
        } finally {
          this.saving = false
        }
      },
      
      close() {
        this.$emit('close')
      }
    },
    
    beforeDestroy() {
      Object.values(this.searchTimeouts).forEach(timeout => {
        clearTimeout(timeout)
      })
    }
  }
  </script>

  <style scoped>
    @import '@/style/EditMealForm.css';
  </style>
