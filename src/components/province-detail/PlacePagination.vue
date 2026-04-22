<script setup lang="ts">
defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: "go-to-page", page: number): void;
  (e: "prev-page"): void;
  (e: "next-page"): void;
}>();

function pageNumbers(totalPages: number) {
  return Array.from({ length: totalPages }, (_, i) => i + 1);
}
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="page-arrow"
      :disabled="currentPage === 1"
      @click="emit('prev-page')"
    >
      ‹
    </button>

    <button
      v-for="page in pageNumbers(totalPages)"
      :key="page"
      class="page-number"
      :class="{ active: currentPage === page }"
      @click="emit('go-to-page', page)"
    >
      {{ page }}
    </button>

    <button
      class="page-arrow"
      :disabled="currentPage === totalPages"
      @click="emit('next-page')"
    >
      ›
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 34px;
}

.page-number,
.page-arrow {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid #d9dfeb;
  background: white;
  color: #7d8597;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-number.active {
  background: #15543f;
  color: white;
  border-color: #15543f;
}

.page-number:hover:not(.active),
.page-arrow:hover:not(:disabled) {
  border-color: #15543f;
  color: #15543f;
}

.page-arrow:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
