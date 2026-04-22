<template>
  <div class="container">
    
    <div v-if="imagePosition === 'left'" class="right">
      <img src="@/assets/phnom-penh.jpg" />
    </div>

    <div class="left">
      <slot />
    </div>

    <div v-if="imagePosition === 'right'" class="right">
      <img src="@/assets/phnom-penh.jpg" />
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
  background-color: rgb(222, 237, 241);
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

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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