<template>
  <div class="goals-container">
    <!-- Header -->
    <header class="goals-header">
      <h1> Upravljanje ciljev</h1>
      <button @click="goToDashboard" class="back-btn">← Nazaj na Dashboard</button>
    </header>

    <main class="goals-main">
      <!-- Edit Goal Modal -->
      <edit-goal-form
        :show="showEditGoalModal"
        :goal="selectedGoal"
        @close="showEditGoalModal = false"
        @goal-updated="loadAllGoals"
      />
      <add-progress-form
        v-if="showUpdateGoal"
        :goal="updatingGoal"
        :show="showUpdateGoal"
        @close="closeUpdateModal"
        @progress-added="handleProgressAdded"
      />
       <!-- Sporočila na vrhu -->
      <div v-if="error" class="alert alert-error top-alert">
        <span>{{ error }}</span>
        <button @click="error = null" class="alert-close">×</button>
      </div>
      <div v-if="successMessage" class="alert alert-success top-alert">
        <span>{{ successMessage }}</span>
        <button @click="successMessage = null" class="alert-close">×</button>
      </div>
      <!-- Današnji cilji -->
      <section class="card today-goals">
        <div class="card-header">
          <h2>Moji cilji</h2>
          <div class="header-actions">
            <!-- Filter gumbi -->
            <div class="filter-buttons">
              <button 
                @click="filterStatus = 'all'" 
                class="filter-btn"
                :class="{ active: filterStatus === 'all' }"
              >
                Vsi
              </button>
              <button 
                @click="filterStatus = 'in progress'" 
                class="filter-btn"
                :class="{ active: filterStatus === 'in progress' }"
              >
                V teku
              </button>
              <button 
                @click="filterStatus = 'completed'" 
                class="filter-btn"
                :class="{ active: filterStatus === 'completed' }"
              >
                Dokončani
              </button>
            </div>
            
            <div class="action-buttons-header">
              <button @click="startAddGoal" class="refresh-btn">
                + Dodaj cilj
              </button>
              <button @click="loadAllGoals" class="refresh-btn" :disabled="isLoading">
                {{ isLoading ? 'Nalagam...' : 'Osveži' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Povzetek -->
        <div class="summary">
          <div class="summary-item">
            <span class="label">Skupaj ciljev:</span>
            <span class="value">{{ goals.length }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Aktivni cilji:</span>
            <span class="value active">{{ activeGoalsCount }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Dokončani:</span>
            <span class="value completed">{{ completedGoalsCount }}</span>
          </div>
          <!-- Prikaz trenutnega filtra -->
          <div class="summary-item" v-if="filterStatus !== 'all'">
            <span class="label">Prikazujem:</span>
            <span class="value" :class="filterStatus === 'in progress' ? 'active' : 'completed'">
              {{ filterStatus === 'in progress' ? 'V teku' : 'Dokončane' }}
            </span>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>Nalagam cilje...</p>
        </div>

        <!-- Brez ciljev -->
        <div v-else-if="filteredGoals.length === 0" class="no-goals">
          <div class="no-goals-content">
            <div class="no-goals-icon">
              <span v-if="filterStatus === 'all'"></span>
              <span v-else-if="filterStatus === 'in progress'"></span>
              <span v-else></span>
            </div>
            <h3>
              <span v-if="filterStatus === 'all'">Še nimaš nobenih ciljev</span>
              <span v-else-if="filterStatus === 'in progress'">Ni ciljev v teku</span>
              <span v-else>Ni dokončanih ciljev</span>
            </h3>
            <p>
              <span v-if="filterStatus === 'all'">Dodaj svoj prvi cilj za začetek sledenja napredku!</span>
              <span v-else-if="filterStatus === 'in progress'">Vsi cilji so dokončani ali še nimaš aktivnih ciljev.</span>
              <span v-else>Še nimaš dokončanih ciljev. Nadaljuj z delom na aktivnih ciljih!</span>
            </p>
            <button v-if="filterStatus !== 'all'" @click="filterStatus = 'all'" class="add-first-goal-btn">
              Prikaži vse cilje
            </button>
            <button v-else @click="startAddGoal" class="add-first-goal-btn">
              + Dodaj prvi cilj
            </button>
          </div>
        </div>

        <!-- Seznam ciljev -->
        <div v-else class="goals-list">
          <div v-for="goal in filteredGoals" :key="goal.id" class="goal-card">
            <div class="goal-header">
              <div class="goal-type">
                <div class="type-icon">
                  {{ getEmoji(goal.goalType) }}
                </div>
                <div>
                  <h3>{{ goal.goalTitle }}</h3>
                  <div class="goal-status" :class="goal.status">
                    {{ getStatusText(goal.status) }}
                  </div>
                </div>
              </div>
              <div class="goal-info">
                <span class="time">{{ formatDate(goal.dateStart) }}</span>
                <span v-if="goal.dateEnd" class="time">→ {{ formatDate(goal.dateEnd) }}</span>
              </div>
            </div>

            <!-- Opis cilja -->
            <div class="goal-description">
              <h4>Opis:</h4>
              <p>{{ getGoalDescription(goal) }}</p>
              
              <!-- Napredek -->
              <div class="goal-progress">
                <div class="progress-text">
                  <span class="current">{{ getCurrentValue(goal) }}</span>
                  <span class="separator">/</span>
                  <span class="target">{{ getTargetValue(goal) }} {{ getUnit(goal) }}</span>
                  <span class="percentage">({{ calculatePercentage(goal) }}%)</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: calculatePercentage(goal) + '%' }"
                    :class="{ completed: calculatePercentage(goal) >= 100 }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Akcije -->
            <div class="goal-actions">
              <span class="goal-date">Zadnja sprememba: {{ formatDate(goal.dateStart) }}</span>              
              <div class="action-buttons">
                <button 
                  v-if="!(goal.goalType === 'F' && goal.fitnessType === 'F')"
                  @click="updateProgress(goal)" 
                  class="action-btn add-btn"
                  title="Dodaj napredek"
                >
                  Dodaj napredek
                </button>
                <button 
                  v-if="goal.goalType === 'F' && goal.fitnessType === 'F'"
                  @click="updateProgress(goal)"
                  class="action-btn add-btn"
                  title="Zabeleži kalorije"
                >
                  Zabeleži kalorije
                </button>
                <button 
                  v-if="goal.goalType === 'F' && goal.fitnessType === 'F'"
                  @click="addExercise(goal.id)"
                  class="action-btn add-btn"
                  title="Dodaj telovadbo"
                >
                  Dodaj telovadbo
                </button>
                <button 
                  @click="openEditGoal(goal)" 
                  class="action-btn edit-btn"
                  title="Uredi cilj"
                >
                  Uredi
                </button>
                <button 
                  @click="deleteGoal(goal.id)" 
                  class="action-btn delete-btn"
                  title="Izbriši cilj"
                >
                  Izbriši
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dodaj cilj form -->
      <div v-if="showAddGoalForm" class="modal-overlay" @click="resetForm"></div>
      <div v-if="showAddGoalForm" class="add-goal-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Dodaj nov cilj</h2>
            <button @click="resetForm" class="close-btn">×</button>
          </div>
          
          <div class="modal-body">
            <div class="goal-creation-flow">
              <!-- Korak 1: Osnovni podatki -->
              <div class="step" v-if="currentStep === 1">
                <h3>1. Osnovni podatki</h3>
                
                <div class="form-group">
                  <label for="goalTitle">Ime cilja:</label>
                  <input
                    id="goalTitle"
                    v-model="newGoal.goalTitle"
                    placeholder="Na primer: Redno telovaditi"
                    class="form-control"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label for="goalType">Tip cilja:</label>
                  <select 
                    id="goalType"
                    v-model="newGoal.goalType" 
                    class="form-control" 
                    required
                    @change="onGoalTypeChange"
                  >
                    <option value="" disabled selected>Izberi tip cilja</option>
                    <option value="F">💪 Fitnes</option>
                    <option 
                      value="C" 
                      :disabled="hasCalorieGoal"
                      :class="{ 'disabled-option': hasCalorieGoal }"
                    >
                      <span v-if="hasCalorieGoal">Dnevne kalorije (že obstaja)</span>
                      <span v-else>🍎 Dnevne kalorije</span>
                    </option>
                    <option 
                      value="W" 
                      :disabled="hasWeightGoal"
                      :class="{ 'disabled-option': hasWeightGoal }"
                    >
                      <span v-if="hasWeightGoal">Ciljna teža (že obstaja)</span>
                      <span v-else>⚖️ Ciljna teža</span>
                    </option>
                  </select>
                  
                  <!-- Prikaz opozoril samo če je tip izbran -->
                  <div v-if="newGoal.goalType === 'C' && hasCalorieGoal" class="alert warning">
                    Že imate cilj za dnevne kalorije! Uporabite lahko samo fitnes cilje.
                  </div>
                  <div v-if="newGoal.goalType === 'W' && hasWeightGoal" class="alert warning">
                    Že imate cilj za ciljno težo! Uporabite lahko samo fitnes cilje.
                  </div>
                </div>
                
                <div class="form-actions">
                  <button @click="resetForm" class="btn-cancel">Prekliči</button>
                  <button 
                    @click="nextStep" 
                    class="btn-next" 
                    :disabled="!canProceedToStep2 || (newGoal.goalType === 'C' && hasCalorieGoal) || (newGoal.goalType === 'W' && hasWeightGoal)"
                  >
                    Naprej →
                  </button>
                </div>
              </div>

              <!-- Korak 2: Specifični podatki -->
              <div class="step" v-if="currentStep === 2">
                <h3>2. Določi podrobnosti</h3>
                
                <!-- FITNES -->
                <div v-if="newGoal.goalType === 'F'">
                  <p class="step-description">Izberi kakšen fitnes cilj imaš:</p>
                  
                  <div class="fitness-options">
                    <div class="option-card" :class="{ selected: newGoal.fitnessType === 'F' }">
                      <label class="option-label">
                        <input 
                          type="radio" 
                          v-model="newGoal.fitnessType" 
                          value="F" 
                          class="option-radio"
                        />
                        <span class="option-text">
                          <strong>Telovadba</strong><br>
                          <small>Kolikokrat na teden želite telovaditi</small>
                        </span>
                      </label>
                      <div v-if="newGoal.fitnessType === 'F'" class="option-input">
                        <input
                          v-model="newGoal.weeklyFitness"
                          type="number"
                          step="1"
                          min="1"
                          max="7"
                          placeholder="Na primer: 3"
                          class="form-control"
                          required
                        />
                      </div>
                    </div>
                    
                    <div class="option-card" :class="{ selected: newGoal.fitnessType === 'R' }">
                      <label class="option-label">
                        <input 
                          type="radio" 
                          v-model="newGoal.fitnessType" 
                          value="R" 
                          class="option-radio"
                        />
                        <span class="option-text">
                          <strong>Tek/hoja</strong><br>
                          <small>Koliko kliometrov na teden želite prehoditi ali preteči</small>
                        </span>
                      </label>
                      <div v-if="newGoal.fitnessType === 'R'" class="option-input">
                        <input
                          v-model="newGoal.kms"
                          type="number"
                          step="0.1"
                          min="1"
                          placeholder="Na primer: 10"
                          class="form-control"
                          required
                        />
                      </div>
                    </div>
                    
                    <div class="option-card" :class="{ selected: newGoal.fitnessType === 'S' }">
                      <label class="option-label">
                        <input 
                          type="radio" 
                          v-model="newGoal.fitnessType" 
                          value="S" 
                          class="option-radio"
                        />
                        <span class="option-text">
                          <strong>Koraki</strong><br>
                          <small>Korakov na dan</small>
                        </span>
                      </label>
                      <div v-if="newGoal.fitnessType === 'S'" class="option-input">
                        <input
                          v-model="newGoal.steps"
                          type="number"
                          step="100"
                          min="1000"
                          placeholder="Na primer: 10000"
                          class="form-control"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- KALORIJE (samo če ni že obstoječega) -->
                <div v-if="newGoal.goalType === 'C' && !hasCalorieGoal">
                  <p class="step-description">Kolikšen naj bo vaš dnevni kalorijski vnos</p>
                  <div class="form-group">
                    <label for="cals">Dnevne kalorije:</label>
                    <input
                      id="cals"
                      v-model="newGoal.cals"
                      type="number"
                      step="10"
                      min="1000"
                      max="5000"
                      placeholder="Na primer: 2000"
                      class="form-control"
                      required
                    />
                  </div>
                </div>

                <!-- TEŽA (samo če ni že obstoječega) -->
                <div v-if="newGoal.goalType === 'W' && !hasWeightGoal">
                  <p class="step-description">Vnesi trenutno in želeno težo:</p>
                  
                  <div class="weight-inputs">
                    <div class="form-group">
                      <label for="currWeight">Trenutna teža (kg):</label>
                      <input
                        id="currWeight"
                        v-model="newGoal.currWeight"
                        type="number"
                        step="0.1"
                        min="30"
                        max="200"
                        placeholder="Na primer: 80"
                        class="form-control"
                        required
                      />
                    </div>
                    
                    <div class="form-group">
                      <label for="goalWeight">Ciljna teža (kg):</label>
                      <input
                        id="goalWeight"
                        v-model="newGoal.goalWeight"
                        type="number"
                        step="0.1"
                        min="30"
                        max="200"
                        placeholder="Na primer: 75"
                        class="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <!-- Prikaz če poskušaš dodati že obstoječ tip -->
                <div v-if="(newGoal.goalType === 'C' && hasCalorieGoal) || (newGoal.goalType === 'W' && hasWeightGoal)" class="alert error">
                  <h4>Ne moreš dodati tega cilja!</h4>
                  <p v-if="newGoal.goalType === 'C'">Že imate cilj za dnevne kalorije. Uredite obstoječi cilj ali izberite fitnes cilj.</p>
                  <p v-if="newGoal.goalType === 'W'">Že imate cilj za ciljno težo. Uredite obstoječi cilj ali izberite fitnes cilj.</p>
                  <button @click="newGoal.goalType = 'F'" class="btn-cancel">
                    Izberi fitnes cilj
                  </button>
                </div>
                
                <div class="form-actions">
                  <button @click="prevStep" class="btn-prev">← Nazaj</button>
                  <button 
                    @click="nextStep" 
                    class="btn-next" 
                    :disabled="!isStep2Valid || (newGoal.goalType === 'C' && hasCalorieGoal) || (newGoal.goalType === 'W' && hasWeightGoal)"
                  >
                    Naprej →
                  </button>
                </div>
              </div>

              <!-- Korak 3: Datumi -->
              <div class="step" v-if="currentStep === 3">
                <h3>3. Časovni okvir</h3>
                
                <div class="form-group">
                  <label for="dateStart">Začetni datum:</label>
                  <input
                    id="dateStart"
                    v-model="newGoal.dateStart"
                    type="date"
                   
                    class="form-control"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label for="dateEnd">Končni datum (opcijsko):</label>
                  <input
                    id="dateEnd"
                    v-model="newGoal.dateEnd"
                    type="date"
                    :min="newGoal.dateStart"
                    class="form-control"
                  />
                </div>
                
                <div class="form-actions">
                  <button @click="prevStep" class="btn-prev">← Nazaj</button>
                  <button 
                    @click="addGoal" 
                    class="btn-save" 
                    :disabled="!newGoal.dateStart || (newGoal.goalType === 'C' && hasCalorieGoal) || (newGoal.goalType === 'W' && hasWeightGoal)"
                  >
                    Dodaj cilj 
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Sporočila na dnu -->
      <div v-if="error" class="alert alert-error bottom-alert">
        <span>{{ error }}</span>
        <button @click="error = null" class="alert-close">×</button>
      </div>
      
      <div v-if="successMessage" class="alert alert-success bottom-alert">
        <span>{{ successMessage }}</span>
        <button @click="successMessage = null" class="alert-close">×</button>
      </div>
    </main>
  </div>
</template>

<script>
import { goalApi } from '@/api';
import EditGoalForm from '@/components/EditGoalForm.vue';
import AddProgressForm from '@/components/AddProgressForm.vue';

export default {
  components: {
    EditGoalForm,
    AddProgressForm
  },
  name: 'GoalManager',
  data() {
    return {
      showEditGoalModal: false,
      showUpdateGoal: false,
      selectedGoal: null,
      updatingGoal: null,
      error:null,
      successMessage: null,
      goals: [],
      isLoading: false,
      showAddGoalForm: false,
      currentStep: 1,
      filterStatus: 'all',
      newGoal: {
        goalTitle: '',
        goalType: '',
        
        // FITNES (F)
        fitnessType: '',
        weeklyFitness: null,
        kms: null,
        steps: null,
        
        // CALORIES (C)
        cals: null,
        
        // WEIGHT (W)
        currWeight: null,
        goalWeight: null,
        startWeight: null,

        // Splošno
        dateStart: '',
        dateEnd: '',
        status: 'in progress'
      }
    }
  },
  computed: {
    filteredGoals() {
      if (this.filterStatus === 'all') {
        return this.goals;
      }
      return this.goals.filter(goal => goal.status === this.filterStatus);
    },
    
    activeGoalsCount() {
      return this.goals.filter(g => g.status === 'in progress').length;
    },
    
    completedGoalsCount() {
      return this.goals.filter(g => g.status === 'completed').length;
    },
    
    hasCalorieGoal() {
      return this.goals.some(g => g.goalType === 'C' && (g.status === 'in progress'));
    },
    
    hasWeightGoal() {
      return this.goals.some(g => g.goalType === 'W' && (g.status === 'in progress'));
    },
    
    canProceedToStep2() {
      return this.newGoal.goalTitle.trim() && this.newGoal.goalType;
    },
    
    isStep2Valid() {
      if (!this.newGoal.goalType) return false;
      if ((this.newGoal.goalType === 'C' && this.hasCalorieGoal) || 
          (this.newGoal.goalType === 'W' && this.hasWeightGoal)) {
        return false;
      }
      
      switch(this.newGoal.goalType) {
        case 'F':
          if (!this.newGoal.fitnessType) return false;
          switch(this.newGoal.fitnessType) {
            case 'F': return !!this.newGoal.weeklyFitness;
            case 'R': return !!this.newGoal.kms;
            case 'S': return !!this.newGoal.steps;
            default: return false;
          }
        case 'C': return !!this.newGoal.cals;
        case 'W': 
          return !!this.newGoal.currWeight && !!this.newGoal.goalWeight;
        default: return false;
      }
    }
  }, 
  async mounted() {
    await this.getCurrentUser()
    await this.loadAllGoals();
  },
  methods: {
    goToDashboard() {
      this.$router.push('/dashboard');
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
    
    openEditGoal(goal) {
      this.selectedGoal = goal;
      this.showEditGoalModal = true;
    },

    showSuccess(message) {
      this.successMessage = message;
      this.error = null; 

      setTimeout(() => {
        this.successMessage = null;
      }, 5000);
    },
    showError(message) {
      this.error = message;
      this.successMessage = null; 

      setTimeout(() => {
        this.error = null;
      }, 5000);
    },
    
    async addExercise(goald){
      const response = await goalApi.put(`/updateProgressFitness?id=${goald}&num=1`);
      await this.loadAllGoals();
    },

    updateProgress(goal) {
      this.updatingGoal = goal;
      this.showUpdateGoal = true;
    },
    
    closeUpdateModal() {
      console.log('🚪 Zapiranje modala');
      this.showUpdateGoal = false;
      this.updatingGoal = null;
    },
    
    handleProgressAdded() {
      this.loadAllGoals();
      this.closeUpdateModal();
      this.showSuccess('Napredek uspešno dodan!');
    },
    
    getEmoji(goalType) {
      switch(goalType) {
        case 'F': return '💪';
        case 'C': return '🍎';
        case 'W': return '⚖️';
        default: return '🎯';
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        'in progress': 'V teku',
        'completed': 'Dokončan',
      };
      return statusMap[status] || status; 
    },
    
    getGoalDescription(goal) {
      switch(goal.goalType) {
        case 'F':
          switch(goal.fitnessType) {
            case 'F': return `${goal.weeklyFitness} telovadb v tednu`;
            case 'R': return `${goal.kms} kilometrov v tednu`;
            case 'S': return `${goal.steps} korakov na dan `;
            default: return 'Fitnes cilj';
          }
        case 'C':
          return `${goal.cals} kcal v dnevu`;
        case 'W':
          return `Od ${goal.startWeight || 0}kg do ${goal.goalWeight}kg`;
        default:
          return goal.goalType;
      }
    },
    
    getCurrentValue(goal) {
      switch(goal.goalType) {
        case 'F': 
          const ftype = goal.fitnessType;
          if(ftype == 'F'){
            return goal.weeklyFitnessDone;
          }
          else if(ftype == 'R'){
            return goal.kmsDone;
          }
          else{ //S
            return goal.stepsDone;
          }
        case 'C': return goal.eatenCals;
        case 'W': 
          return goal.currentWeight || goal.currWeight || 0;
        default: return 0;
      }
    },
    
    getTargetValue(goal) {
      switch(goal.goalType) {
        case 'F':
          switch(goal.fitnessType) {
            case 'F': return goal.weeklyFitness;
            case 'R': return goal.kms;
            case 'S': return goal.steps;
            default: return 0;
          }
        case 'C': return goal.cals;
        case 'W': return goal.goalWeight;
        default: return 0;
      }
    },
    
    getUnit(goal) {
      switch(goal.goalType) {
        case 'F':
          switch(goal.fitnessType) {
            case 'F': return 'krat';
            case 'R': return 'km';
            case 'S': return 'korakov';
            default: return '';
          }
        case 'C': return 'kcal';
        case 'W': return 'kg';
        default: return '';
      }
    },
    
    calculatePercentage(goal) {
      const current = this.getCurrentValue(goal);
      const target = this.getTargetValue(goal) || 1;
      const goalType = goal.goalType;
      const status = goal.status;

      if (goalType === 'W') {
        const startWeight = parseFloat(goal.startWeight);
        const currentWeight = parseFloat(current);
        const targetWeight = parseFloat(target);

        if (startWeight === targetWeight) return 100;
        if (targetWeight === 0) return 0;

        if (targetWeight < startWeight) {
          if (currentWeight >= startWeight) return 0;

          const lostWeight = startWeight - currentWeight;
          const totalToLose = startWeight - targetWeight;

          let percentage = (lostWeight / totalToLose) * 100;

          return Math.round(percentage);
        }
        if (targetWeight > startWeight) {
          if (currentWeight <= startWeight) return 0;
          
          const gainedWeight = currentWeight - startWeight;
          const totalToGain = targetWeight - startWeight;
          
          let percentage = (gainedWeight / totalToGain) * 100;
          return Math.round(percentage);
        }
        
        return 100;
      }
      if (target === 0) return 0;

      let percentage = (current / target) * 100;
      return Math.round(percentage);
    },
        
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('sl-SI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    
    async loadAllGoals() {
      this.isLoading = true;
      try {
        const response = await goalApi.get(`/allGoals?userId=${this.userId}`);
        this.goals = response.data || [];

        for (const goal of this.goals) {
          console.log("goal loaded:", goal);
        }
      } catch (error) {
        alert('Napaka pri nalaganju ciljev: ' + error.message);
      } finally {
        this.isLoading = false;
      }
    },
    
     async addGoal() {
      try {
        if (this.newGoal.goalType === 'C' && this.hasCalorieGoal) {
          this.showError('Ne morete dodati novega kalorijskega cilja, ker že imate enega!');
          return;
        }
        
        if (this.newGoal.goalType === 'W' && this.hasWeightGoal) {
          this.showError('Ne morete dodati novega cilja za težo, ker že imate enega!');
          return;
        }

        const goalData = {
          goalTitle: this.newGoal.goalTitle,
          goalType: this.newGoal.goalType,
          dateStart: this.newGoal.dateStart,
          dateEnd: this.newGoal.dateEnd || null,
          status: 'in progress',
          userId: this.userId,
        };

        switch(this.newGoal.goalType) {
          case 'F':
            goalData.fitnessType = this.newGoal.fitnessType;
            if (this.newGoal.fitnessType === 'F') {
              goalData.weeklyFitness = this.newGoal.weeklyFitness;
              goalData.weeklyFitnessDone = 0;
            } else if (this.newGoal.fitnessType === 'R') {
              goalData.kms = this.newGoal.kms;
              goalData.kmsDone = 0;
            } else if (this.newGoal.fitnessType === 'S') {
              goalData.steps = this.newGoal.steps;
              goalData.stepsDone = 0;
            }
            break;
          case 'C':
            goalData.cals = this.newGoal.cals;
            goalData.eatenCals = 0;
            break;
          case 'W':
            goalData.currWeight = this.newGoal.currWeight;
            goalData.goalWeight = this.newGoal.goalWeight;
            goalData.startWeight = this.newGoal.currWeight; 
            goalData.currentWeight = this.newGoal.currWeight; 
            break;
        }

        const response = await goalApi.post('/addGoal', goalData);
        await this.loadAllGoals();
        this.resetForm();
        this.showSuccess('Cilj uspešno dodan!');

      } catch (error) {
        console.error('Napaka pri dodajanju cilja:', error);
        this.showError('Napaka pri dodajanju cilja: ' + error.message);
      }
    },
    
    async deleteGoal(id) {
      if (!confirm('Ste prepričani, da želite izbrisati ta cilj?')) {
        return;
      }
      
      try {
        await goalApi.delete(`/deleteGoal?id=${id}`);
        this.loadAllGoals();
        this.showSuccess('Cilj uspešno izbrisan!');
      } catch (error) {
        console.error('Napaka pri brisanju cilja:', error);
        this.showError('Napaka pri brisanju cilja: ' + error.message);
      }
    },

    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++;
      }
    },
    
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    
    onGoalTypeChange() {
      this.newGoal.fitnessType = '';
      this.newGoal.weeklyFitness = null;
      this.newGoal.kms = null;
      this.newGoal.steps = null;
      this.newGoal.cals = null;
      this.newGoal.currWeight = null;
      this.newGoal.goalWeight = null;
      this.newGoal.startWeight = null;
    },
    
    startAddGoal() {
      this.showAddGoalForm = true;
      this.currentStep = 1;
      this.resetNewGoal();
    },
    
    resetForm() {
      this.resetNewGoal();
      this.currentStep = 1;
      this.showAddGoalForm = false;
    },
    
    resetNewGoal() {
      this.newGoal = {
        goalTitle: '',
        goalType: '',
        fitnessType: '',
        weeklyFitness: null,
        kms: null,
        steps: null,
        cals: null,
        currWeight: null,
        goalWeight: null,
        dateStart: '',
        dateEnd: '',
        status: 'in progress'
      };
    }
  },
}
</script>

<style scoped>
  @import '@/style/GoalManagerView.css';
</style>
