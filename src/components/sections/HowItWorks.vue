<template>
  <section class="section">
    <div class="section-head-center">
      <h2 class="section-title">How It Works</h2>
    </div>

    <div class="steps">
      <div v-for="(step, i) in steps" :key="i" class="step">
        <div class="step-num">{{ i + 1 }}</div>
        <div class="step-icon">{{ step.icon }}</div>
        <div class="step-title">{{ step.title }}</div>
        <div class="step-desc">{{ step.desc }}</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "HowItWorks",
  setup() {
    const steps = [
      {
        icon: "📍",
        title: "Choose Province",
        desc: "Select a province in Cambodia and start exploring attractions, nature, culture, and hidden gems.",
      },
      {
        icon: "🔎",
        title: "Find Attractions",
        desc: "Browse attraction cards, use filters, and sort places by rating or popularity to match your travel style.",
      },
      {
        icon: "🗺️",
        title: "View on Map",
        desc: "Open the map view to see attraction locations, numbered points, and places around your selected province.",
      },
      {
        icon: "❤️",
        title: "Save & Share",
        desc: "Bookmark your favorite places and share travel stories or experiences with the community.",
      },
    ];

    return { steps };
  },
});
</script>

<style scoped>
.section {
  padding: 52px 48px;
  background: #fff;
}

.section-head-center {
  text-align: center;
  margin-bottom: 36px;
}

.section-title {
  font-family: "Cinzel", serif;
  font-size: 26px;
  color: #12100e;
  font-weight: 700;
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  position: relative;
}

.steps::before {
  content: "";
  position: absolute;
  top: 26px;
  left: 12%;
  right: 12%;
  height: 1px;
  background: #e0ddd6;
  z-index: 0;
}

.step {
  text-align: center;
  padding: 8px;
  position: relative;
  z-index: 1;
}

.step-num {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #2d6a4f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Cinzel", serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0 auto 14px;
}

.step-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.step-title {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-family: "DM Sans", sans-serif;
}

.step-desc {
  font-size: 13px;
  color: #6b6b6b;
  line-height: 1.65;
  font-family: "DM Sans", sans-serif;
}

@media (max-width: 768px) {
  .section {
    padding: 36px 20px;
  }

  .steps {
    grid-template-columns: 1fr 1fr;
  }

  .steps::before {
    display: none;
  }
}
</style>
