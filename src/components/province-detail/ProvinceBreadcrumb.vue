<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{
  provinceName: string;
}>();
</script>

<template>
  <div class="breadcrumb">
    <RouterLink to="/" class="breadcrumb-link">HOME</RouterLink>
    <span>›</span>
    <RouterLink to="/discover" class="breadcrumb-link"> DISCOVER </RouterLink>
    <span>›</span>
    <strong>{{ provinceName.toUpperCase() }}</strong>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  color: #8c94a8;
  margin-bottom: 28px;
}

.breadcrumb-link {
  color: #8c94a8;
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb-link:hover {
  color: #15543f;
}

.breadcrumb strong {
  color: #15543f;
}
</style>
