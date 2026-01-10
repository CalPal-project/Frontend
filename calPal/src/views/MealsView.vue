<template>
  <div class="meals-container">
    <!-- Header -->
    <header class="meals-header">
      <h1> Sledenje obrokom</h1>
      <button @click="goToMealHistory" class="back-btn">Pregled Obrokov</button>
      <button @click="goToDashboard" class="back-btn">← Nazaj na Dashboard</button>
    </header>

    <main class="meals-main">
      <!-- AddMealForm -->
      <AddMealForm @meal-added="loadMeals" />
      <EditMealForm
        v-if="showEditForm"
        :show="showEditForm"
        :meal="editingMeal"
        @close="closeEditForm"
        @meal-updated="handleMealUpdated"
      />

      <!-- Današnji obroki -->
      <section class="card today-meals">
        <div class="card-header">
          <h2>Današnji obroki</h2>
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
            <span class="value calories">{{ caloriesOfTheDay }} kcal</span>
          </div>
        </div>

        <!-- Seznam obrokov -->
        <div v-if="loading" class="loading">Nalagam obroke...</div>

        <div v-else-if="meals.length === 0" class="no-meals">
          <p>Danes še nimaš nobenega obroka. Dodaj svoj prvi obrok zgoraj!</p>
        </div>

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
                  <!-- Uporabite food.amount in food.calories iz API-ja -->
                  <span class="food-details">{{ food.amount }}g = {{ food.calories }} kcal</span>
                </li>
              </ul>
            </div>

            <div class="meal-footer">
              <span class="meal-date">📅 {{ formatDate(meal.dateTime) }}</span>
              <button @click="openEditForm(meal)" class="update-btn" title="Posodobi obrok">
                Uredi
              </button>
              <button @click="deleteMeal(meal.id)" class="delete-btn" title="Izbriši obrok">
                Izbriši
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
import EditMealForm from '@/components/EditMealForm.vue'
import { mealApi } from '@/api'

export default {
  name: 'MealsView',
  components: { AddMealForm, EditMealForm },
  data() {
    return {
      meals: [],
      loading: false,
      error: null,
      editingMeal: null,
      showEditForm: false,
      username: null,
      userId: null,
    }
  },
  async mounted() {
    await this.getCurrentUser()
    this.loadMeals()
  },
  computed: {
    caloriesOfTheDay() {
      return this.meals.reduce((total, meal) => {
        const mealCalories = meal.calories
        if (mealCalories !== null && mealCalories !== undefined) {
          return total + mealCalories
        }
        return total
      }, 0)
    },
  },
  methods: {
    goToDashboard() {
      this.$router.push('/dashboard')
    },

    goToMealHistory(){
      this.$router.push('/mealshistory')
    },
    
    getFullMealType(c) {
      if (c == 'Z') {
        return 'Zajtrk'
      } else if (c == 'K') {
        return 'Kosilo'
      } else if (c == 'V') {
        return 'Vecerja'
      } else {
        return 'Prigrizek'
      }
    },

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
        console.log("PISEM USERID IZ FUNKCIJA:", this.userId)

        console.log("Current user:", this.username, "ID:", this.userId);

      } catch (error) {
        console.error("Napaka v getCurrentUser:", error);
      }
    },

    openEditForm(meal) {
      console.log('odpiram editing mode')
      this.editingMeal = meal
      this.showEditForm = true
    },

    closeEditForm() {
      this.showEditForm = false
      this.editingMeal = null
    },

    // async handleMealUpdated() {
    //   await this.getCurrentUser()
    //   this.loadMeals()
    //   this.closeEditForm()
    // },
    async handleMealUpdated() {
      this.showEditForm = false
      this.editingMeal = null
      await this.loadMeals()  // naloži nove obroke
    },

    async loadMeals() {
      //await this.getCurrentUser()
      if (!this.userId) {
        console.error("UserID ni definiran, ne morem naložiti obrokov");
        return;
      }
      this.loading = true
      this.error = null
      try {
        console.log("USERID: ", this.userid)
        const res = await mealApi.get(`/mealsToday?userId=${this.userId}`)
        this.meals = res.data
      } catch (err) {
        console.error('Napaka pri nalaganju obrokov:', err)
        this.error = 'Napaka pri nalaganju obrokov'
      } finally {
        this.loading = false
      }
    },

    async deleteMeal(id) {
      if (!confirm('Ste prepričani, da želite izbrisati ta obrok?')) {
        return
      }
      try {
        const response = await mealApi.delete(`deleteMeal?id=${id}&userId=${this.userId}`)
        this.loadMeals() 
      } catch (err) {
        console.error('Napaka pri brisanju obroka:', err)
        console.error('Error response:', err.response)
        alert('Napaka pri brisanju obroka: ' + (err.response?.data || err.message))
      }
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
  },
}
</script>

<style scoped>
  @import '@/style/MealsView.css';
</style>
