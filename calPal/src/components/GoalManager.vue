<template>
  <div class="goal-manager">
    <div class="goals-list">
      <div v-for="goal in goals" :key="goal.id" class="goal-card">
        <div class="goal-header">
          <h3>{{ goal.emoji }} {{ goal.name }}</h3>
          <span class="goal-status" :class="goal.status">
            {{ goalStatusText[goal.status] }}
          </span>
        </div>
        
        <p class="goal-description">{{ goal.description }}</p>
        
        <div class="goal-progress">
          <div class="progress-text">
            <span class="current">{{ goal.current }}</span>
            <span class="separator">/</span>
            <span class="target">{{ goal.target }} {{ goal.unit }}</span>
            <span class="percentage">({{ goal.percentage }}%)</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: goal.percentage + '%' }"
              :class="{ 'completed': goal.percentage >= 100 }"
            ></div>
          </div>
        </div>
        
        <div class="goal-actions">
          <button @click="updateProgress(goal.id, 10)" class="action-btn add-btn">
            + Napredek
          </button>
          <button @click="updateProgress(goal.id, -10)" class="action-btn remove-btn">
            - Zmanjšaj
          </button>
          <button @click="editGoal(goal.id)" class="action-btn edit-btn">
            ✏️ Uredi
          </button>
        </div>
      </div>
    </div>
    
    <div class="add-goal-section">
      <h3>➕ Dodaj nov cilj</h3>
      <div class="add-goal-form">
        <input v-model="newGoal.name" placeholder="Ime cilja" class="goal-input">
        <input v-model="newGoal.target" type="number" placeholder="Ciljna vrednost" class="goal-input">
        <select v-model="newGoal.unit" class="goal-input">
          <option value="kcal">kcal</option>
          <option value="kg">kg</option>
          <option value="times">krat</option>
          <option value="days">dni</option>
        </select>
        <button @click="addGoal" class="add-goal-btn">Dodaj cilj</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoalManager',
  data() {
    return {
      goals: [
        {
          id: 1,
          name: 'Dnevni kalorijski cilj',
          description: 'Omejitev dnevnega vnosa kalorij',
          emoji: '🔥',
          current: 1250,
          target: 2000,
          unit: 'kcal',
          status: 'in-progress'
        },
        {
          id: 2,
          name: 'Ciljna teža',
          description: 'Doseči želeno telesno težo',
          emoji: '⚖️',
          current: 65.2,
          target: 60.0,
          unit: 'kg',
          status: 'in-progress'
        },
        {
          id: 3,
          name: 'Tedenska vadba',
          description: 'Število vadbenih dni na teden',
          emoji: '💪',
          current: 3,
          target: 5,
          unit: 'krat',
          status: 'in-progress'
        }
      ],
      newGoal: {
        name: '',
        target: '',
        unit: 'kcal'
      },
      goalStatusText: {
        'not-started': 'Ni začeto',
        'in-progress': 'V teku',
        'completed': 'Dokončano'
      }
    }
  },
  computed: {
    calculatedGoals() {
      return this.goals.map(goal => {
        const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100)
        const status = percentage >= 100 ? 'completed' : 
                      goal.current > 0 ? 'in-progress' : 'not-started'
        
        return {
          ...goal,
          percentage,
          status
        }
      })
    }
  },
  methods: {
    updateProgress(goalId, amount) {
      const goal = this.goals.find(g => g.id === goalId)
      if (goal) {
        goal.current = Math.max(0, goal.current + amount)
        
        // Avtomatsko označi kot dokončano
        if (goal.current >= goal.target) {
          goal.current = goal.target
        }
      }
    },
    
    editGoal(goalId) {
      const goal = this.goals.find(g => g.id === goalId)
      if (goal) {
        const newName = prompt('Novo ime cilja:', goal.name)
        const newTarget = prompt('Nova ciljna vrednost:', goal.target)
        
        if (newName && newTarget) {
          goal.name = newName
          goal.target = parseFloat(newTarget)
        }
      }
    },
    
    addGoal() {
      if (!this.newGoal.name.trim() || !this.newGoal.target) {
        alert('Prosimo, vnesite ime in ciljno vrednost!')
        return
      }
      
      const newId = this.goals.length > 0 ? 
                   Math.max(...this.goals.map(g => g.id)) + 1 : 1
      
      this.goals.push({
        id: newId,
        name: this.newGoal.name,
        description: 'Nov cilj',
        emoji: '🎯',
        current: 0,
        target: parseFloat(this.newGoal.target),
        unit: this.newGoal.unit,
        status: 'not-started'
      })
      
      // Reset forma
      this.newGoal.name = ''
      this.newGoal.target = ''
      this.newGoal.unit = 'kcal'
    }
  }
}
</script>

<style scoped>
.goal-manager {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.goal-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.goal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.goal-status {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.goal-status.not-started {
  background: #f1f2f6;
  color: #7f8c8d;
}

.goal-status.in-progress {
  background: #d6eaf8;
  color: #3498db;
}

.goal-status.completed {
  background: #d5f4e6;
  color: #27ae60;
}

.goal-description {
  color: #7f8c8d;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.goal-progress {
  margin-bottom: 15px;
}

.progress-text {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
}

.current {
  color: #3498db;
  font-size: 1.2rem;
}

.target {
  color: #2c3e50;
}

.separator {
  color: #95a5a6;
}

.percentage {
  color: #7f8c8d;
  font-size: 0.9rem;
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
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.3s;
}

.action-btn:hover {
  opacity: 0.9;
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

.add-goal-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.add-goal-form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.goal-input {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 150px;
}

.add-goal-btn {
  padding: 10px 20px;
  background: #9b59b6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.add-goal-btn:hover {
  background: #8e44ad;
}
</style>