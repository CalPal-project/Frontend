<template>
  <div class="goals-container">
    <!-- Header -->
    <header class="goals-header">
      <h1>🎯 Upravljanje ciljev</h1>
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
        <span class="alert-icon">❌</span>
        <span>{{ error }}</span>
        <button @click="error = null" class="alert-close">×</button>
      </div>
      <div v-if="successMessage" class="alert alert-success top-alert">
        <span class="alert-icon">✅</span>
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
          <p>⏳ Nalagam cilje...</p>
        </div>

        <!-- Brez ciljev -->
        <div v-else-if="filteredGoals.length === 0" class="no-goals">
          <div class="no-goals-content">
            <div class="no-goals-icon">
              <span v-if="filterStatus === 'all'">🎯</span>
              <span v-else-if="filterStatus === 'in progress'">⏳</span>
              <span v-else>✅</span>
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
                    ⚠️ Že imate cilj za dnevne kalorije! Uporabite lahko samo fitnes cilje.
                  </div>
                  <div v-if="newGoal.goalType === 'W' && hasWeightGoal" class="alert warning">
                    ⚠️ Že imate cilj za ciljno težo! Uporabite lahko samo fitnes cilje.
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
                        <span class="option-icon">💪</span>
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
                        <span class="option-icon">🏃</span>
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
                        <span class="option-icon">👣</span>
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
        <span class="alert-icon">❌</span>
        <span>{{ error }}</span>
        <button @click="error = null" class="alert-close">×</button>
      </div>
      
      <div v-if="successMessage" class="alert alert-success bottom-alert">
        <span class="alert-icon">✅</span>
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
      filterStatus: 'all', // Dodan filter status
      //minDate: new Date().toISOString().split('T')[0],
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
    // Filtrirani cilji glede na izbran status
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
  methods: {
    goToDashboard() {
      this.$router.push('/dashboard');
    },
    
    openEditGoal(goal) {
      this.selectedGoal = goal;
      this.showEditGoalModal = true;
    },

    showSuccess(message) {
      this.successMessage = message;
      this.error = null; // Počisti morebitne napake
      
      // Samodejno skrij sporočilo po 5 sekundah
      setTimeout(() => {
        this.successMessage = null;
      }, 5000);
    },
    showError(message) {
      this.error = message;
      this.successMessage = null; // Počisti morebitna uspešna sporočila
      
      // Samodejno skrij napako po 5 sekundah
      setTimeout(() => {
        this.error = null;
      }, 5000);
    },
    
    async addExercise(goald){
      const response = await goalApi.put(`/updateProgressFitness?id=${goald}&num=1`);
      await this.loadAllGoals();
    },

    updateProgress(goal) {
      // console.log('🎯 Kliknjeno na Dodaj napredek za:', goal.goalTitle);
      // console.log('Tip cilja:', goal.goalType, 'Fitness tip:', goal.fitnessType);
      this.updatingGoal = goal;
      this.showUpdateGoal = true;
      // console.log('showUpdateGoal:', this.showUpdateGoal);
      // console.log('updatingGoal:', this.updatingGoal);
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
        const startWeight = goal.startWeight;
        const currentWeight = parseFloat(current);
        const targetWeight = parseFloat(target);

        if (startWeight === targetWeight) return 100;
        if (targetWeight === 0) return 0;

        if (targetWeight < startWeight) {
          if (currentWeight <= targetWeight) return 100;
          if (currentWeight >= startWeight) return 0;
          
          const lostWeight = startWeight - currentWeight;
          const totalToLose = startWeight - targetWeight;
          return Math.min(Math.round((lostWeight / totalToLose) * 100), 100);
        }

        if (targetWeight > startWeight) {
          if (currentWeight >= targetWeight) return 100;
          if (currentWeight <= startWeight) return 0;
          
          const gainedWeight = currentWeight - startWeight;
          const totalToGain = targetWeight - startWeight;
          return Math.min(Math.round((gainedWeight / totalToGain) * 100), 100);
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
        const response = await goalApi.get('/allGoals');
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
          status: 'in progress'
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
  mounted() {
    this.loadAllGoals();
  }
}
</script>
<style scoped>
.disabled-option {
  color: #95a5a6 !important;
  background-color: #f1f2f6 !important;
  cursor: not-allowed !important;
}

.alert.error {
  background: #ffeaea;
  border: 2px solid #f5c6cb;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
}

.alert.error h4 {
  margin-top: 0;
  color: #721c24;
}

.alert.error p {
  margin: 10px 0;
}

.goals-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.goals-header {
  background: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.goals-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  flex-grow: 1;
}

.back-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.back-btn:hover {
  background: #2980b9;
  transform: translateX(-2px);
}

.goals-main {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.today-goals {
  margin-top: 25px;
}

.card-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 15px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
  gap: 15px;
}

.refresh-btn {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.refresh-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
  background: #27ae60;
}

.summary {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.value.active {
  color: #3498db;
}

.value.completed {
  color: #27ae60;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 18px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-goals {
  text-align: center;
  padding: 60px 20px;
}

.no-goals-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-goals-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.no-goals h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.no-goals p {
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.5;
}

.add-first-goal-btn {
  background: #9b59b6;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.add-first-goal-btn:hover {
  background: #8e44ad;
  transform: translateY(-2px);
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.goal-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  background: white;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-wrap: wrap;
  gap: 15px;
}

.goal-type {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-grow: 1;
}

.type-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.goal-type h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  word-break: break-word;
}

.goal-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
}

.goal-status.active,
.goal-status.in-progress {
  background: rgba(52, 152, 219, 0.3);
}

.goal-status.completed,
.goal-status.done {
  background: rgba(46, 204, 113, 0.3);
}

.goal-info {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 14px;
  opacity: 0.9;
  flex-shrink: 0;
}

.goal-description {
  padding: 20px;
  background: white;
}

.goal-description h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
}

.goal-description p {
  color: #7f8c8d;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.goal-progress {
  margin-top: 15px;
}

.progress-text {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 600;
  flex-wrap: wrap;
}

.current {
  color: #3498db;
  font-size: 18px;
}

.target {
  color: #2c3e50;
}

.separator {
  color: #95a5a6;
}

.percentage {
  color: #7f8c8d;
  font-size: 14px;
}

.progress-bar {
  height: 10px;
  background: #ecf0f1;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #3498db, #2ecc71);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.progress-fill.completed {
  background: linear-gradient(to right, #2ecc71, #27ae60);
}

.goal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  flex-wrap: wrap;
  gap: 15px;
}

.goal-date {
  font-size: 14px;
  color: #7f8c8d;
  flex-grow: 1;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-buttons-header {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Filter gumbi */
.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: #3498db;
  color: #3498db;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

.filter-btn.active:hover {
  background: #2980b9;
  border-color: #2980b9;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.action-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.add-btn {
  background: #2ecc71;
  color: white;
}

.remove-btn {
  background: #e74c3c;
  color: white;
}

.edit-btn {
  background: #f39c12;
  color: white;
}

.delete-btn {
  background: #95a5a6;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
  z-index: 999;
}

.add-goal-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  font-size: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 20px;
}

.step h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 18px;
}

.step-description {
  color: #7f8c8d;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  background: #f8f9fa;
}

.form-control:focus {
  outline: none;
  border-color: #f5576c;
  background: white;
}

.fitness-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-card {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s;
  cursor: pointer;
}

.option-card.selected {
  border-color: #f5576c;
  background: #fff5f5;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
}

.option-radio {
  margin: 0;
}

.option-icon {
  font-size: 20px;
  width: 30px;
  text-align: center;
}

.option-text strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 2px;
}

.option-text small {
  color: #7f8c8d;
  font-size: 12px;
}

.option-input {
  margin-top: 10px;
  padding-left: 45px;
}

.weight-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.alert.warning {
  margin-top: 10px;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
  font-size: 13px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-prev,
.btn-next,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-prev {
  background: #f1f2f6;
  color: #7f8c8d;
}

.btn-next {
  background: #3498db;
  color: white;
}

.btn-save {
  background: #2ecc71;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-prev:hover {
  background: #e0e0e0;
}

.btn-next:hover:not(:disabled) {
  background: #2980b9;
}

.btn-save:hover:not(:disabled) {
  background: #27ae60;
}

.btn-next:disabled,
.btn-save:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .goals-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .card-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  }
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    flex-wrap: wrap;
    gap: 15px;
  }
    
  .summary {
  display: flex;
  gap: 30px;
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
  
  .summary-item {
    min-width: auto;
    width: 100%;
  }
  
  .goal-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .goal-info {
    flex-direction: column;
    gap: 5px;
  }
  
  .goal-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .add-goal-modal {
    width: 95%;
  }
}
.alert {
  padding: 15px 20px;
  border-radius: 10px;
  margin: 15px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

.alert::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 5px;
}

.alert-error {
  background: linear-gradient(to right, #ffeaea 0%, #fff5f5 100%);
  color: #c0392b;
  border: 1px solid #f5c6cb;
}

.alert-error::before {
  background: #c0392b;
}

.alert-success {
  background: linear-gradient(to right, #e8f7ee 0%, #f0f9f3 100%);
  color: #27ae60;
  border: 1px solid #c3e6cb;
}

.alert-success::before {
  background: #27ae60;
}

.alert-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.alert-close {
  background: transparent;
  border: none;
  font-size: 22px;
  color: inherit;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  flex-shrink: 0;
  margin-left: 10px;
}

.alert-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.top-alert {
  margin-top: 10px;
  margin-bottom: 20px;
}

.bottom-alert {
  margin-top: 20px;
  margin-bottom: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>