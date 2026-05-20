import { computed, ref } from "vue";

export function useProvincePagination<T>(items: () => T[], itemsPerPage = 4) {
  const currentPage = ref(1);

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(items().length / itemsPerPage));
  });

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items().slice(start, end);
  });

  function goToPage(page: number) {
    currentPage.value = page;
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value += 1;
    }
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value -= 1;
    }
  }

  function resetPage() {
    currentPage.value = 1;
  }

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
  };
}
