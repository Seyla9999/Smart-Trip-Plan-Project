<template>
  <div 
    class="flex flex-col h-screen w-full bg-white font-sans"
    :class="isRegisterPage ? 'md:flex-row-reverse' : 'md:flex-row'"
  >
    
    <div class="w-full md:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
      <div class="w-full max-w-md">
        <router-view></router-view>
      </div>
    </div>

    <div class="hidden md:block w-1/2 relative bg-gray-100">
      <div 
        class="absolute inset-0 bg-cover bg-center"
        style="background-image: url('https://images.unsplash.com/photo-1542361345-89e58247f2d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');"
      >
        </div>
    </div>
    
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Check if the current route is the register page
const isRegisterPage = computed(() => route.path === '/register')
</script>