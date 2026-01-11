<template>
  <div v-if="show" class="edit-goal-modal">
    <div class="modal-overlay" @click="close"></div>
    
    <div class="modal-content">
      <div class="modal-header">
        <h2>Uredi cilj</h2>
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
            <input type="hidden" v-model="formData.goalType" />
          </div>
          
          
          <!-- TEŽA (W) -->
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
              <small class="form-hint">Trenutna teža se uporablja za izračun napredka.</small>
            </div>
            
            <!-- Ciljna teža -->
            <div class="form-group">
              <label>Ciljna teža (kg):</label>
              <input
                type="number"
                v-model="formData.goalWeight"
                step="0.1"
                min="30"
                max="300"
                required
                class="form-control"
                placeholder="Npr. 75"
              />
            </div>
            
            <!-- Začetna teža (skrito ali samo za branje) -->
            <div class="form-group" v-if="formData.startWeight">
              <label>Začetna teža (kg):</label>
              <div class="readonly-field">
                {{ formData.startWeight }}
                <small class="form-hint">Začetna teža se ne more spremeniti.</small>
              </div>
              <!-- Skrito polje za začetno težo -->
              <input type="hidden" v-model="formData.startWeight" />
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
              <option value="in progress">V teku</option>
              <option value="completed">Dokončan</option>
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
              {{ saving ? 'Shranjujem...' : 'Shrani spremembe' }}
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
      success: null,
      userId: null
    }
  },
  computed: {    
    isFormValid() {
      if (!this.formData.goalTitle || !this.formData.dateStart || !this.formData.status) {
        return false
      }

      switch(this.formData.goalType) {
        case 'W':
          return !!(this.formData.currentWeight && this.formData.goalWeight)
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
  async mounted() {
    await this.getCurrentUser();
  },
  methods: {
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
          if (isNaN(date.getTime())) return ''
          return date.toISOString().split('T')[0]
        } catch (error) {
          console.error('Error formatting date:', dateString, error)
          return ''
        }
      }

      const getCurrentWeight = () => {
        return goal.currentWeight || 
               goal.currWeight || 
               (goal.goalType === 'W' ? goal.currentWeight || goal.currWeight : null) ||
               null
      }
      
      const getStartWeight = () => {
        return goal.startWeight || 
               (goal.goalType === 'W' ? (goal.startWeight || goal.currWeight) : null) ||
               null
      }
      
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
        currentWeight: getCurrentWeight(),
        goalWeight: goal.goalWeight || null,
        startWeight: getStartWeight(),
        // Splošno
        dateStart: formatDate(goal.dateStart || goal.date_start),
        dateEnd: formatDate(goal.dateEnd || goal.date_end),
        status: goal.status || 'active'
      }
      
      // Debug log
      console.log('Form data loaded for weight goal:', {
        currentWeight: this.formData.currentWeight,
        goalWeight: this.formData.goalWeight,
        startWeight: this.formData.startWeight,
        originalGoal: goal
      })
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
      if (this.formData.dateEnd && this.formData.dateStart > this.formData.dateEnd) {
        this.error = 'Datum konca mora biti kasneje od datuma začetka.'
        return false
      }
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
          this.formData.startWeight = this.formData.currentWeight
        }
        if (this.formData.goalWeight > 300) {
          this.error = 'Ciljna teža ne sme biti večja od 300 kg.'
          return false
        }
        
        if (this.formData.currentWeight > 300) {
          this.error = 'Trenutna teža ne sme biti večja od 300 kg.'
          return false
        }
      }
      if (this.formData.goalType === 'C') {
        if (!this.formData.cals || this.formData.cals < 1000 || this.formData.cals > 5000) {
          this.error = 'Dnevne kalorije morajo biti med 1000 in 5000 kcal.'
          return false
        }
      }
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
      
      if (!this.validateForm()) {
        this.saving = false
        return
      }
      
      try {
        const goalData = {
          goalTitle: this.formData.goalTitle,
          goalType: this.formData.goalType,
          status: this.formData.status,
          dateStart: this.formData.dateStart,
          dateEnd: this.formData.dateEnd || null,
          userId: this.userId
        }
        
        switch(this.formData.goalType) {
          case 'F':
            goalData.fitnessType = this.formData.fitnessType
            if (this.formData.fitnessType === 'F') {
              goalData.weeklyFitness = parseInt(this.formData.weeklyFitness)
              goalData.weeklyFitnessDone = this.goal.weeklyFitnessDone || this.goal.weekly_fitness_done || 0
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
            // TEŽA
            goalData.currentWeight = parseFloat(this.formData.currentWeight)
            goalData.goalWeight = parseFloat(this.formData.goalWeight)
            goalData.startWeight = parseFloat(this.formData.startWeight || this.formData.currentWeight)

            goalData.currWeight = parseFloat(this.formData.currentWeight)
            break
        }
        
        console.log('Sending update data for weight goal:', goalData)

        if (this.formData.goalType === 'W') {
          if (!goalData.currentWeight || !goalData.goalWeight) {
            throw new Error('Manjkajo podatki o teži')
          }
        }
        
        const response = await goalApi.put(`/updateGoal?id=${this.goal.id}`, goalData)
        
        console.log('Update response:', response.data)

        this.success = 'Cilj uspešno posodobljen!'

        setTimeout(() => {
          this.$emit('goal-updated')
          this.close()
        }, 1500)
        
      } catch (error) {
        console.error('Napaka pri posodabljanju cilja:', error)
        
        let errorMessage = 'Napaka pri shranjevanju sprememb.'
        
        if (error.response) {
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
        } else if (error.message) {
          errorMessage = error.message
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
  @import '@/style/EditGoalForm.css';
</style>
