import { computed, ref } from "vue";

type Place = {
  category: string;
  discovery: string;
};

export function useProvinceFilters(initialPlaces: () => Place[]) {
  const categoryFilters = ref([
    { name: "Nature", count: 0, checked: true },
    { name: "Waterfall", count: 0, checked: true },
    { name: "Beach", count: 0, checked: false },
    { name: "Cultural", count: 0, checked: true },
    { name: "Food", count: 0, checked: false },
  ]);

  const discoveryFilters = ref([
    { name: "Hidden gems", count: 0, checked: true },
    { name: "Most popular", count: 0, checked: true },
  ]);

  function updateFilterCounts() {
    const places = initialPlaces();

    categoryFilters.value = categoryFilters.value.map((item) => ({
      ...item,
      count: places.filter((place) => place.category === item.name).length,
    }));

    discoveryFilters.value = discoveryFilters.value.map((item) => ({
      ...item,
      count: places.filter((place) => place.discovery === item.name).length,
    }));
  }

  const activeCategories = computed(() =>
    categoryFilters.value
      .filter((item) => item.checked)
      .map((item) => item.name),
  );

  const activeDiscoveries = computed(() =>
    discoveryFilters.value
      .filter((item) => item.checked)
      .map((item) => item.name),
  );

  function clearAllFilters() {
    categoryFilters.value.forEach((item) => (item.checked = false));
    discoveryFilters.value.forEach((item) => (item.checked = false));
  }

  function toggleCategory(name: string) {
    const found = categoryFilters.value.find((item) => item.name === name);
    if (found) found.checked = !found.checked;
  }

  function toggleDiscovery(name: string) {
    const found = discoveryFilters.value.find((item) => item.name === name);
    if (found) found.checked = !found.checked;
  }

  return {
    categoryFilters,
    discoveryFilters,
    activeCategories,
    activeDiscoveries,
    updateFilterCounts,
    clearAllFilters,
    toggleCategory,
    toggleDiscovery,
  };
}
