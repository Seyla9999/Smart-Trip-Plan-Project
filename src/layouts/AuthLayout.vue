<template>
  <div class="container">
    
    <div v-if="imagePosition === 'left'" class="right">
      <img src="@/assets/phnom-penh.png" />
    </div>

    <div class="left">
      <slot />
    </div>

    <div v-if="imagePosition === 'right'" class="right">
      <img src="@/assets/phnom-penh.png" />
    </div>

  </div>
</template>

<script setup>
defineProps({
  imagePosition: {
    type: String,
    default: 'right' 
  }
})
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
}

.left {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: slideInLeft 0.7s ease;
}

.right {
  width: 50%;
  justify-content: center;
  align-items: center;
  animation: slideInRight 0.7s ease;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
}
@keyframes slideInRight {
  from {
    transform: translateX(50px);
    opacity: 0;
  }
}
</style>