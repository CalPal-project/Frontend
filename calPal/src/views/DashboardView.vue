<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>📊 Nadzorna plošča</h1>
        <div class="user-info">
          <span class="welcome"
            >Pozdravljen, <strong>{{ currentUser }}</strong
            >!</span
          >
          <button @click="logout" class="logout-btn">🚪 Odjava</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Kratki pregled -->
      <div class="overview-section">
        <h2>🔄 Dnevni pregled</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #ffeaa7">🔥</div>
            <div class="stat-content">
              <h3>1,250 kcal</h3>
              <p>Današnje kalorije</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #a29bfe">🎯</div>
            <div class="stat-content">
              <h3>750 kcal</h3>
              <p>Preostalo do cilja</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fd79a8">⚖️</div>
            <div class="stat-content">
              <h3>65.2 kg</h3>
              <p>Trenutna teža</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Hitri gumbi za navigacijo -->
      <div class="navigation-section">
        <h2>🚀 Hitra navigacija</h2>
        <div class="nav-buttons">
          <button @click="goToGoalManagement" class="nav-btn goal-btn">
            <span class="btn-icon">🎯</span>
            <span class="btn-text">Upravljanje ciljev</span>
            <span class="btn-arrow">→</span>
          </button>

          <button @click="goToMealTracking" class="nav-btn meal-btn">
            <span class="btn-icon">🍽️</span>
            <span class="btn-text">Sledenje obrokom</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>

      <!-- Goal Manager komponenta (prikazana tukaj) -->
      <div v-if="showGoalManager" class="goal-manager-section">
        <h2>🎯 Upravljanje ciljev</h2>
        <GoalManager />
        <button @click="hideGoalManager" class="close-btn">✕ Zapri upravljanje ciljev</button>
      </div>

      <!-- Zadnja aktivnost -->
      <div class="activity-section">
        <h2>📝 Zadnja aktivnost</h2>
        <ul class="activity-list">
          <li>✅ 08:30 - Zajtrk: Ovsenka (350 kcal)</li>
          <li>✅ 12:45 - Kosilo: Piščanec z rižem (550 kcal)</li>
          <li>✅ 15:30 - Prigrizek: Jabolko (95 kcal)</li>
          <li>⏳ 19:00 - Večerja: (Načrtovano)</li>
        </ul>
      </div>
    </main>

    <!-- Footer -->
    <footer class="dashboard-footer">
      <p>Calorie Tracker App • Demo različica • {{ currentYear }}</p>
    </footer>
  </div>
</template>

<script>
import GoalManager from '@/components/GoalManager.vue'

export default {
  name: 'DashboardView',
  components: {
    GoalManager,
  },
  data() {
    return {
      currentUser: 'Testni uporabnik',
      showGoalManager: false,
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },
  mounted() {
    // Preberi uporabnika iz localStorage
    const user = localStorage.getItem('currentUser')
    if (user) {
      this.currentUser = user
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('currentUser')
      this.$router.push('/login')
    },

    goToGoalManagement() {
      // Prikaži GoalManager komponento direktno v dashboardu
      this.showGoalManager = true
      // Scroll to section
      setTimeout(() => {
        document.querySelector('.goal-manager-section')?.scrollIntoView({
          behavior: 'smooth',
        })
      }, 100)
    },

    hideGoalManager() {
      this.showGoalManager = false
    },

    goToMealTracking() {
      // Pojdi na ločeno stran za meal tracking
      this.$router.push('/meals')
    },
  },
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Header */
.dashboard-header {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  color: #2c3e50;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome {
  font-size: 1.1rem;
  color: #555;
}

.logout-btn {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #c0392b;
}

/* Main content */
.dashboard-main {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
}

/* Sections */
.overview-section,
.navigation-section,
.goal-manager-section,
.activity-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
}

/* Navigation buttons */
.nav-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s;
  text-align: left;
}

.goal-btn {
  background: linear-gradient(to right, #ff9a9e, #fad0c4);
  color: #2c3e50;
}

.meal-btn {
  background: linear-gradient(to right, #a1c4fd, #c2e9fb);
  color: #2c3e50;
}

.nav-btn:hover {
  transform: translateX(10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1.5rem;
  margin-right: 15px;
}

.btn-text {
  flex: 1;
}

.btn-arrow {
  font-size: 1.3rem;
  opacity: 0.7;
}

/* Goal manager section */
.close-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #7f8c8d;
}

/* Activity list */
.activity-list {
  list-style: none;
  padding: 0;
}

.activity-list li {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  color: #555;
  font-size: 1.1rem;
}

.activity-list li:last-child {
  border-bottom: none;
}

/* Footer */
.dashboard-footer {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  margin-top: 40px;
  border-top: 1px solid #eee;
}
</style>
