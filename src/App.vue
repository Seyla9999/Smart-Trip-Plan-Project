<template>
  <div class="max-h-full max-w-full">
    <NavBar v-if="showGlobalLayout" />
    <router-view />
     <!-- <common-button-light class="property-hover" property1="hover"></common-button-light> -->
    <Footer v-if="showGlobalLayout" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const authPaths = ['/login', '/register', '/verify']
const showGlobalLayout = computed(() => !authPaths.includes(route.path))
</script>
