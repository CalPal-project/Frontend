<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="progress-modal">
      <div class="modal-header">
        <h2>{{ modalTitle }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <!-- Kalorije -->
        <div v-if="goal.goalType === 'C'" class="form-group">
          <label for="calories">
            <span class="input-label">Vnesi zaužite kalorije:</span>
            <span class="input-info">Trenutni cilj: {{ goal.cals }} kcal</span>
          </label>
          <div class="input-with-unit">
            <input
              id="calories"
              v-model="progressData.calories"
              type="number"
              min="0"
              step="10"
              placeholder="Vnesi kcal"
              class="form-control"
              @keyup.enter="submitProgress"
            />
            <span class="unit">kcal</span>
          </div>
          <div v-if="progressData.calories" class="remaining-info">
            Preostalo do cilja: {{ goal.cals - goal.eatenCals - progressData.calories }} kcal
          </div>
        </div>

        <!-- Teža -->
        <div v-else-if="goal.goalType === 'W'" class="form-group">
          <label for="weight">
            <span class="input-label">Vnesi trenutno težo:</span>
            <span class="input-info">
              Začetna: {{ goal.currentWeight }}kg → Cilj: {{ goal.goalWeight }}kg
            </span>
          </label>
          <div class="input-with-unit">
            <input
              id="weight"
              v-model="progressData.weight"
              type="number"
              min="30"
              max="200"
              step="0.1"
              placeholder="Vnesi težo"
              class="form-control"
              @keyup.enter="submitProgress"
            />
            <span class="unit">kg</span>
          </div>
          <div v-if="progressData.weight" class="remaining-info">
            <span v-if="progressData.weight > goal.currentWeight" class="success">
              Pridobili ste {{ (progressData.weight - goal.currentWeight).toFixed(1) }}kg
            </span>
            <span v-else class="success">
              Izgubili ste {{ (goal.currentWeight - progressData.weight).toFixed(1) }}kg
            </span>
            | Še do cilja: {{ (goal.goalWeight - progressData.weight).toFixed(1) }}kg
          </div>
        </div>

        <!-- Fitnes: Tek/hoja -->
        <div v-else-if="goal.goalType === 'F' && goal.fitnessType === 'R'" class="form-group">
          <label for="distance">
            <span class="input-label">Vnesi prehojene/pretečene kilometre:</span>
            <span class="input-info">Tedenski cilj: {{ goal.kms }} km</span>
          </label>
          <div class="input-with-unit">
            <input
              id="distance"
              v-model="progressData.distance"
              type="number"
              min="0"
              step="0.1"
              placeholder="Vnesi kilometre"
              class="form-control"
              @keyup.enter="submitProgress"
            />
            <span class="unit">km</span>
          </div>
        </div>

        <!-- Fitnes: Koraki -->
        <div v-else-if="goal.goalType === 'F' && goal.fitnessType === 'S'" class="form-group">
          <label for="steps">
            <span class="input-label">Vnesi dodatne korake:</span>
            <span class="input-info">Dnevni cilj: {{ goal.steps }} korakov</span>
          </label>
          <div class="input-with-unit">
            <input
              id="steps"
              v-model="progressData.steps"
              type="number"
              min="0"
              step="100"
              placeholder="Vnesi korake"
              class="form-control"
              @keyup.enter="submitProgress"
            />
            <span class="unit">korakov</span>
          </div>
          <div v-if="progressData.steps" class="remaining-info">
            Skupaj danes: {{ (goal.currentValue || 0) + parseInt(progressData.steps) }} korakov
          </div>
        </div>

        <!-- Fitnes: Telovadba (če je še potrebno) -->
        <div v-else-if="goal.goalType === 'F' && goal.fitnessType === 'F'" class="form-group">
          <label for="workouts">
            <span class="input-label">Zabeleži porabljene kalorije:</span>
          </label>
          <div class="input-with-unit">
            <input
              id="workouts"
              v-model="progressData.calsBurned"
              type="number"
              min="0"
              step="1"
              placeholder="Število porabljenih kalorij"
              class="form-control"
              @keyup.enter="submitProgress"
            />
            <span class="unit">kcal</span>
          </div>
        </div>

        <!-- Napaka - neveljavni tip -->
        <div v-else class="error-message">
          Neveljavna kombinacija tipov cilja
        </div>

        <div class="modal-actions">
          <button @click="closeModal" class="btn-cancel">Prekliči</button>
          <button 
            @click="submitProgress" 
            class="btn-submit"
            :disabled="!isFormValid"
          >
            Shrani napredek
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { goalApi } from '@/api';

export default {
  name: 'AddProgressForm',
  props: {
    goal: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      progressData: {
        calories: null,
        weight: null,
        distance: null,
        steps: null,
        workouts: null,
        period: 'daily' // za tek/hojo
      }
    }
  },
  computed: {
    modalTitle() {
      if (this.goal.goalType === 'C') return 'Dodaj zaužite kalorije';
      if (this.goal.goalType === 'W') return 'Posodobi težo';
      if (this.goal.goalType === 'F') {
        if (this.goal.fitnessType === 'R') return 'Dodaj kilometre';
        if (this.goal.fitnessType === 'S') return 'Dodaj korake';
        if (this.goal.fitnessType === 'F') return 'Zabeleži porabljene kalorije';
      }
      return 'Dodaj napredek';
    },
    isFormValid() {
      const data = this.progressData;
      
      if (this.goal.goalType === 'C') {
        return data.calories !== null && data.calories > 0;
      }
      if (this.goal.goalType === 'W') {
        return data.weight !== null && data.weight >= 30 && data.weight <= 200;
      }
      if (this.goal.goalType === 'F') {
        if (this.goal.fitnessType === 'R') {
          return data.distance !== null && data.distance >= 0;
        }
        if (this.goal.fitnessType === 'S') {
          return data.steps !== null && data.steps >= 0;
        }
        if (this.goal.fitnessType === 'F') {
          return data.calsBurned !== null && data.calsBurned >= 0;
        }
      }
      return false;
    }
  },
  async mounted() {
    await this.getCurrentUser()
  },
  methods: {
    closeModal() {
      this.resetForm();
      this.$emit('close');
    },
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
    
    async submitProgress() {
      if (!this.isFormValid) return;
      
      try {

        if (this.goal.goalType === 'C') {
          const calories =  parseInt(this.progressData.calories);
          console.log("updejtam calories", calories)
          const respnse = await goalApi.put(`/updateProgressCalories?id=${this.goal.id}&eatenCals=${calories}`);
        } 
        else if (this.goal.goalType === 'W') {
          const weight = parseFloat(this.progressData.weight);
          console.log("updejtam witght", weight)
        }
        else if (this.goal.goalType === 'F') {
          if (this.goal.fitnessType === 'R') {
              const distance = parseFloat(this.progressData.distance);
              console.log("updejtam run", distance)
            const respnse = await goalApi.put(`/updateProgressFitness?id=${this.goal.id}&num=${distance}`);
          }
          else if (this.goal.fitnessType === 'S') {
            const steps = parseInt(this.progressData.steps);
            console.log("updejtam steps", steps)
            const respnse = await goalApi.put(`/updateProgressFitness?id=${this.goal.id}&num=${steps}`);
          }
          else if(this.goal.fitnessType == 'F'){
            const calsb = parseInt(this.progressData.calsBurned);
            try{
                const res = await goalApi.get(`/getCalorieGoal?userId=${this.userId}`)
                let goal = res.data
                if(goal){
                  try{
                    await goalApi.put(`/updateProgressCalories?id=${goal.id}&eatenCals=${-calsb}`)
                  } catch (updateErr){
                    console.error('Error updating calorie goal:', updateErr)
                  }
                }
              } catch (goalErr) {
                  console.error('error nismo nasli goala', goalErr)
              }
            }
        }
        
        console.log('Pošiljam napredek:', payload);

        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.$emit('progress-added', payload);
        this.resetForm();
        
      } catch (error) {
        console.error('Napaka pri shranjevanju napredka:', error);
        alert('Napaka pri shranjevanju: ' + error.message);
      }
    },
    
    resetForm() {
      this.progressData = {
        calories: null,
        weight: null,
        distance: null,
        steps: null,
        workouts: null,
        period: 'daily'
      };
    },
  }
}
</script>

<style scoped>
  @import '@/style/AddProgressForm.css';
</style>
