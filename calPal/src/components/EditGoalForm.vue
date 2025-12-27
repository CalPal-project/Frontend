<template>
  <div v-if="show" class="edit-goal-modal">
    <div class="modal-overlay" @click="close"></div>
    
    <div class="modal-content">
      <div class="modal-header">
        <h2>✏️ Uredi cilj</h2>
        <button @click="close" class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="submit" class="edit-form">
          <!-- Naslov cilja -->
          <div class="form-group">
            <label>Naslov cilja:</label>
            <input
              type="text"
              v-model="formData.goalTitle"
              required
              class="form-control"
              placeholder="Npr. Izguba 10kg"
            />
          </div>
          
          <!-- Tip cilja (ne more se spremeniti) -->
          <div class="form-group">
            <label>Tip cilja:</label>
            <div class="goal-type-display">
              <span class="type-icon">{{ getEmoji(formData.goalType) }}</span>
              <span class="type-text">{{ getGoalTypeText(formData.goalType) }}</span>
              <span class="type-hint">(Tip cilja se ne more spremeniti)</span>
            </div>
            <!-- Skrit input za tip cilja -->
            <input type="hidden" v-model="formData.goalType" />
          </div>
          
          <!-- Prikaz specifičnih polj glede na tip cilja -->
          
          <!-- CILJNA TEŽA (W) -->
          <div v-if="formData.goalType === 'W'" class="goal-specific-fields">
            <!-- Trenutna teža -->
            <div class="form-group">
              <label>Trenutna teža (kg):</label>
              <input
                type="number"
                v-model="formData.currentWeight"
                step="0.1"
                min="30"
                max="300"
                required
                class="form-control"
                placeholder="Npr. 85.5"
              />
            </div>

            <!-- zacetna teza -->
             <div class="form-group">
              <label>Začetna teža (kg):</label>
              <input
                type="number"
                v-model="formData.startWeight"
                step="0.1"
                min="30"
                max="300"
                required
                class="form-control"
                placeholder="Npr. 85.5"
              />
            </div>
            
            <!-- Ciljna teža -->
            <div class="form-group">
              <label>Ciljna teža (kg):</label>
              <input
                type="number"
                v-model="formData.goalWeight"
                step="0.1"
                min="30"
                max="600"
                required
                class="form-control"
                placeholder="Npr. 75"
              />
            </div>
            
            <!-- Napredek -->
            <div class="progress-section">
              <h4>📊 Napredek</h4>
              <div class="progress-info">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: weightProgressPercentage + '%' }"
                  ></div>
                </div>
                <div class="progress-text">
                  {{ weightProgressPercentage }}% zaključeno 
                  ({{ formData.currentWeight }}kg / {{ formData.goalWeight }}kg)
                </div>
              </div>
            </div>
          </div>
          
          <!-- KALORIJE (C) -->
          <div v-if="formData.goalType === 'C'" class="goal-specific-fields">
            <!-- Dnevne kalorije -->
            <div class="form-group">
              <label>Dnevni kalorijski vnos:</label>
              <input
                type="number"
                v-model="formData.cals"
                step="10"
                min="1000"
                max="10000"
                required
                class="form-control"
                placeholder="Npr. 2000"
              />
            </div>
          </div>
          
          <!-- FITNES (F) -->
          <div v-if="formData.goalType === 'F'" class="goal-specific-fields">
            <!-- Tip fitnesa -->
            <div class="form-group">
              <label>Tip fitnesa:</label>
              <div class="fitness-type-display">
                <span class="type-icon">{{ getFitnessEmoji(formData.fitnessType) }}</span>
                <span class="type-text">{{ getFitnessTypeText(formData.fitnessType) }}</span>
                <span class="type-hint">(Tip fitnesa se ne more spremeniti)</span>
              </div>
              <!-- Skrit input za fitness type -->
              <input type="hidden" v-model="formData.fitnessType" />
            </div>
            
            <!-- Specifična polja glede na fitness type -->
            <div v-if="formData.fitnessType === 'F'">
              <div class="form-group">
                <label>Kolikokrat na teden želite telovaditi:</label>
                <input
                  type="number"
                  v-model="formData.weeklyFitness"
                  min="0"
                  max="100"
                  required
                  class="form-control"
                  placeholder="Npr. 3"
                />
              </div>
            </div>
            
            <div v-else-if="formData.fitnessType === 'R'">
              <div class="form-group">
                <label>Tedenski kilometri:</label>
                <input
                  type="number"
                  v-model="formData.kms"
                  min="1"
                  max="400"
                  required
                  class="form-control"
                  placeholder="Npr. 10"
                />
              </div>
            </div>
            
            <div v-else-if="formData.fitnessType === 'S'">
              <div class="form-group">
                <label>Dnevni koraki:</label>
                <input
                  type="number"
                  v-model="formData.steps"
                  min="1000"
                  max="50000"
                  required
                  class="form-control"
                  placeholder="Npr. 10000"
                />
              </div>
            </div>
          </div>
          
          <!-- Datum začetka -->
          <div class="form-group">
            <label>Datum začetka:</label>
            <input
              type="date"
              v-model="formData.dateStart"
              required
              class="form-control"
            />
          </div>
          
          <!-- Datum konca -->
          <div class="form-group">
            <label>Datum konca (opcijsko):</label>
            <input
              type="date"
              v-model="formData.dateEnd"
              :min="formData.dateStart"
              class="form-control"
            />
          </div>
          
          <!-- Status -->
          <div class="form-group">
            <label>Status:</label>
            <select 
              v-model="formData.status" 
              required
              class="form-control"
            >
              <option value="active">Aktiven</option>
              <option value="in progress">V teku</option>
              <option value="completed">Dokončan</option>
              <option value="paused">Začasno ustavljen</option>
            </select>
          </div>
          
          <!-- Gumbi -->
          <div class="form-actions">
            <button type="button" @click="close" class="btn-cancel">
              Prekliči
            </button>
            <button 
              type="submit" 
              :disabled="saving || !isFormValid" 
              class="btn-save"
            >
              {{ saving ? 'Shranjujem...' : '💾 Shrani spremembe' }}
            </button>
          </div>
          
          <!-- Napake -->
          <div v-if="error" class="alert error">
            {{ error }}
          </div>
          
          <!-- Uspešno -->
          <div v-if="success" class="alert success">
            {{ success }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { goalApi } from '@/api'

export default {
  name: 'EditGoalForm',
  props: {
    show: Boolean,
    goal: Object // Cilj ki ga urejamo
  },
  data() {
    return {
      formData: {
        goalTitle: '',
        goalType: '', // F, C, W
        // FITNES (F)
        fitnessType: '', // F, R, S
        weeklyFitness: null,
        kms: null,
        steps: null,
        // CALORIES (C)
        cals: null,
        // WEIGHT (W)
        currentWeight: null,
        goalWeight: null,
        startWeight: null,
        // Splošno
        dateStart: '',
        dateEnd: '',
        status: 'active'
      },
      saving: false,
      error: null,
      success: null
    }
  },
  computed: {
    weightProgressPercentage() {
      if (!this.formData.currentWeight || !this.formData.goalWeight) return 0
      
      const current = parseFloat(this.formData.currentWeight)
      const goal = parseFloat(this.formData.goalWeight)
      
      if (current === goal) return 100
      if (goal === 0) return 0
      
      // Za izgubo teže (trenutna > ciljna)
      if (current > goal) {
        const progress = ((current - goal) / current) * 100
        return Math.min(Math.round(progress), 100)
      }
      // Za pridobivanje teže
      else {
        const progress = (current / goal) * 100
        return Math.min(Math.round(progress), 100)
      }
    },
    
    isFormValid() {
      // Osnovna validacija
      if (!this.formData.goalTitle || !this.formData.dateStart || !this.formData.status) {
        return false
      }
      
      // Validacija glede na tip cilja
      switch(this.formData.goalType) {
        case 'W':
          return !!(this.formData.currentWeight && this.formData.goalWeight && this.formData.startWeight)
        case 'C':
          return !!this.formData.cals
        case 'F':
          switch(this.formData.fitnessType) {
            case 'F': return !!this.formData.weeklyFitness
            case 'R': return !!this.formData.kms
            case 'S': return !!this.formData.steps
            default: return false
          }
        default:
          return false
      }
    }
  },
  watch: {
    goal: {
      immediate: true,
      handler(newGoal) {
        if (newGoal) {
          this.loadGoalData(newGoal)
        } else {
          this.resetForm()
        }
      }
    }
  },
  methods: {
    getEmoji(goalType) {
      switch(goalType) {
        case 'F': return '💪'
        case 'C': return '🍎'
        case 'W': return '⚖️'
        default: return '🎯'
      }
    },
    
    getGoalTypeText(goalType) {
      switch(goalType) {
        case 'F': return 'Fitnes'
        case 'C': return 'Dnevne kalorije'
        case 'W': return 'Ciljna teža'
        default: return 'Neznano'
      }
    },
    
    getFitnessEmoji(fitnessType) {
      switch(fitnessType) {
        case 'F': return '💪'
        case 'R': return '🏃'
        case 'S': return '👣'
        default: return '🏋️'
      }
    },
    
    getFitnessTypeText(fitnessType) {
      switch(fitnessType) {
        case 'F': return 'Telovadba (telovadb na teden)'
        case 'R': return 'Tek/hoja (km na teden)'
        case 'S': return 'Koraki (korakov na dan)'
        default: return 'Neznano'
      }
    },
    
    loadGoalData(goal) {
      console.log('Loading goal data for editing:', goal)
      
      const formatDate = (dateString) => {
        if (!dateString) return ''
        try {
          const date = new Date(dateString)
          // Preveri če je datum veljaven
          if (isNaN(date.getTime())) return ''
          return date.toISOString().split('T')[0]
        } catch (error) {
          console.error('Error formatting date:', dateString, error)
          return ''
        }
      }
      
      // Popolno polnjenje formData iz goal objekta
      this.formData = {
        goalTitle: goal.goalTitle || '',
        goalType: goal.goalType || '',
        // FITNES
        fitnessType: goal.fitnessType || '',
        weeklyFitness: goal.weeklyFitness || goal.weekly_fitness || null,
        kms: goal.kms || null,
        steps: goal.steps || null,
        // CALORIES
        cals: goal.cals || null,
        // WEIGHT
        currentWeight: goal.currentWeight || goal.currWeight || null,
        goalWeight: goal.goalWeight || null,
        startWeight: goal.startWeight || null,
        // Splošno
        dateStart: formatDate(goal.dateStart || goal.date_start),
        dateEnd: formatDate(goal.dateEnd || goal.date_end),
        status: goal.status || 'active'
      }
      
      console.log('Form data loaded:', this.formData)
    },
    
    resetForm() {
      this.formData = {
        goalTitle: '',
        goalType: '',
        fitnessType: '',
        weeklyFitness: null,
        kms: null,
        steps: null,
        cals: null,
        currentWeight: null,
        goalWeight: null,
        startWeight: null,
        dateStart: '',
        dateEnd: '',
        status: 'active'
      }
      this.error = null
      this.success = null
    },
    
    validateForm() {
      this.error = null
      
      // Validacija datumov
      if (this.formData.dateEnd && this.formData.dateStart > this.formData.dateEnd) {
        this.error = 'Datum konca mora biti kasneje od datuma začetka.'
        return false
      }
      
      // Validacija teže
      if (this.formData.goalType === 'W') {
        if (!this.formData.currentWeight || this.formData.currentWeight <= 0) {
          this.error = 'Trenutna teža mora biti pozitivno število.'
          return false
        }
        if (!this.formData.goalWeight || this.formData.goalWeight <= 0) {
          this.error = 'Ciljna teža mora biti pozitivno število.'
          return false
        }
        if (!this.formData.startWeight || this.formData.startWeight <= 0) {
          this.error = 'Začetna teža mora biti pozitivno število.'
          return false
        }
      }
      
      // Validacija kalorij
      if (this.formData.goalType === 'C') {
        if (!this.formData.cals || this.formData.cals < 1000 || this.formData.cals > 5000) {
          this.error = 'Dnevne kalorije morajo biti med 1000 in 5000 kcal.'
          return false
        }
      }
      
      // Validacija fitnesa
      if (this.formData.goalType === 'F') {
        if(this.formData.fitnessType == 'R') {
            if (!this.formData.kms || this.formData.kms < 1) {
              this.error = 'Kilometri morajo biti pozitivno število.'
              return false
            }
        }
      }
      
      return true
    },
    
    async submit() {
      this.saving = true
      this.error = null
      this.success = null
      
      // Validacija
      if (!this.validateForm()) {
        this.saving = false
        return
      }
      
      try {
        const goalData = {
          //id: this.goal.id 
          goalTitle: this.formData.goalTitle,
          goalType: this.formData.goalType,
          status: this.formData.status,
          dateStart: this.formData.dateStart,
          dateEnd: this.formData.dateEnd || null
        }
        
        switch(this.formData.goalType) {
          case 'F':
            goalData.fitnessType = this.formData.fitnessType
            if (this.formData.fitnessType === 'F') {
              goalData.weeklyFitness = parseInt(this.formData.weeklyFitness)
              goalData.weeklyFitnessDone = this.goal.weeklyFitnessDone || this.goal.weekly_fitness_done 
            } else if (this.formData.fitnessType === 'R') {
              goalData.kms = parseFloat(this.formData.kms)
              goalData.kmsDone = this.goal.kmsDone || 0
            } else if (this.formData.fitnessType === 'S') {
              goalData.steps = parseInt(this.formData.steps)
              goalData.stepsDone = this.goal.stepsDone || 0
            }
            break
          case 'C':
            goalData.cals = parseInt(this.formData.cals)
            goalData.eatenCals = this.goal.eatenCals || 0
            break
          case 'W':
            goalData.currentWeight = parseFloat(this.formData.currentWeight)
            goalData.goalWeight = parseFloat(this.formData.goalWeight)
            goalData.startWeight = parseFloat(this.formData.startWeight)
            break
        }
        
        console.log('Sending update data:', goalData)
        
        
        console.log("UREjamo: ", goalData)
        const response = await goalApi.put(`/updateGoal?id=${this.goal.id}`, goalData)
        
        console.log('Update response:', response.data)
        
        // Uspešno sporočilo
        this.success = 'Cilj uspešno posodobljen!'
        
        // Emitiraj dogodek za osvežitev
        setTimeout(() => {
          this.$emit('goal-updated')
          this.close()
        }, 1500)
        
      } catch (error) {
        console.error('Napaka pri posodabljanju cilja:', error)
        
        // Boljše obravnavanje napak
        let errorMessage = 'Napaka pri shranjevanju sprememb.'
        
        if (error.response) {
          // Server je odgovoril z napako
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.status === 404) {
            errorMessage = 'Cilj ni najden. Preverite, če še obstaja.'
          } else if (error.response.status === 400) {
            errorMessage = 'Neveljavi podatki. Preverite vnesene vrednosti.'
          } else if (error.response.status === 500) {
            errorMessage = 'Napaka na strežniku. Poskusite ponovno kasneje.'
          }
        } else if (error.request) {
          errorMessage = 'Ni odziva s strežnika. Preverite povezavo.'
        }
        
        this.error = errorMessage
        
      } finally {
        this.saving = false
      }
    },
    
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.edit-goal-modal {
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
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px 20px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  border-color: #f5576c;
  background: white;
  box-shadow: 0 0 0 4px rgba(245, 87, 108, 0.15);
}

/* Display za tip cilja in fitness type */
.goal-type-display,
.fitness-type-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
}

.type-icon {
  font-size: 20px;
}

.type-text {
  font-weight: 600;
  color: #2c3e50;
}

.type-hint {
  color: #7f8c8d;
  font-size: 14px;
  margin-left: auto;
  font-style: italic;
}

/* Goal specific fields */
.goal-specific-fields {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

/* Progress section */
.progress-section {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.progress-section h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
}

.progress-bar {
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f093fb, #f5576c);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  color: #666;
  font-weight: 600;
  font-size: 14px;
}

/* Form actions */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  box-shadow: 0 5px 15px rgba(245, 87, 108, 0.3);
}

.btn-save:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

/* Alerts */
.alert {
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  margin-top: 15px;
}

.error {
  background: #ffeaea;
  color: #c0392b;
  border: 2px solid #f5c6cb;
}

.success {
  background: #d5f4e6;
  color: #27ae60;
  border: 2px solid #a3e4c3;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}
</style>