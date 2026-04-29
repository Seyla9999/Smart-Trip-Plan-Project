<template>
  <div class="trip-planner-layout">
    <main class="trip-planner-main">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TripPlannerView',
  components: {

  }
})
</script>

<style scoped>
.trip-planner-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.trip-planner-main {
  flex: 1;
  width: 100%;
  max-width: 100%;
}
</style>
