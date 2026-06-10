<template>
  <div class="container">
    <div class="background-image">
      <img src="@/assets/phnom-penh.jpg" alt="Cambodia" />
      <div class="blur-overlay"></div>
    </div>

    <div class="form-side">
      <slot />
    </div>

    <div v-if="imagePosition === 'right'" class="image-side desktop-only">
      <img src="@/assets/phnom-penh.jpg" alt="Cambodia" />
    </div>

    <div v-if="imagePosition === 'left'" class="image-side desktop-only">
      <img src="@/assets/phnom-penh.jpg" alt="Cambodia" />
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
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #deedf1, #c8e6f0);
}

/* Mobile: Background image behind form with blur */
.background-image {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.background-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(8px);
  scale: 1.1;
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.form-side {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 16px;
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.image-side {
  display: none;
}

.desktop-only {
  display: none;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Tablet: 768px and up - Switch to side-by-side layout */
@media (min-width: 768px) {
  .container {
    position: static;
    flex-direction: row;
    min-height: 100vh;
  }

  .background-image {
    display: none;
  }

  .form-side {
    position: static;
    z-index: auto;
    flex: 1;
    min-height: 100vh;
    padding: 40px 20px;
    background: linear-gradient(135deg, #deedf1, #c8e6f0);
  }

  .image-side {
    display: flex;
    flex: 1;
    height: 100vh;
    overflow: hidden;
    flex-shrink: 0;
  }

  .desktop-only {
    display: flex;
  }
}

/* Large desktop: 1024px and up */
@media (min-width: 1024px) {
  .form-side {
    padding: 40px 60px;
  }

  .image-side {
    flex: 1.1;
  }
}
</style>