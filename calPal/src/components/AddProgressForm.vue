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
            <span class="input-label">Dodaj telovadbe:</span>
            <span class="input-info">Tedenski cilj: {{ goal.weeklyFitness }} telovadb</span>
          </label>
          <div class="input-with-unit">
            <input
              id="workouts"
              v-model="progressData.workouts"
              type="number"
              min="0"
              step="1"
              placeholder="Število telovadb"
              class="form-control"
              @keyup.enter="submitProgress"
            />
            <span class="unit">krat</span>
          </div>
        </div>

        <!-- Napaka - neveljavni tip -->
        <div v-else class="error-message">
          ❌ Neveljavna kombinacija tipov cilja
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
      if (this.goal.goalType === 'C') return '📊 Dodaj zaužite kalorije';
      if (this.goal.goalType === 'W') return '⚖️ Posodobi težo';
      if (this.goal.goalType === 'F') {
        if (this.goal.fitnessType === 'R') return '🏃 Dodaj kilometre';
        if (this.goal.fitnessType === 'S') return '👣 Dodaj korake';
        if (this.goal.fitnessType === 'F') return '💪 Dodaj telovadbo';
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
          return data.workouts !== null && data.workouts >= 0;
        }
      }
      return false;
    }
  },
  methods: {
    closeModal() {
      this.resetForm();
      this.$emit('close');
    },
    
    async submitProgress() {
      if (!this.isFormValid) return;
      
      try {
        // Pripravi podatke za backend
        const payload = {
          //goalId: this.goal.id,
          //goalType: this.goal.goalType,
          //timestamp: new Date().toISOString()
        };
        
        // Dodaj specifične podatke glede na tip
        if (this.goal.goalType === 'C') {
          const calories =  parseInt(this.progressData.calories);
          console.log("updejtam calories", calories)
          const respnse = await goalApi.put(`/updateProgressCalories?id=${this.goal.id}&eatenCals=${calories}`);

          //payload.type = 'calories';
        } 
        else if (this.goal.goalType === 'W') {
          const weight = parseFloat(this.progressData.weight);
          console.log("updejtam witght", weight)
          const respnse = await goalApi.put(`/updateProgressWeight?id=${this.goal.id}&newWeight=${weight}`);
          //payload.type = 'weight';
        }
        else if (this.goal.goalType === 'F') {
          if (this.goal.fitnessType === 'R') {
              const distance = parseFloat(this.progressData.distance);
              console.log("updejtam run", distance)
            const respnse = await goalApi.put(`/updateProgressFitness?id=${this.goal.id}&num=${distance}`);
            //payload.type = 'running';
          }
          else if (this.goal.fitnessType === 'S') {
            const steps = parseInt(this.progressData.steps);
            console.log("updejtam steps", steps)
            const respnse = await goalApi.put(`/updateProgressFitness?id=${this.goal.id}&num=${steps}`);
          }
        }
        
        console.log('Pošiljam napredek:', payload);
        
        // TODO: Implementiraj API klic
        // await this.$api.post('/api/progress', payload);

        
        // Za testiranje
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.$emit('progress-added', payload);
        this.resetForm();
        
        // Obvestilo za uporabnika
        this.showSuccessMessage();
        
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
    
    showSuccessMessage() {
      let message = 'Napredek uspešno shranjen!';
      
      if (this.goal.goalType === 'C') {
        message = `Zabeleženih ${this.progressData.calories} kcal!`;
      } 
      else if (this.goal.goalType === 'W') {
        message = `Teža posodobljena na ${this.progressData.weight}kg!`;
      }
      else if (this.goal.goalType === 'F') {
        if (this.goal.fitnessType === 'R') {
          message = `Dodanih ${this.progressData.distance}km teka/hode!`;
        }
        else if (this.goal.fitnessType === 'S') {
          message = `Dodanih ${this.progressData.steps} korakov!`;
        }
        else if (this.goal.fitnessType === 'F') {
          message = `Dodanih ${this.progressData.workouts} telovadb!`;
        }
      }
      
      alert('✅ ' + message);
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.progress-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
}

.input-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.input-info {
  display: block;
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-unit .form-control {
  flex: 1;
  padding-right: 60px;
}

.unit {
  position: absolute;
  right: 15px;
  color: #7f8c8d;
  font-weight: 600;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

.remaining-info {
  margin-top: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  color: #5a6268;
}

.warning {
  color: #e74c3c;
  font-weight: 600;
}

.success {
  color: #27ae60;
  font-weight: 600;
}

.period-selector {
  margin-top: 15px;
}

.period-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.error-message {
  padding: 20px;
  text-align: center;
  background: #ffeaea;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
  justify-content: flex-end;
}

.btn-cancel, .btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-submit {
  background: #2ecc71;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #27ae60;
  transform: translateY(-2px);
}

.btn-submit:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .progress-modal {
    width: 95%;
    margin: 10px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-submit {
    width: 100%;
  }
}
</style>