<template>
  <button class="chatbot-btn" @click="$emit('toggle')">
    <img :src="botIcon" alt="Chat Bot" />
  </button>
</template>

<script setup lang="ts">
import botIcon from '@/assets/bot.png'

defineEmits(['toggle'])
</script>

<style scoped>
.chatbot-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;

  width: 50px;
  height: 50px;

  border: none;
  border-radius: 50%;

  /* background: #c8922a; */

  
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  z-index: 9999;

  box-shadow: 0 8px 20px rgba(0,0,0,.25);
  overflow: hidden;
}

.chatbot-btn:hover {
  /* box-shadow: 0 12px 30px rgba(0,0,0,.35);
   */
   transform: translateY(-5px);
   transition: transform 0.2s ease;
/* transform : scale(1.05); */
}
.chatbot-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>