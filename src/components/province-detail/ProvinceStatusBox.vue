<script setup lang="ts">
defineProps<{
  message: string;
  type?: "default" | "error";
}>();
</script>

<template>
  <div class="status-box" :class="{ 'error-box': type === 'error' }">
    {{ message }}
  </div>
</template>

<style scoped>
.status-box {
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e4e7ee;
  border-radius: 16px;
  color: #5f6678;
  margin-bottom: 24px;
}

.error-box {
  color: #b42318;
  border-color: #f0c7c3;
  background: #fff7f6;
}
</style>
