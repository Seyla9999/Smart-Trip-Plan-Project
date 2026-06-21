<template>
  <section class="sponsor-section">
    <div class="sponsor-wrap">
      <p class="sponsor-label">SUPPORTED BY OUR SPONSORS</p>
      <h2 class="sponsor-title">Our Sponsors & Partners</h2>

      <div v-if="loading" class="sponsor-grid">
        <div v-for="i in 5" :key="i" class="sponsor-card skeleton">
          <div class="sk-logo" />
          <div class="sk-line short" />
          <div class="sk-line" />
          <div class="sk-line tiny" />
        </div>
      </div>

      <div v-else-if="sponsors.length > 0" class="sponsor-grid">
        <a
          v-for="s in sponsors"
          :key="s.id"
          class="sponsor-card"
          :href="s.website_url || '#'"
          target="_blank"
          rel="noopener noreferrer"
          :title="s.name"
        >
          <template v-if="s.logo_url || getLocalSponsorLogo(s.name)">
            <img
              :src="s.logo_url || getLocalSponsorLogo(s.name) || ''"
              :alt="s.name"
              class="sponsor-logo-img"
            />
          </template>

          <template v-else>
            <div class="sponsor-text-logo" :class="`tier-${s.tier || 'gold'}`">
              <div class="stl-abbr">{{ getAbbr(s.name) }}</div>
            </div>
          </template>

          <div class="sponsor-name">{{ s.name }}</div>
          <div class="sponsor-role">{{ getPartnerRole(s.name) }}</div>
          <div class="sponsor-accent" :class="`accent-${s.tier || 'gold'}`" />
        </a>
      </div>

      <div v-else class="sponsor-grid">
        <div v-for="s in staticSponsors" :key="s.name" class="sponsor-card">
          <template v-if="s.logo_url">
            <img :src="s.logo_url" :alt="s.name" class="sponsor-logo-img" />
          </template>

          <template v-else>
            <div class="sponsor-text-logo" :class="`tier-${s.tier}`">
              <div class="stl-abbr">{{ s.abbr }}</div>
            </div>
          </template>

          <div class="sponsor-name">{{ s.name }}</div>
          <div class="sponsor-role">{{ s.role }}</div>
          <div class="sponsor-accent" :class="`accent-${s.tier}`" />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Sponsor } from "../../services/home.service";

export default defineComponent({
  name: "SponsorBar",
  props: {
    sponsors: { type: Array as PropType<Sponsor[]>, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  setup() {
    function getAbbr(name: string): string {
      if (!name) return "?";
      const words = name.trim().split(/\s+/);
      if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
      return words
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    }

    function getPartnerRole(name: string): string {
      const lower = name.toLowerCase();

      if (lower.includes("tourism")) return "Tourism Partner";
      if (lower.includes("unesco")) return "Heritage Partner";
      if (lower.includes("air") || lower.includes("airways"))
        return "Travel Partner";
      if (lower.includes("hotel")) return "Hospitality Partner";
      if (
        lower.includes("phnom penh") ||
        lower.includes("city") ||
        lower.includes("municipality")
      )
        return "City Partner";

      return "Official Partner";
    }

    function getLocalSponsorLogo(name: string): string | null {
      const lower = name.toLowerCase();

      if (lower.includes("ministry of tourism")) return "/sponsors/mot.png";
      if (lower.includes("unesco")) return "/sponsors/unesco.png";
      if (lower.includes("cambodia airways"))
        return "/sponsors/cambodia-airways.jpg";
      if (lower.includes("angkor hotels"))
        return "/sponsors/angkor-hotels-group.png";
      if (lower.includes("phnom penh")) return "/sponsors/pp-municipality.jpg";

      return null;
    }

    const staticSponsors = [
      {
        name: "Ministry of Tourism Cambodia",
        abbr: "MO",
        role: "Tourism Partner",
        tier: "gold",
        logo_url: "/sponsors/mot.png",
      },
      {
        name: "UNESCO Cambodia",
        abbr: "UC",
        role: "Heritage Partner",
        tier: "silver",
        logo_url: "/sponsors/unesco.png",
      },
      {
        name: "Cambodia Airways",
        abbr: "CA",
        role: "Travel Partner",
        tier: "silver",
        logo_url: "/sponsors/cambodia-airways.jpg",
      },
      {
        name: "Angkor Hotels Group",
        abbr: "AH",
        role: "Hospitality Partner",
        tier: "bronze",
        logo_url: "/sponsors/angkor-hotels-group.png",
      },
      {
        name: "Phnom Penh Municipality",
        abbr: "PP",
        role: "City Partner",
        tier: "bronze",
        logo_url: "/sponsors/pp-municipality.jpg",
      },
    ];

    return {
      getAbbr,
      getPartnerRole,
      getLocalSponsorLogo,
      staticSponsors,
    };
  },
});
</script>

<style scoped>
.sponsor-section {
  background: #fff;
  padding: 56px 48px 60px;
  border-top: 1px solid #e7e1d8;
  border-bottom: 1px solid #e7e1d8;
}

.sponsor-wrap {
  max-width: 1240px;
  margin: 0 auto;
}

.sponsor-label {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7f8f81;
  margin-bottom: 14px;
}

.sponsor-title {
  text-align: center;
  margin: 0 0 34px;
  font-family: "Cinzel", serif;
  font-size: 44px;
  line-height: 1.2;
  color: #1b563f;
  font-weight: 700;
}

.sponsor-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 22px;
}

.sponsor-card {
  background: #fff;
  border: 1px solid #e6e1d8;
  border-radius: 20px;
  min-height: 230px;
  padding: 28px 18px 22px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.sponsor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
  border-color: #d7d0c5;
}

.sponsor-logo-img {
  height: 84px;
  max-width: 130px;
  object-fit: contain;
  margin-bottom: 18px;
}

.sponsor-text-logo {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.stl-abbr {
  font-family: "Cinzel", serif;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

.sponsor-name {
  color: #1c1a17;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  margin-bottom: 10px;
  min-height: 42px;
}

.sponsor-role {
  color: #7a7a7a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sponsor-accent {
  width: 42px;
  height: 2px;
  border-radius: 999px;
  margin-top: 16px;
}

.tier-gold {
  color: #c8922a;
  background: transparent;
}

.tier-silver {
  color: #335f9d;
  background: transparent;
}

.tier-bronze {
  color: #2d6a4f;
  background: transparent;
}

.accent-gold {
  background: #c8922a;
}

.accent-silver {
  background: #335f9d;
}

.accent-bronze {
  background: #2d6a4f;
}

.skeleton {
  pointer-events: none;
}

.sk-logo {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  margin-bottom: 18px;
  background: linear-gradient(90deg, #ece7df 25%, #f5f2ec 50%, #ece7df 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.sk-line {
  width: 80%;
  height: 12px;
  border-radius: 999px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #ece7df 25%, #f5f2ec 50%, #ece7df 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.sk-line.short {
  width: 46%;
}

.sk-line.tiny {
  width: 36%;
  height: 8px;
  margin-top: 6px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1100px) {
  .sponsor-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .sponsor-title {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .sponsor-section {
    padding: 40px 20px 44px;
  }

  .sponsor-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .sponsor-title {
    font-size: 30px;
  }

  .sponsor-card {
    min-height: 210px;
    padding: 22px 14px 18px;
  }

  .sponsor-name {
    font-size: 14px;
  }
}

@media (max-width: 520px) {
  .sponsor-grid {
    grid-template-columns: 1fr;
  }
}
</style>
