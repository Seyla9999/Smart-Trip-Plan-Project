<template>
  <div class="trip-form-container">
    <div class="trip-form-hero">
      <div class="trip-form-hero-bg"></div>
      <div class="trip-form-hero-overlay"></div>
      <div class="trip-form-hero-content">
        <h1 class="trip-form-title">Plan Your Perfect Trip</h1>
        <p class="trip-form-subtitle">Discover the best attractions and experiences tailored to your journey</p>
      </div>
    </div>

    <div class="trip-form-card">
      <form @submit.prevent="handleSearch" class="trip-search-form">
        <div class="form-row">
          <div class="form-group">
            <label for="origin">Starting Point</label>
            <select v-model="formData.origin" id="origin" required>
              <option value="">Select province...</option>
              <option value="phnom-penh">Phnom Penh</option>
              <option value="siem-reap">Siem Reap</option>
              <option value="koh-kong">Koh Kong</option>
              <option value="kampot">Kampot</option>
              <option value="kep">Kep</option>
            </select>
          </div>

          <div class="form-group">
            <label for="destination">Destination</label>
            <select v-model="formData.destination" id="destination" required>
              <option value="">Select province...</option>
              <option value="phnom-penh">Phnom Penh</option>
              <option value="siem-reap">Siem Reap</option>
              <option value="koh-kong">Koh Kong</option>
              <option value="kampot">Kampot</option>
              <option value="kep">Kep</option>
              <option value="battambang">Battambang</option>
              <option value="mondulkiri">Mondulkiri</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="start-date">Start Date</label>
            <input v-model="formData.startDate" id="start-date" type="date" required />
          </div>

          <div class="form-group">
            <label for="end-date">End Date</label>
            <input v-model="formData.endDate" id="end-date" type="date" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>Travel Type</label>
            <div class="travel-type-options">
              <label class="travel-type-option">
                <input v-model="formData.travelType" type="radio" value="solo" />
                <span>Solo</span>
              </label>
              <label class="travel-type-option">
                <input v-model="formData.travelType" type="radio" value="friends" />
                <span>Friends</span>
              </label>
              <label class="travel-type-option">
                <input v-model="formData.travelType" type="radio" value="family" />
                <span>Family</span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-search" :disabled="isLoading">
            {{ isLoading ? 'Searching...' : 'Search & Plan' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface TripFormData {
  origin: string
  destination: string
  startDate: string
  endDate: string
  travelType: 'solo' | 'friends' | 'family'
  budget: string
}

const router = useRouter()
const isLoading = ref(false)
const error = ref<string | null>(null)

const formData = ref<TripFormData>({
  origin: '',
  destination: '',
  startDate: '',
  endDate: '',
  travelType: 'friends',
  budget: ''
})

const handleSearch = async () => {
  error.value = null

  if (!formData.value.origin) {
    error.value = 'Please select a starting point'
    return
  }

  if (!formData.value.destination) {
    error.value = 'Please select a destination'
    return
  }

  if (formData.value.origin === formData.value.destination) {
    error.value = 'Starting point and destination must be different'
    return
  }

  if (!formData.value.startDate || !formData.value.endDate) {
    error.value = 'Please select both start and end dates'
    return
  }

  const startDate = new Date(formData.value.startDate)
  const endDate = new Date(formData.value.endDate)

  if (startDate >= endDate) {
    error.value = 'End date must be after start date'
    return
  }

  isLoading.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    router.push({
      name: 'trip-results',
      query: {
        origin: formData.value.origin,
        destination: formData.value.destination,
        from: formData.value.startDate,
        to: formData.value.endDate,
        type: formData.value.travelType,
        budget: formData.value.budget
      }
    })
  } catch (err) {
    error.value = 'Failed to search trips. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.trip-form-container {
  width: 100%;
}

.trip-form-hero {
  position: relative;
  height: 300px;
  margin-bottom: -80px;
  z-index: 1;
}

.trip-form-hero-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('/hero/hero1.jpg');
  background-size: cover;
  background-position: center;
}

.trip-form-hero-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

.trip-form-hero-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
}

.trip-form-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 16px 0;
}

.trip-form-subtitle {
  font-size: 18px;
  font-weight: 400;
  margin: 0;
  opacity: 0.95;
}

.trip-form-card {
  position: relative;
  z-index: 10;
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin: 0 auto;
  max-width: 900px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin: auto;
  margin-bottom: 60px;
}

.trip-search-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #15543f;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select {
  padding: 12px 14px;
  border: 1px solid #d8dce6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #15543f;
  box-shadow: 0 0 0 3px rgba(21, 84, 63, 0.1);
}

.travel-type-options {
  display: flex;
  gap: 20px;
}

.travel-type-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.travel-type-option input[type='radio'] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.travel-type-option span {
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.btn-search {
  padding: 14px 48px;
  background: linear-gradient(135deg, #097445 0%, #0a5a35 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 200px;
}

.btn-search:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(9, 116, 69, 0.3);
}

.btn-search:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #f87171;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .trip-form-hero {
    height: 200px;
    margin-bottom: -60px;
  }

  .trip-form-title {
    font-size: 32px;
  }

  .trip-form-subtitle {
    font-size: 14px;
  }

  .trip-form-card {
    padding: 24px;
    margin-left: 12px;
    margin-right: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .travel-type-options {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
