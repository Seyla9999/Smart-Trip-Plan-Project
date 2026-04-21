<template>
  <section class="section">
    <div class="section-head">
      <div>
        <h2 class="section-title">Explore Provinces</h2>
        <p class="section-sub">
          Discover the unique charm and heritage of Cambodia's 25 provinces
        </p>
      </div>
      <a href="/discover" class="see-all">View all 25 →</a>
    </div>

    <div class="scroll-wrap">
      <button class="arrow left" @click="scroll(-1)">‹</button>

      <div class="scroll-track" ref="track">
        <div
          v-for="p in provinces"
          :key="p.name"
          class="pcard"
          @click="goToProvince(p.name)"
        >
          <div
            class="pcard-img"
            :style="{
              backgroundImage: `url(${p.image})`,
              backgroundColor: p.color,
            }"
          >
            <div class="pcard-overlay" />
            <span class="pcard-name">{{ p.name }}</span>
            <span class="pcard-kh">{{ p.khmer }}</span>
          </div>

          <div class="pcard-body">
            <div class="pcard-stats">
              <span class="pstat"
                ><span class="pdot green" />{{
                  p.attractions
                }}
                attractions</span
              >
              <span class="pstat"
                ><span class="pdot gold" />{{ p.hostels }} hostels</span
              >
            </div>
          </div>
        </div>
      </div>

      <button class="arrow right" @click="scroll(1)">›</button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

interface Province {
  name: string;
  khmer: string;
  image: string;
  color: string;
  attractions: number;
  hostels: number;
}

export default defineComponent({
  name: "ProvinceScroll",
  setup() {
    const track = ref<HTMLElement | null>(null);

    const provinces: Province[] = [
      {
        name: "Siem Reap",
        khmer: "សៀមរាប",
        image:
          "https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=400&q=70",
        color: "#4A7C59",
        attractions: 42,
        hostels: 18,
      },
      {
        name: "Phnom Penh",
        khmer: "ភ្នំពេញ",
        image:
          "https://images.unsplash.com/photo-1598946329549-8ac25a6c2890?w=400&q=70",
        color: "#3D5A80",
        attractions: 38,
        hostels: 24,
      },
      {
        name: "Sihanoukville",
        khmer: "ព្រះសីហនុ",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70",
        color: "#2196A6",
        attractions: 27,
        hostels: 21,
      },
      {
        name: "Koh Kong",
        khmer: "កោះកុង",
        image:
          "https://images.unsplash.com/photo-1511497584788-876760111969?w=400&q=70",
        color: "#2D6A4F",
        attractions: 19,
        hostels: 8,
      },
      {
        name: "Kampot",
        khmer: "កំពត",
        image:
          "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=70",
        color: "#5C7A3E",
        attractions: 22,
        hostels: 12,
      },
      {
        name: "Battambang",
        khmer: "បាត់ដំបង",
        image:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70",
        color: "#7A6030",
        attractions: 20,
        hostels: 9,
      },
      {
        name: "Ratanakiri",
        khmer: "រតនគិរី",
        image:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=70",
        color: "#6B4C3B",
        attractions: 14,
        hostels: 5,
      },
      {
        name: "Mondulkiri",
        khmer: "មណ្ឌលគិរី",
        image:
          "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
        color: "#3E6B47",
        attractions: 11,
        hostels: 4,
      },
      {
        name: "Kratié",
        khmer: "ក្រចេះ",
        image:
          "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&q=70",
        color: "#4A6741",
        attractions: 9,
        hostels: 3,
      },
      {
        name: "Kep",
        khmer: "កែប",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70",
        color: "#3D8B8B",
        attractions: 8,
        hostels: 6,
      },
    ];

    function scroll(dir: number) {
      if (track.value) {
        track.value.scrollBy({ left: dir * 420, behavior: "smooth" });
      }
    }

    function toSlug(name: string) {
      return name.toLowerCase().trim().replace(/\s+/g, "-");
    }

    function goToProvince(name: string) {
      window.location.href = `/province/${toSlug(name)}`;
    }

    return {
      track,
      provinces,
      scroll,
      goToProvince,
    };
  },
});
</script>

<style scoped>
.section {
  padding: 52px 48px;
  background: #f5f3ee;
}
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 22px;
}
.section-title {
  font-family: "Cinzel", serif;
  font-size: 24px;
  color: #12100e;
  font-weight: 700;
  margin-bottom: 3px;
}
.section-sub {
  font-size: 13px;
  color: #6b6b6b;
}
.see-all {
  font-size: 13px;
  color: #2d6a4f;
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px solid #52b788;
  padding-bottom: 1px;
}
.see-all:hover {
  color: #1b4332;
}

.scroll-wrap {
  position: relative;
}

.scroll-track {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #2d6a4f #e0ddd6;
}

.scroll-track::-webkit-scrollbar {
  height: 3px;
}
.scroll-track::-webkit-scrollbar-thumb {
  background: #2d6a4f;
  border-radius: 2px;
}

.arrow {
  position: absolute;
  top: 42%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e0ddd6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.15s;
}

.arrow:hover {
  background: #2d6a4f;
  color: #fff;
  border-color: #2d6a4f;
}

.left {
  left: -14px;
}
.right {
  right: -14px;
}

.pcard {
  flex-shrink: 0;
  width: 190px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e0ddd6;
  cursor: pointer;
  transition: transform 0.2s;
  scroll-snap-align: start;
}

.pcard:hover {
  transform: translateY(-3px);
}

.pcard-img {
  height: 135px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 10px;
  position: relative;
}

.pcard-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, transparent 55%);
}

.pcard-name {
  position: relative;
  z-index: 1;
  font-family: "Cinzel", serif;
  font-size: 13px;
  color: #fff;
  font-weight: 700;
  display: block;
}

.pcard-kh {
  position: relative;
  z-index: 1;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.65);
  display: block;
  margin-top: 1px;
}

.pcard-body {
  padding: 9px 11px;
}

.pcard-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pstat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b6b6b;
}

.pdot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.green {
  background: #2d6a4f;
}
.gold {
  background: #c8922a;
}

@media (max-width: 768px) {
  .section {
    padding: 36px 20px;
  }
  .section-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
