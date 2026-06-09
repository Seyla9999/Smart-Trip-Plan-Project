<template>
  <section class="cta">
    <div class="cta-bg" />
    <div class="cta-overlay" />

    <div class="cta-content">
      <h2 class="cta-title">Ready to explore more?</h2>

      <p v-if="isLoggedIn" class="cta-sub">
        Discover provinces, save your favorite places, and share your travel
        experiences with the community.
      </p>

      <p v-else class="cta-sub">
        Discover provinces, find attractions, and join the community<br />
        to save your favorite places and share your experiences.
      </p>

      <div class="cta-btns">
        <a href="/discover" class="btn-gold">Explore Provinces</a>

        <a v-if="isLoggedIn" href="/community" class="btn-outline">
          Go to Community
        </a>

        <a v-else href="/login" class="btn-outline">
          Sign In / Join Community
        </a>
      </div>

      <div class="cta-features">
        <div class="cta-feature">
          <span class="feature-icon">📍</span>
          <span>Explore provinces and attractions</span>
        </div>
        <div class="cta-feature">
          <span class="feature-icon">❤️</span>
          <span>Save your favorite places</span>
        </div>
        <div class="cta-feature">
          <span class="feature-icon">👥</span>
          <span>Join the travel community</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";

export default defineComponent({
  name: "CtaBanner",
  setup() {
    const isLoggedIn = ref(false);

    function checkAuth() {
      const token = localStorage.getItem("auth_token");
      const user = localStorage.getItem("user_data");
      isLoggedIn.value = !!token || !!user;
    }

    function handleStorageChange() {
      checkAuth();
    }

    onMounted(() => {
      checkAuth();
      window.addEventListener("storage", handleStorageChange);
    });

    onUnmounted(() => {
      window.removeEventListener("storage", handleStorageChange);
    });

    return {
      isLoggedIn,
    };
  },
});
</script>

<style scoped>
.cta {
  position: relative;
  padding: 100px 48px 72px;
  text-align: center;
  overflow: hidden;
}

.cta-bg {
  position: absolute;
  inset: 0;
  background-image: url("https://images.unsplash.com/photo-1598946329549-8ac25a6c2890?w=1600&q=85");
  background-size: cover;
  background-position: center;
}

.cta-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 20, 40, 0.82);
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 980px;
  margin: 0 auto;
}

.cta-title {
  font-family: "Cinzel", serif;
  font-size: 54px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 18px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

.cta-sub {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.8;
  font-weight: 400;
  margin-bottom: 34px;
}

.cta-btns {
  display: flex;
  gap: 18px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 34px;
}

.btn-gold {
  padding: 16px 34px;
  background: #d4a11e;
  border: 1px solid #d4a11e;
  color: #fff;
  font-family: "DM Sans", sans-serif;
  font-size: 15px;
  font-weight: 700;
  border-radius: 10px;
  text-decoration: none;
  transition:
    transform 0.2s,
    opacity 0.2s;
}

.btn-gold:hover {
  opacity: 0.94;
  transform: translateY(-1px);
}

.btn-outline {
  padding: 16px 34px;
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.48);
  color: rgba(255, 255, 255, 0.94);
  font-family: "DM Sans", sans-serif;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: rgba(255, 255, 255, 0.86);
  color: #fff;
  transform: translateY(-1px);
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.cta-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  padding: 0 18px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-feature:last-child {
  border-right: none;
}

.feature-icon {
  font-size: 22px;
}

@media (max-width: 768px) {
  .cta {
    padding: 72px 20px 56px;
  }

  .cta-title {
    font-size: 34px;
  }

  .cta-sub {
    font-size: 14px;
  }

  .cta-btns {
    flex-direction: column;
    align-items: center;
  }

  .btn-gold,
  .btn-outline {
    width: 100%;
    max-width: 320px;
  }

  .cta-features {
    flex-direction: column;
    gap: 14px;
  }

  .cta-feature {
    justify-content: center;
    border-right: none;
    padding: 0;
  }
}
</style>
