<template>
  <footer class="footer">

    <div class="footer-main">
      <div class="footer-wrap">
        <div class="footer-grid">

          <div class="col-brand">
            <div class="brand-row">
              <img src="/logo.png" alt="logo" class="footer-logo" />
              <span class="brand-name">តោះទៅ! Cambodia</span>
            </div>
            <p class="brand-desc">Discover Cambodia's hidden gems, plan your journey, and travel with friends.</p>
            <div class="socials">
              <a href="#" class="social">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#" class="social">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" class="social">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
            </div>
          </div>

          <div class="col">
            <h6 class="col-title">Partner</h6>
            <ul>
              <li><a href="#">Ministry</a></li>
              <li><a href="#">Restaurants</a></li>
              <li><a href="#">Tour Guide</a></li>
              <li><a href="#">Hotels</a></li>
            </ul>
          </div>

          <div class="col">
            <h6 class="col-title">Support</h6>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Ministry of Culture</a></li>
              <li><a href="#">Returns</a></li>
            </ul>
          </div>

          <div class="col">
            <h6 class="col-title">Reach Us</h6>
            <div class="reach">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>
              <span>(+971) 58 8284186</span>
            </div>
            <div class="reach">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Phnom Penh</span>
            </div>
          </div>

          <div class="col">
            <h6 class="col-title">Newsletter</h6>
            <p class="nl-desc">Subscribe to get special offers and updates.</p>
            <div class="nl-form">
              <input v-model="email" type="email" placeholder="Enter your email" class="nl-input" />
              <button @click="subscribe" class="nl-btn" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </button>
            </div>
            <p v-if="done" class="nl-done">✓ Subscribed!</p>
          </div>

        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-wrap footer-bottom-inner">
        <p>© 2025 តោះទៅ! Cambodia. All rights reserved.</p>
        <div class="bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Returns</a>
        </div>
      </div>
    </div>

  </footer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Footer',
  setup() {
    const email = ref<string>('')
    const done  = ref<boolean>(false)
    function subscribe() {
      if (email.value.includes('@')) {
        done.value  = true
        email.value = ''
        setTimeout(() => { done.value = false }, 4000)
      }
    }
    return { email, done, subscribe }
  }
})
</script>

<style scoped>
.footer { font-family: 'DM Sans', sans-serif; }

.footer-main { background: #111827; padding: 52px 0 36px; }
.footer-wrap  { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
.footer-grid  {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 40px;
}

.brand-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.footer-logo { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
.brand-name  { font-family: 'Cinzel', serif; font-size: 16px; font-weight: 700; color: #fff; }
.brand-desc  { font-size: 13px; color: rgba(255,255,255,0.38); line-height: 1.75; margin-bottom: 16px; max-width: 210px; }

.socials { display: flex; gap: 10px; }
.social  {
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.45); text-decoration: none;
  transition: all 0.2s;
}
.social:hover { border-color: #C8922A; color: #F4D58D; }

.col-title { font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 14px; }
.col ul    { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.col ul li a { font-size: 13.5px; color: rgba(255,255,255,0.52); text-decoration: none; transition: color 0.18s; }
.col ul li a:hover { color: #fff; }

.reach { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 13.5px; color: rgba(255,255,255,0.52); }
.reach svg { flex-shrink: 0; color: rgba(255,255,255,0.35); }

.nl-desc  { font-size: 13px; color: rgba(255,255,255,0.38); margin-bottom: 12px; line-height: 1.6; }
.nl-form  { display: flex; }
.nl-input {
  flex: 1;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.14);
  border-right: none;
  border-radius: 7px 0 0 7px;
  padding: 10px 13px;
  font-size: 13px;
  color: #fff;
  outline: none;
  font-family: 'DM Sans', sans-serif;
}
.nl-input::placeholder { color: rgba(255,255,255,0.28); }
.nl-input:focus { border-color: rgba(200,146,42,0.5); }
.nl-btn {
  background: #C8922A;
  border: none;
  border-radius: 0 7px 7px 0;
  padding: 0 14px;
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.nl-btn:hover { background: #b07820; }
.nl-done { font-size: 12.5px; color: #52B788; margin-top: 8px; }

.footer-bottom { background: #0D1321; padding: 16px 0; }
.footer-bottom-inner {
  display: flex; align-items: center; justify-content: space-between;
}
.footer-bottom p { font-size: 12.5px; color: rgba(255,255,255,0.3); margin: 0; }
.bottom-links { display: flex; gap: 20px; }
.bottom-links a { font-size: 12.5px; color: rgba(255,255,255,0.3); text-decoration: none; transition: color 0.18s; }
.bottom-links a:hover { color: rgba(255,255,255,0.7); }


@media (max-width: 1024px) {
  .footer-grid { grid-template-columns: 1fr 1fr 1fr; }
  .col-brand   { grid-column: span 3; }
}
@media (max-width: 640px) {
  .footer-wrap  { padding: 0 20px; }
  .footer-grid  { grid-template-columns: 1fr 1fr; }
  .col-brand    { grid-column: span 2; }
  .footer-bottom-inner { flex-direction: column; gap: 10px; text-align: center; }
}
</style>