<script setup lang="ts">
defineProps<{
  provinceName: string;
}>();
</script>

<template>
  <div class="empty-map-box">
    <h3>No map points yet</h3>
    <p>
      We could not find valid attraction coordinates for {{ provinceName }}.
    </p>
  </div>
</template>

<style scoped>
.empty-map-box {
  padding: 24px;
  border: 1px dashed #d9dfeb;
  border-radius: 20px;
  background: #fff;
  text-align: center;
  color: #6e7485;
}

h3 {
  margin: 0 0 10px;
  color: #15543f;
}
</style>
