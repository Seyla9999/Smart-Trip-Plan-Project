<template>
  <div class="hero-section-wrapper">
    <section class="hero">
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="hero-bg"
        :class="{ active: i === current }"
        :style="{ backgroundImage: `url(${slide.image})` }"
      />
      <div class="hero-overlay" />

    <div class="hero-stats">
      <div class="stat-card">
        <div class="stat-num">{{ stats.provinces || "—" }}</div>
        <div class="stat-label">Provinces</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">
          {{ stats.attractions ? stats.attractions + "+" : "—" }}
        </div>
        <div class="stat-label">Attractions</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ stats.travelers || "—" }}</div>
        <div class="stat-label">Travelers</div>
      </div>
    </div>

    <div class="hero-content">
      <span class="hero-tag">{{ slides[current].tag }}</span>
      <h1 class="hero-title">{{ slides[current].title }}</h1>
      <p class="hero-sub">{{ slides[current].subtitle }}</p>
    </div>

    <div class="hero-dots">
      <span
        v-for="(_, i) in slides"
        :key="i"
        class="dot"
        :class="{ active: i === current }"
        @click="current = i"
      />
    </div>
  </section>

  <div class="search-section">
    <div class="search-box">
      <div class="sf">
        <div class="sf-label">DESTINATION</div>
        <select v-model="destination" class="sf-sel">
          <option value="">Select Province...</option>
          <option v-for="p in provinceList" :key="p.id" :value="p.name_en">
            {{ p.name_en }}
          </option>
        </select>
      </div>

      <div class="sf-div" />

      <div class="sf date-sf" @click="openDatePicker">
        <div class="sf-label">TRAVEL DATES</div>
        <div class="sf-date-display">
          <span :class="dateDisplay ? 'date-filled' : 'date-placeholder'">
            {{ dateDisplay || "Pick Date" }}
          </span>
          <span v-if="dateDisplay" class="date-clear" @click.stop="clearDates">
            ✕
          </span>
        </div>
        <div class="sf-opt">Optional</div>

        <div v-if="showCal" class="calendar-drop" @click.stop>
          <div class="cal-header">
            <button class="cal-nav" @click="prevMonth">‹</button>
            <span class="cal-month">
              {{ monthNames[calMonth] }} {{ calYear }}
            </span>
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
            <span v-else>
              {{ formatDate(startDate) }} → {{ formatDate(endDate) }}
            </span>
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

      <div class="sf-div" />

      <div class="sf">
        <div class="sf-label">TRAVEL TYPE</div>
        <select v-model="travelType" class="sf-sel">
          <option value="">Solo/Friends/Family</option>
          <option value="solo">Solo</option>
          <option value="friends">Friends</option>
          <option value="family">Family</option>
        </select>
        <div class="sf-opt">Optional</div>
      </div>

      <button class="search-btn" @click="doSearch">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search
      </button>
    </div>

    <div class="quick-tags">
      <span class="q-label">QUICK SEARCH</span>
      <span
        v-for="tag in quickTags"
        :key="tag"
        class="q-tag"
        @click="quickSearch(tag)"
      >
        {{ tag }}
      </span>
    </div>

    <p v-if="!isLoggedIn" class="guest-note">
      Not logged in? Browse freely.
      <a href="/register">Sign up</a> to save trips &amp; invite friends.
    </p>
  </div>
</div>
</template>

<script lang="ts">
import API from '../../api/axios'
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
  onMounted,
  type PropType,
} from "vue";
import type { Province } from "../../services/home.service";

export default defineComponent({
  name: "HeroSection",
  props: {
    provinces: { type: Array as PropType<Province[]>, default: () => [] },
  },
  setup(props) {
    const current = ref(0);

    const slides = [
      {
        image: "/hero/hero1.jpg",
        tag: "Discover Cambodia",
        title: "Explore Every Corner of Cambodia",
        subtitle:
          "From the misty mountains of Mondulkiri to the pristine shores of Koh Rong, embark on a journey through the heart of the Kingdom of Wonder.",
      },
      {
        image: "/hero/hero2.jpg",
        tag: "Ancient Temples",
        title: "Discover Siem Reap & Angkor Wat",
        subtitle:
          "Walk through centuries of Khmer history among the world's most spectacular temple complexes.",
      },
      {
        image: "/hero/hero3.jpg",
        tag: "Beaches & Islands",
        title: "Explore Hidden Coastal Gems",
        subtitle:
          "Pristine beaches and untouched islands await you along Cambodia's beautiful coastline.",
      },
    ];

    const timer = setInterval(() => {
      current.value = (current.value + 1) % slides.length;
    }, 5000);

    onUnmounted(() => clearInterval(timer));

    const travelerCount = ref<number | null>(null);

    const isLoggedIn = computed(() => {
      const authToken = localStorage.getItem("auth_token");
      const hasValidAuthToken = !!authToken && authToken !== "null" && authToken !== "undefined" && authToken.trim() !== "";
      
      const hasOtherTokens = !!(
        localStorage.getItem('user_data') || 
        localStorage.getItem('user') || 
        localStorage.getItem('token') || 
        localStorage.getItem('access_token')
      );

      return hasValidAuthToken || hasOtherTokens;
    });

    async function fetchTravelerCount() {
      try {
        const res = await API.get(`/users/count`);
        if (res.data) {
          travelerCount.value = res.data.count ?? res.data.data ?? null;
        }
      } catch {
        travelerCount.value = null;
      }
    }

    onMounted(() => fetchTravelerCount());

    const stats = computed(() => ({
      provinces: props.provinces.length || null,
      attractions:
        props.provinces.reduce((s, p) => s + (p.attraction_count || 0), 0) ||
        null,
      travelers: travelerCount.value,
    }));

    const provinceList = computed(() => props.provinces);

    const destination = ref("");
    const travelType = ref("");
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

    const calDays = computed(() => {
      const firstDay = new Date(calYear.value, calMonth.value, 1).getDay();
      const daysInMonth = new Date(
        calYear.value,
        calMonth.value + 1,
        0,
      ).getDate();

      const days: (number | null)[] = Array(firstDay).fill(null);
      for (let d = 1; d <= daysInMonth; d++) days.push(d);
      return days;
    });

    function makeDate(day: number) {
      return new Date(calYear.value, calMonth.value, day);
    }

    function isSelected(day: number | null) {
      if (!day) return false;
      const d = makeDate(day);
      return (
        startDate.value?.getTime() === d.getTime() ||
        endDate.value?.getTime() === d.getTime()
      );
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

    function formatDate(d: Date) {
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    function clearDates() {
      startDate.value = null;
      endDate.value = null;
    }

    function openDatePicker() {
      showCal.value = !showCal.value;
    }

    const dateDisplay = computed(() => {
      if (startDate.value && endDate.value) {
        return `${formatDate(startDate.value)} – ${formatDate(endDate.value)}`;
      }
      if (startDate.value) {
        return `From ${formatDate(startDate.value)}`;
      }
      return "";
    });

    function handleOutsideClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".date-sf")) {
        showCal.value = false;
      }
    }

    onMounted(() => document.addEventListener("click", handleOutsideClick));
    onUnmounted(() =>
      document.removeEventListener("click", handleOutsideClick),
    );

    const quickTags = [
      "Angkor Wat",
      "Kampot",
      "Koh Kong",
      "Phnom Penh",
      "Mondulkiri",
    ];

    function toSlug(v: string) {
      return v.toLowerCase().trim().replace(/\s+/g, "-");
    }

    function doSearch() {
      if (!destination.value) {
        alert("Please select a destination province first!");
        return;
      }

      const params = new URLSearchParams();
      if (travelType.value) params.set("type", travelType.value);
      if (startDate.value)
        params.set("from", startDate.value.toISOString().split("T")[0]);
      if (endDate.value)
        params.set("to", endDate.value.toISOString().split("T")[0]);

      const qs = params.toString();
      window.location.href = qs
        ? `/province/${toSlug(destination.value)}?${qs}`
        : `/province/${toSlug(destination.value)}`;
    }

    function quickSearch(tag: string) {
      const match = props.provinces.find(
        (p) => p.name_en.toLowerCase() === tag.toLowerCase(),
      );

      if (match) {
        window.location.href = `/province/${toSlug(match.name_en)}`;
      } else {
        window.location.href = `/discover?search=${encodeURIComponent(tag)}`;
      }
    }

    return {
      current,
      slides,
      stats,
      provinceList,
      destination,
      travelType,
      quickTags,
      showCal,
      calYear,
      calMonth,
      calDays,
      monthNames,
      startDate,
      endDate,
      dateDisplay,
      isSelected,
      isInRange,
      isRangeStart,
      isRangeEnd,
      isToday,
      isPast,
      selectDay,
      prevMonth,
      nextMonth,
      formatDate,
      clearDates,
      openDatePicker,
      doSearch,
      quickSearch,
      isLoggedIn,
    };
  },
});
</script>

<style scoped>
.hero {
  position: relative;
  height: 90vh;
  min-height: 580px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  image-rendering: -webkit-optimize-contrast;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
  z-index: 0;
}

.hero-bg.active {
  opacity: 1;
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    to bottom,
    rgba(10, 20, 40, 0.05) 0%,
    rgba(10, 20, 40, 0) 20%,
    rgba(10, 20, 40, 0.45) 55%,
    rgba(10, 20, 40, 0.93) 100%
  );
}

.hero-stats {
  position: absolute;
  top: 28px;
  right: 48px;
  z-index: 4;
  display: flex;
  gap: 10px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 10px 20px;
  text-align: center;
  backdrop-filter: blur(6px);
}

.stat-num {
  font-family: "Cinzel", serif;
  font-size: 22px;
  color: #f4d58d;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 3px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.hero-content {
  position: relative;
  z-index: 4;
  padding: 0 60px 50px;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(200, 146, 42, 0.2);
  border: 1px solid rgba(200, 146, 42, 0.55);
  color: #f4d58d;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 18px;
}

.hero-title {
  font-family: "Cinzel", serif;
  font-size: 54px;
  line-height: 1.12;
  color: #fff;
  margin: 0 0 16px;
  max-width: 680px;
  text-shadow: 0 2px 28px rgba(0, 0, 0, 0.5);
}

.hero-sub {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.75;
  font-weight: 300;
  max-width: 540px;
  margin: 0;
}

.hero-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  gap: 8px;
}

.dot {
  width: 28px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.32);
  cursor: pointer;
  transition: all 0.25s;
}

.dot.active {
  background: #c8922a;
  width: 42px;
}

.search-section {
  background: linear-gradient(
    to bottom,
    rgba(10, 20, 40, 0.97),
    rgba(10, 20, 40, 0.9)
  );
  padding: 26px 60px 30px;
}

.search-box {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 12px;
  padding: 6px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
}

.sf {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  border-radius: 9px;
  min-width: 0;
  transition: background 0.15s;
  cursor: pointer;
  position: relative;
}

.sf:hover {
  background: #f7f7f4;
}

.sf-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 5px;
}

.sf-sel {
  font-size: 14px;
  color: #1a1a1a;
  border: none;
  outline: none;
  font-family: "DM Sans", sans-serif;
  background: transparent;
  padding: 0;
  width: 100%;
  cursor: pointer;
}

.sf-opt {
  font-size: 10.5px;
  color: #c0beb8;
  margin-top: 3px;
}

.sf-div {
  width: 1px;
  background: #e8e8e8;
  margin: 12px 0;
  flex-shrink: 0;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  flex-shrink: 0;
  background: #1a2340;
  color: #fff;
  border: none;
  border-radius: 9px;
  padding: 0 32px;
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin: 4px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #2d6a4f;
}

.date-sf {
  user-select: none;
}

.sf-date-display {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.date-placeholder {
  color: #b0aea8;
}

.date-filled {
  color: #1a1a1a;
  font-weight: 500;
  font-size: 13px;
}

.date-clear {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
}

.date-clear:hover {
  background: #f0f0f0;
  color: #333;
}

.calendar-drop {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 300px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid #e0ddd6;
  z-index: 999;
  padding: 16px;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cal-month {
  font-family: "Cinzel", serif;
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
  font-family: "DM Sans", sans-serif;
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
  font-family: "DM Sans", sans-serif;
}

.cal-reset:hover {
  border-color: #ae2012;
  color: #ae2012;
}

.quick-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.q-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

.q-tag {
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  padding: 5px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: "DM Sans", sans-serif;
}

.q-tag:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.guest-note {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.28);
  margin-top: 10px;
}

.guest-note a {
  color: #f4d58d;
  text-decoration: none;
}

@media (max-width: 1200px) {
  .hero-title {
    font-size: 40px;
  }
}

@media (max-width: 768px) {
  .hero {
    height: 72vh;
    min-height: 460px;
  }

  .hero-title {
    font-size: 28px;
    max-width: 100%;
  }

  .hero-content {
    padding: 0 20px 40px;
  }

  .hero-stats {
    top: 12px;
    right: 12px;
    gap: 6px;
  }

  .stat-card {
    padding: 7px 11px;
  }

  .stat-num {
    font-size: 16px;
  }

  .search-section {
    padding: 16px 20px 20px;
  }

  .search-box {
    flex-direction: column;
  }

  .sf-div {
    width: 100%;
    height: 1px;
    margin: 0;
  }

  .search-btn {
    margin: 8px 4px 4px;
    padding: 12px;
    justify-content: center;
    border-radius: 8px;
  }

  .calendar-drop {
    width: 280px;
  }
}
</style>
