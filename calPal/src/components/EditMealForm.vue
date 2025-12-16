  <template>
    <!-- EDIT MEAL MODAL POPUP -->
    <div v-if="show" class="edit-meal-modal">
      <div class="modal-overlay" @click="close"></div>
      
      <div class="modal-content">
        <div class="modal-header">
          <h2>✏️ Uredi obrok</h2>
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
              <h3>🍽️ Hrana v obroku:</h3>
              
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
                {{ saving ? 'Shranjujem...' : '💾 Shrani spremembe' }}
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
        searchTimeouts: {}
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
    mounted() {
      this.loadAllFoods()
    },
    methods: {
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
        const formattedDate = date.toISOString().slice(0, 16)

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
            //za vse hrane brez id-ja probamo dobit id z najboljsim serchom (celo ime hrane)
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
                // Če ni searchText, je polje prazno
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
            }))
          }
          
          await mealApi.put(`/updateMeal?id=${this.meal.id}`, mealData)
          
          //this.$emit('meal-updated')
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
  .edit-meal-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(3px);
  }

  .modal-content {
    position: relative;
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 700px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 30px 20px;
    border-bottom: 2px solid #f0f0f0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px 16px 0 0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 24px;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    font-size: 28px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  .modal-body {
    padding: 30px;
  }

  /* FORM STYLES */
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
    font-size: 15px;
  }

  .form-control {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s;
    background: #f8f9fa;
  }

  .form-control:focus {
    outline: none;
    border-color: #3498db;
    background: white;
    box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.15);
  }

  /* FOOD SECTION */
  .foods-section {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 12px;
    border: 2px solid #e9ecef;
  }

  .foods-section h3 {
    margin: 0 0 20px 0;
    color: #2c3e50;
    font-size: 18px;
  }

  .food-item-edit {
    background: white;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .food-row {
    display: grid;
    grid-template-columns: 1fr 120px 100px 40px;
    gap: 15px;
    align-items: start;
    margin-bottom: 10px;
  }

  @media (max-width: 768px) {
    .food-row {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }

  .food-search-group {
    position: relative;
    margin: 0;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    border: 2px solid #3498db;
    border-radius: 0 0 10px 10px;
    max-height: 200px;
    overflow-y: auto;
    padding: 0;
    margin: -2px 0 0 0;
    list-style: none;
    background: white;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    z-index: 100;
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

  .dropdown-item strong {
    display: block;
    margin-bottom: 3px;
    color: #2c3e50;
  }

  .amount-group {
    margin: 0;
  }

  .amount-input {
    text-align: center;
    font-weight: 600;
  }

  .calories-display {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 46px;
    background: #fff3cd;
    border-radius: 10px;
    border: 2px solid #ffeaa7;
  }

  .calories-text {
    color: #856404;
    font-weight: 700;
    font-size: 15px;
  }

  .btn-remove {
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 10px;
    width: 40px;
    height: 46px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.3s;
    flex-shrink: 0;
  }

  .btn-remove:hover {
    background: #c0392b;
    transform: scale(1.1);
  }

  .selected-food-info {
    padding: 8px 12px;
    background: #e8f7ee;
    border-radius: 8px;
    color: #27ae60;
    font-size: 13px;
    margin-top: 8px;
    border-left: 4px solid #27ae60;
  }

  .btn-add-food {
    width: 100%;
    padding: 12px;
    background: #2ecc71;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-add-food:hover {
    background: #91f7bb;
    transform: translateY(-2px);
  }

  /* TOTAL CALORIES */
  .total-section {
    background: white;
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #e9ecef;
  }

  .total-calories {
    text-align: center;
    padding: 15px;
    background: rgba(255, 0, 0, 0);
    border-radius: 10px;
    color: black;
    font-size: 18px;
  }

  /* FORM ACTIONS */
  .form-actions {
    display: flex;
    gap: 15px;
    margin-top: 10px;
  }

  .btn-cancel {
    flex: 1;
    padding: 15px;
    background: #95a5a6;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn-cancel:hover {
    background: #7f8c8d;
    transform: translateY(-2px);
  }

  .btn-save {
    flex: 2;
    padding: 15px;
    background: rgb(41,128,185);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
  }

  .btn-save:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }

  /* ALERTS */
  .alert {
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    margin-top: 20px;
  }

  .error {
    background: #ffeaea;
    color: #c0392b;
    border: 2px solid #f5c6cb;
  }
  </style>