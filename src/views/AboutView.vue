<template>
  <div class="about">
    <section class="about-hero">
      <div class="ah-bg" />
      <div class="ah-overlay" />
      <div class="ah-content">
        <div class="ah-tag">OUR STORY</div>
        <h1 class="ah-title">
          About <span class="gold">តោះទៅ!</span><br />Cambodia
        </h1>
        <p class="ah-sub">
          A smart travel discovery platform built by students who believe
          Cambodia's beauty deserves to be shared with the world — one journey
          at a time.
        </p>
      </div>
      <div class="ah-scroll-hint">↓ Scroll to explore</div>
    </section>

    <section class="mission-section">
      <div class="container">
        <div class="mission-grid">
          <div class="mission-text">
            <div class="section-tag">OUR MISSION</div>
            <h2 class="section-title">Making Cambodia<br />Easy to Explore</h2>
            <p class="mission-desc">
              Many travelers want to visit Cambodia but don't know where to
              start. Attractions are scattered across social media, planning
              takes too much time, and hidden gems are rarely documented online.
            </p>
            <p class="mission-desc">
              <strong>តោះទៅ! Cambodia</strong> solves this by bringing
              everything into one platform — discovery, planning, community, and
              local knowledge — so every journey through the Kingdom of Wonder
              is unforgettable.
            </p>

            <div class="mission-stats">
              <div class="mstat">
                <span class="mstat-num">{{ stats.provinces || "13" }}</span>
                <span class="mstat-label">Provinces Covered</span>
              </div>
              <div class="mstat">
                <span class="mstat-num">{{
                  stats.attractions ? stats.attractions + "+" : "41+"
                }}</span>
                <span class="mstat-label">Attractions Listed</span>
              </div>
              <div class="mstat">
                <span class="mstat-num">{{ stats.travelers || "7" }}</span>
                <span class="mstat-label">Travelers Joined</span>
              </div>
            </div>
          </div>

          <div class="mission-img-wrap">
            <div
              class="mission-img"
              style="background-image: url(&quot;/hero/hero1.jpg&quot;)"
            />
            <div class="mission-img-card">
              <span class="mic-icon">🏛️</span>
              <div>
                <div class="mic-title">Discover Hidden Gems</div>
                <div class="mic-sub">Places most travelers never find</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="problems-section">
      <div class="container">
        <div class="section-tag center">THE PROBLEM WE SOLVE</div>
        <h2 class="section-title center">Why We Built This</h2>
        <div class="problems-grid">
          <div v-for="p in problems" :key="p.title" class="problem-card">
            <div class="pc-icon">{{ p.icon }}</div>
            <div class="pc-title">{{ p.title }}</div>
            <div class="pc-desc">{{ p.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <div class="section-tag center">WHAT WE OFFER</div>
        <h2 class="section-title center">Platform Features</h2>
        <div class="features-grid">
          <div v-for="f in features" :key="f.title" class="feature-card">
            <div class="fc-icon">{{ f.icon }}</div>
            <div class="fc-title">{{ f.title }}</div>
            <div class="fc-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="flow-section">
      <div class="container">
        <div class="section-tag center">HOW IT WORKS</div>
        <h2 class="section-title center">Plan Your Trip in 3 Steps</h2>
        <div class="flow-steps">
          <div v-for="(step, i) in steps" :key="step.title" class="flow-step">
            <div class="fs-num">{{ String(i + 1).padStart(2, "0") }}</div>
            <div class="fs-icon">{{ step.icon }}</div>
            <div class="fs-title">{{ step.title }}</div>
            <div class="fs-desc">{{ step.desc }}</div>
            <div class="fs-arrow">→</div>
          </div>
        </div>
      </div>
    </section>

    <section class="team-section">
      <div class="container">
        <div class="section-tag center">THE TEAM</div>
        <h2 class="section-title center">Built by ITC Students</h2>
        <p class="team-sub">
          Year 4 students from the Institute of Technology of Cambodia,
          passionate about tourism and technology.
        </p>

        <div class="team-grid">
          <div v-for="m in team" :key="m.name" class="team-card">
            <div
              class="tc-avatar"
              :style="!m.avatar ? { background: m.color } : {}"
            >
              <img
                v-if="m.avatar"
                :src="m.avatar"
                :alt="m.name"
                class="tc-avatar-img"
              />
              <span v-else>{{ m.initials }}</span>
            </div>
            <div class="tc-name">{{ m.name }}</div>
            <div class="tc-role">{{ m.role }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="about-cta">
      <div class="container">
        <h2 class="cta-title">
          {{
            isLoggedIn
              ? "Discover More of Cambodia"
              : "Ready to Explore Cambodia?"
          }}
        </h2>

        <p class="cta-sub">
          {{
            isLoggedIn
              ? "Learn more about Cambodia’s provinces, attractions, hidden gems, and travel experiences through our platform and community."
              : "Discover provinces, attractions, hidden gems, and local experiences across Cambodia. Join our community to save your favorite places and share your journey."
          }}
        </p>

        <div class="cta-buttons">
          <a href="/discover" class="btn-primary">Explore Provinces</a>
          <a
            :href="isLoggedIn ? '/community' : '/register'"
            class="btn-outline"
          >
            {{ isLoggedIn ? "Visit Community" : "Sign Up Free" }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getProvinces } from "@/services/home.service";

export default defineComponent({
  name: "AboutView",
  setup() {
    const stats = ref({ provinces: 0, attractions: 0, travelers: 0 });
    const isLoggedIn = ref(false);

    onMounted(async () => {
      try {
        const provinces = await getProvinces();
        stats.value.provinces = provinces.length;
        stats.value.attractions = provinces.reduce(
          (s, p) => s + (p.attraction_count || 0),
          0,
        );

        const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const res = await fetch(`${base}/api/users/count`);
        if (res.ok) {
          const d = await res.json();
          stats.value.travelers = d.count ?? 0;
        }
      } catch {
        // fallback values shown in template
      }

      const token = localStorage.getItem("auth_token");
      isLoggedIn.value = !!token;
    });

    const problems = [
      {
        icon: "🗺️",
        title: "Scattered Information",
        desc: "Travel info is spread across Facebook, blogs, and word of mouth — hard to find and unreliable.",
      },
      {
        icon: "⏰",
        title: "Planning Takes Too Long",
        desc: "Organizing a trip to Cambodia manually takes hours of research with no guarantee of accuracy.",
      },
      {
        icon: "🔍",
        title: "Hidden Gems Stay Hidden",
        desc: "Many of Cambodia's most beautiful destinations are undocumented and unknown to most travelers.",
      },
      {
        icon: "👥",
        title: "Hard to Travel Together",
        desc: "Coordinating group trips and inviting friends to join a travel plan has no easy solution.",
      },
      {
        icon: "📍",
        title: "No Route Awareness",
        desc: "Travelers don't know what interesting places exist along their route between destinations.",
      },
      {
        icon: "📖",
        title: "No Community Knowledge",
        desc: "Travel experiences and local tips are lost — never organized into a useful knowledge base.",
      },
    ];

    const features = [
      {
        icon: "🔭",
        title: "Discover Attractions",
        desc: "Browse attractions across all provinces, filtered by category, province, and rating.",
      },
      {
        icon: "🗓️",
        title: "Plan Itineraries",
        desc: "Build day-by-day trip plans with our smart planner. Add attractions, set times, and organize your schedule.",
      },
      {
        icon: "🤖",
        title: "AI Recommendations",
        desc: "Get personalized attraction suggestions powered by AI based on your interests and travel style.",
      },
      {
        icon: "👫",
        title: "Invite Friends",
        desc: "Create group trips and invite friends or fellow travelers to join and collaborate on the plan.",
      },
      {
        icon: "📸",
        title: "Share Experiences",
        desc: "Write travel stories, upload photos and videos, and inspire other travelers with your journey.",
      },
      {
        icon: "🌦️",
        title: "Live Weather",
        desc: "Check real-time weather conditions for any province before you pack your bags.",
      },
    ];

    const steps = [
      {
        icon: "🔍",
        title: "Discover",
        desc: "Browse provinces and attractions. Filter by category, search by name, or let AI recommend the best spots for you.",
      },
      {
        icon: "📋",
        title: "Plan",
        desc: "Build your itinerary day by day. Add stops, set times, estimate costs, and invite friends to join your trip.",
      },
      {
        icon: "✈️",
        title: "Explore",
        desc: "Hit the road with your plan ready. Share your experience and photos with the community when you return.",
      },
    ];

    const team = [
      {
        name: "Member 1",
        role: "Frontend Developer",
        initials: "M1",
        color: "#1D3557",
        avatar: "",
      },
      {
        name: "Member 2",
        role: "Backend Developer",
        initials: "M2",
        color: "#2D6A4F",
        avatar: "",
      },
      {
        name: "Member 3",
        role: "UI/UX Designer",
        initials: "M3",
        color: "#C8922A",
        avatar: "",
      },
      {
        name: "Member 4",
        role: "Database & DevOps",
        initials: "M4",
        color: "#5C4B8A",
        avatar: "",
      },
      {
        name: "Member 5",
        role: "Full Stack Developer",
        initials: "M5",
        color: "#AE2012",
        avatar: "",
      },
    ];

    return { stats, isLoggedIn, problems, features, steps, team };
  },
});
</script>

<style scoped>
.about {
  font-family: "DM Sans", sans-serif;
  color: #1a1a1a;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}

.section-tag {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c8922a;
  margin-bottom: 12px;
}

.section-tag.center {
  text-align: center;
}

.section-title {
  font-family: "Cinzel", serif;
  font-size: 36px;
  font-weight: 700;
  color: #12100e;
  line-height: 1.2;
  margin-bottom: 16px;
}

.section-title.center {
  text-align: center;
}

.gold {
  color: #c8922a;
}

.about-hero {
  position: relative;
  height: 60vh;
  min-height: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ah-bg {
  position: absolute;
  inset: 0;
  background: url("/hero/hero2.jpg") center/cover no-repeat;
  background-color: #1a2340;
}

.ah-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 20, 40, 0.85) 0%,
    rgba(10, 20, 40, 0.6) 100%
  );
}

.ah-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 24px;
}

.ah-tag {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #f4d58d;
  border: 1px solid rgba(244, 213, 141, 0.4);
  padding: 5px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
  background: rgba(200, 146, 42, 0.15);
}

.ah-title {
  font-family: "Cinzel", serif;
  font-size: clamp(36px, 5vw, 64px);
  color: #fff;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 20px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

.ah-sub {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.7;
  max-width: 580px;
  margin: 0 auto;
}

.ah-scroll-hint {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.1em;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(6px);
  }
}

.mission-section {
  padding: 90px 0;
  background: #f5f3ee;
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.mission-text .section-title {
  margin-top: 8px;
}

.mission-desc {
  font-size: 15px;
  color: #4a4a4a;
  line-height: 1.8;
  margin-bottom: 16px;
}

.mission-stats {
  display: flex;
  gap: 32px;
  margin-top: 36px;
}

.mstat {
  display: flex;
  flex-direction: column;
}

.mstat-num {
  font-family: "Cinzel", serif;
  font-size: 32px;
  font-weight: 700;
  color: #c8922a;
  line-height: 1;
}

.mstat-label {
  font-size: 11px;
  color: #888;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mission-img-wrap {
  position: relative;
}

.mission-img {
  height: 420px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  background-color: #2d6a4f;
}

.mission-img-card {
  position: absolute;
  bottom: -20px;
  left: -20px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e0ddd6;
}

.mic-icon {
  font-size: 24px;
}

.mic-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.mic-sub {
  font-size: 11.5px;
  color: #888;
  margin-top: 2px;
}

.problems-section {
  padding: 90px 0;
  background: #fff;
}

.problems-section .section-title {
  margin-bottom: 48px;
}

.problems-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.problem-card {
  background: #f5f3ee;
  border-radius: 14px;
  padding: 28px 24px;
  border: 1px solid #e0ddd6;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.problem-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.pc-icon {
  font-size: 28px;
  margin-bottom: 14px;
}

.pc-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-family: "Cinzel", serif;
}

.pc-desc {
  font-size: 13.5px;
  color: #666;
  line-height: 1.65;
}

.features-section {
  padding: 90px 0;
  background: #1a2340;
}

.features-section .section-tag {
  color: #f4d58d;
}

.features-section .section-title {
  color: #fff;
  margin-bottom: 48px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 28px 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.fc-icon {
  font-size: 28px;
  margin-bottom: 14px;
}

.fc-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.fc-desc {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.65;
}

.flow-section {
  padding: 90px 0;
  background: #f5f3ee;
}

.flow-section .section-title {
  margin-bottom: 56px;
}

.flow-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.flow-step {
  text-align: center;
  padding: 40px 28px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e0ddd6;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
}

.flow-step:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.fs-num {
  font-family: "Cinzel", serif;
  font-size: 48px;
  font-weight: 700;
  color: #e0ddd6;
  line-height: 1;
  margin-bottom: 12px;
}

.fs-icon {
  font-size: 32px;
  margin-bottom: 14px;
}

.fs-title {
  font-family: "Cinzel", serif;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.fs-desc {
  font-size: 13.5px;
  color: #666;
  line-height: 1.65;
  flex: 1;
}

.fs-arrow {
  font-size: 20px;
  color: #c8922a;
  margin-top: 20px;
  font-weight: 300;
}

.team-section {
  padding: 90px 0;
  background: #fff;
}

.team-sub {
  text-align: center;
  font-size: 15px;
  color: #666;
  margin-bottom: 48px;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
}

.team-grid {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.team-card {
  text-align: center;
  padding: 32px 28px;
  background: #f5f3ee;
  border-radius: 16px;
  border: 1px solid #e0ddd6;
  min-width: 160px;
  transition: all 0.2s;
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.tc-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 auto 14px;
  overflow: hidden;
}

.tc-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.tc-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.tc-role {
  font-size: 12px;
  color: #888;
}

.about-cta {
  padding: 100px 48px;
  background:
    linear-gradient(rgba(10, 20, 40, 0.72), rgba(10, 20, 40, 0.72)),
    url("/hero/hero2.jpg") center/cover no-repeat;
  text-align: center;
}

.cta-title {
  font-family: "Cinzel", serif;
  font-size: 48px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 18px;
}

.cta-sub {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.82);
  margin-bottom: 36px;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.8;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 15px 36px;
  background: #c8922a;
  color: #fff;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition:
    background 0.2s,
    transform 0.2s;
}

.btn-primary:hover {
  background: #a8771f;
  transform: translateY(-1px);
}

.btn-outline {
  padding: 15px 36px;
  background: transparent;
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}

@media (max-width: 1024px) {
  .problems-grid,
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .mission-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .mission-img {
    height: 280px;
  }

  .mission-img-card {
    left: 0;
  }

  .mission-stats {
    gap: 20px;
  }

  .problems-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }

  .flow-steps {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 26px;
  }

  .about-cta {
    padding: 60px 20px;
  }

  .cta-title {
    font-size: 28px;
  }
}
</style>
