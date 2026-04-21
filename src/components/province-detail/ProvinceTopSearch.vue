<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  provinceName: string;
  selectedTravelType: string;
  fromDate: string;
  toDate: string;
}>();

const provinceOptions = [
  "Siem Reap",
  "Phnom Penh",
  "Koh Kong",
  "Kampot",
  "Sihanoukville",
  "Ratanakiri",
  "Mondulkiri",
  "Battambang",
  "Kratié",
  "Kep",
  "Preah Vihear",
  "Takéo",
  "Kandal",
  "Kampong Cham",
  "Stung Treng",
  "Prey Veng",
  "Svay Rieng",
  "Pursat",
  "Pailin",
  "Kampong Thom",
  "Kampong Chhnang",
  "Kampong Speu",
  "Banteay Meanchey",
  "Oddar Meanchey",
  "Tbong Khmum",
];

const isEditing = ref(false);
const destination = ref(props.provinceName);
const travelType = ref(props.selectedTravelType);

const showCal = ref(false);
const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);

const today = new Date();
today.setHours(0, 0, 0, 0);

const calYear = ref(today.getFullYear());
const calMonth = ref(today.getMonth());

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

watch(
  () => props.provinceName,
  (value) => {
    destination.value = value;
  },
  { immediate: true },
);

watch(
  () => props.selectedTravelType,
  (value) => {
    travelType.value = value;
  },
  { immediate: true },
);

watch(
  () => [props.fromDate, props.toDate],
  ([from, to]) => {
    startDate.value = from ? parseISODate(from) : null;
    endDate.value = to ? parseISODate(to) : null;

    const baseDate = startDate.value || today;
    calYear.value = baseDate.getFullYear();
    calMonth.value = baseDate.getMonth();
  },
  { immediate: true },
);

function parseISODate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

const calDays = computed(() => {
  const firstDay = new Date(calYear.value, calMonth.value, 1).getDay();
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate();

  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
});

function makeDate(day: number) {
  const d = new Date(calYear.value, calMonth.value, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSelected(day: number | null) {
  if (!day) return false;
  const d = makeDate(day).getTime();
  return startDate.value?.getTime() === d || endDate.value?.getTime() === d;
}

function isRangeStart(day: number | null) {
  if (!day || !startDate.value) return false;
  return makeDate(day).getTime() === startDate.value.getTime();
}

function isRangeEnd(day: number | null) {
  if (!day || !endDate.value) return false;
  return makeDate(day).getTime() === endDate.value.getTime();
}

function isInRange(day: number | null) {
  if (!day || !startDate.value || !endDate.value) return false;
  const d = makeDate(day).getTime();
  return d > startDate.value.getTime() && d < endDate.value.getTime();
}

function isToday(day: number | null) {
  if (!day) return false;
  return makeDate(day).getTime() === today.getTime();
}

function isPast(day: number | null) {
  if (!day) return false;
  return makeDate(day).getTime() < today.getTime();
}

function selectDay(day: number) {
  const d = makeDate(day);

  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = d;
    endDate.value = null;
  } else if (d > startDate.value) {
    endDate.value = d;
    showCal.value = false;
  } else {
    startDate.value = d;
    endDate.value = null;
  }
}

function prevMonth() {
  if (calMonth.value === 0) {
    calMonth.value = 11;
    calYear.value--;
  } else {
    calMonth.value--;
  }
}

function nextMonth() {
  if (calMonth.value === 11) {
    calMonth.value = 0;
    calYear.value++;
  } else {
    calMonth.value++;
  }
}

function formatDisplayDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

const dateDisplay = computed(() => {
  if (startDate.value && endDate.value) {
    return `${formatDisplayDate(startDate.value)} – ${formatDisplayDate(endDate.value)}`;
  }
  if (startDate.value) {
    return `From ${formatDisplayDate(startDate.value)}`;
  }
  return "Pick Date";
});

function clearDates() {
  startDate.value = null;
  endDate.value = null;
}

function openDatePicker() {
  if (!isEditing.value) return;
  showCal.value = !showCal.value;
}

function startEdit() {
  isEditing.value = true;
}

function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

function doSearch() {
  const slug = toSlug(destination.value);
  const params = new URLSearchParams();

  if (travelType.value) {
    params.set("type", travelType.value.toLowerCase());
  }

  if (startDate.value) {
    params.set("from", formatISODate(startDate.value));
  }

  if (endDate.value) {
    params.set("to", formatISODate(endDate.value));
  }

  const queryString = params.toString();
  isEditing.value = false;

  window.location.href = queryString
    ? `/province/${slug}?${queryString}`
    : `/province/${slug}`;
}

function handleOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest(".date-sf")) {
    showCal.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleOutsideClick));
onUnmounted(() => document.removeEventListener("click", handleOutsideClick));
</script>

<template>
  <section class="search-strip">
    <div class="page-container">
      <div class="search-box">
        <div class="search-item">
          <span class="search-label">Destination</span>

          <template v-if="isEditing">
            <select v-model="destination" class="search-input">
              <option
                v-for="province in provinceOptions"
                :key="province"
                :value="province"
              >
                {{ province }}
              </option>
            </select>
          </template>

          <template v-else>
            <strong>{{ destination }}</strong>
          </template>
        </div>

        <div class="search-item date-sf" @click="openDatePicker">
          <span class="search-label">Travel Dates</span>

          <div class="date-display-wrap">
            <strong :class="{ placeholder: dateDisplay === 'Pick Date' }">
              {{ dateDisplay }}
            </strong>
            <span
              v-if="isEditing && (startDate || endDate)"
              class="date-clear"
              @click.stop="clearDates"
            >
              ✕
            </span>
          </div>

          <div v-if="isEditing && showCal" class="calendar-drop" @click.stop>
            <div class="cal-header">
              <button class="cal-nav" @click="prevMonth">‹</button>
              <span class="cal-month"
                >{{ monthNames[calMonth] }} {{ calYear }}</span
              >
              <button class="cal-nav" @click="nextMonth">›</button>
            </div>

            <div class="cal-grid">
              <div
                v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
                :key="d"
                class="cal-day-label"
              >
                {{ d }}
              </div>

              <div
                v-for="(day, idx) in calDays"
                :key="idx"
                class="cal-day"
                :class="{
                  empty: !day,
                  selected: isSelected(day),
                  'in-range': isInRange(day),
                  'range-start': isRangeStart(day),
                  'range-end': isRangeEnd(day),
                  today: isToday(day),
                  past: isPast(day),
                }"
                @click="day && !isPast(day) && selectDay(day)"
              >
                {{ day || "" }}
              </div>
            </div>

            <div class="cal-footer">
              <span v-if="!startDate">Click to select check-in date</span>
              <span v-else-if="!endDate">Now select check-out date</span>
              <span v-else
                >{{ formatDisplayDate(startDate) }} →
                {{ formatDisplayDate(endDate) }}</span
              >
              <button
                v-if="startDate || endDate"
                class="cal-reset"
                @click="clearDates"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div class="search-item">
          <span class="search-label">Travel Type</span>

          <template v-if="isEditing">
            <select v-model="travelType" class="search-input">
              <option value="Solo">Solo</option>
              <option value="Friends">Friends</option>
              <option value="Family">Family</option>
            </select>
          </template>

          <template v-else>
            <strong>{{ travelType }}</strong>
          </template>
        </div>

        <div class="search-actions">
          <button v-if="!isEditing" class="edit-btn" @click="startEdit">
            Edit
          </button>
          <button class="search-btn" @click="doSearch">
            {{ isEditing ? "Save" : "Search" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.search-strip {
  background: #64709a;
  padding: 20px 0;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-box {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  color: white;
}

.search-item {
  padding: 0 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.search-item:last-of-type {
  border-right: none;
}

.search-label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
  margin-bottom: 6px;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-btn {
  background: transparent;
  color: white;
  border: none;
  cursor: pointer;
}

.search-btn {
  background: #2e8b57;
  color: white;
  border: none;
  border-radius: 999px;
  padding: 14px 30px;
  font-weight: 700;
  cursor: pointer;
}

.search-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
}

.search-input option {
  color: black;
}

.date-display-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.placeholder {
  opacity: 0.75;
}

.date-clear {
  font-size: 12px;
  color: white;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}

.date-clear:hover {
  background: rgba(255, 255, 255, 0.15);
}

.calendar-drop {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: 300px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid #e0ddd6;
  z-index: 999;
  padding: 16px;
  color: #1a1a1a;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cal-month {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
}

.cal-nav {
  background: none;
  border: 1px solid #e0ddd6;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 16px;
  color: #6b6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.cal-nav:hover {
  background: #2d6a4f;
  color: #fff;
  border-color: #2d6a4f;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.cal-day-label {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-align: center;
  padding: 4px 0;
  letter-spacing: 0.03em;
}

.cal-day {
  font-size: 13px;
  text-align: center;
  padding: 7px 2px;
  border-radius: 6px;
  cursor: pointer;
  color: #1a1a1a;
  transition: all 0.15s;
}

.cal-day:hover:not(.empty):not(.past) {
  background: #d8f3dc;
  color: #2d6a4f;
}

.cal-day.empty {
  cursor: default;
}

.cal-day.past {
  color: #ccc;
  cursor: not-allowed;
}

.cal-day.today {
  font-weight: 700;
  color: #2d6a4f;
}

.cal-day.selected {
  background: #2d6a4f;
  color: #fff;
  font-weight: 600;
}

.cal-day.range-start {
  background: #2d6a4f;
  color: #fff;
  border-radius: 6px 0 0 6px;
}

.cal-day.range-end {
  background: #2d6a4f;
  color: #fff;
  border-radius: 0 6px 6px 0;
}

.cal-day.in-range {
  background: #d8f3dc;
  color: #2d6a4f;
  border-radius: 0;
}

.cal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0ede8;
  font-size: 12px;
  color: #6b6b6b;
}

.cal-reset {
  background: none;
  border: 1px solid #e0ddd6;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: #6b6b6b;
  cursor: pointer;
}

.cal-reset:hover {
  border-color: #ae2012;
  color: #ae2012;
}

@media (max-width: 1024px) {
  .search-box {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }

  .search-item {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding-bottom: 12px;
  }

  .calendar-drop {
    width: 280px;
  }
}
</style>
