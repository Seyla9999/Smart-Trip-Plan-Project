<template>
  <div class="chat-window" role="dialog" aria-label="Chat Assistant">
    
    <div class="header">
      <span class="title">Smart Trip Assistant</span>
      <div class="header-actions">
        <button class="icon-btn new-chat-btn" @click="newChat" title="New Chat" aria-label="Start new chat">+</button>
        <button class="icon-btn close-btn" @click="$emit('close')" title="Close" aria-label="Close chat window">✖</button>
      </div>
    </div>

    <div class="messages" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message-wrapper', msg.sender]"
      >
        <div class="message-bubble markdown-body" v-html="renderMarkdown(msg.text)"></div>
      </div>

      <div v-if="isThinking" class="message-wrapper bot">
        <div class="message-bubble thinking-bubble">
          <div class="typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="suggestions-container" v-if="suggestedQuestions.length > 0">
      <button
        v-for="(question, index) in suggestedQuestions"
        :key="index"
        class="suggestion-chip"
        @click="sendSuggestedMessage(question)"
        :disabled="isThinking"
      >
        {{ question }}
      </button>
    </div>

    <form class="input-area" @submit.prevent="sendMessage">
      <input
        v-model="input"
        type="text"
        placeholder="Type your message..."
        :disabled="isThinking"
        aria-label="Type your message"
      />
      <button type="submit" :disabled="isThinking || !input.trim()">
        {{ isThinking ? '...' : 'Send' }}
      </button>
    </form>

  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import axios from 'axios'
import { marked } from 'marked' // CHANGE 2: Imported marked

defineEmits(['close'])

interface ChatMessage {
  sender: 'user' | 'bot'
  text: string
}

const isThinking = ref(false)
const messages = ref<ChatMessage[]>([])
const suggestedQuestions = ref<string[]>([])
const input = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// CHANGE 3: Helper function to safely parse markdown
const renderMarkdown = (text: string) => {
  if (!text) return ''
  return marked.parse(text)
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

const newChat = async () => {
  messages.value = [
    {
      sender: 'bot',
      text: '👋 Hi! Where would you like to travel today?',
    },
  ]
  suggestedQuestions.value = [
    "📍 Top places in Phnom Penh",
    "🏝️ Best beaches in Cambodia",
    "🍜 Famous Cambodian food",
    "🗓️ Plan a 3-day trip",
    
  ]
  await scrollToBottom()
}

onMounted(() => {
  newChat()
})

const sendSuggestedMessage = (question: string) => {
  input.value = question
  sendMessage()
}

const sendMessage = async () => {
  const userMessage = input.value.trim()
  if (!userMessage || isThinking.value) return

  messages.value.push({ sender: 'user', text: userMessage })
  
  input.value = ''
  suggestedQuestions.value = [] 
  await scrollToBottom()

  try {
    isThinking.value = true
    await scrollToBottom()

    const response = await axios.post(
      'http://localhost:3000/chatbot/chat',
      { message: userMessage }
    )

    messages.value.push({
      sender: 'bot',
      text: response.data.reply || 'Sorry, I am not sure how to respond to that.',
    })

  } catch (error) {
    console.error('Chatbot API Error:', error)
    messages.value.push({
      sender: 'bot',
      text: '⚠️ Server temporarily unavailable. Please try again later.',
    })
  } finally {
    isThinking.value = false
    await scrollToBottom()
  }
}
</script>

<style scoped>
/* Keep all your previous CSS exactly the same, and just add these Markdown styles at the bottom! */

/* ... (Your existing CSS from previous steps) ... */

.chat-window {
  position: fixed;
  right: 24px;
  bottom: 100px;
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.header {
  background: #1a2340;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title { font-weight: 600; font-size: 1.1rem; }
.header-actions { display: flex; gap: 12px; }

.icon-btn {
  background: transparent; border: none; color: white;
  font-size: 18px; cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s, transform 0.2s;
}
.icon-btn:hover { opacity: 0.8; transform: scale(1.1); }

.messages {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}

.message-wrapper { display: flex; width: 100%; }
.message-wrapper.user { justify-content: flex-end; }
.message-wrapper.bot { justify-content: flex-start; }

.message-bubble {
  max-width: 80%; padding: 12px 16px;
  border-radius: 14px; word-break: break-word;
  line-height: 1.4; font-size: 0.95rem;
}

.user .message-bubble {
  background: #c8922a; color: white; border-bottom-right-radius: 4px;
}

.bot .message-bubble {
  background: #f2f2f2; color: #333; border-bottom-left-radius: 4px;
}

/* --- CHANGE 4: Markdown specific styling inside the bubbles --- */
/* This ensures the HTML generated by 'marked' looks clean inside the bubbles */
:deep(.markdown-body p) {
  margin: 0 0 8px 0; /* Adds spacing between paragraphs */
}
:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body ul), :deep(.markdown-body ol) {
  margin: 8px 0 8px 20px; /* Indents bullet points properly */
  padding: 0;
}
:deep(.markdown-body li) {
  margin-bottom: 4px;
}
:deep(.markdown-body strong) {
  font-weight: 700;
}

/* ... (Keep the rest of your typing, suggestions, and input CSS here) ... */
.thinking-bubble { padding: 14px 18px; }
.typing { display: flex; gap: 6px; align-items: center; height: 12px; }
.typing span { width: 8px; height: 8px; border-radius: 50%; background: #c8922a; animation: bounce 1.2s infinite ease-in-out; }
.typing span:nth-child(1) { animation-delay: 0s; }
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }

.suggestions-container {
  display: flex; gap: 8px; padding: 10px 16px; overflow-x: auto; background: #fafafa; border-top: 1px solid #eee; scrollbar-width: none;
}
.suggestions-container::-webkit-scrollbar { display: none; }
.suggestion-chip {
  white-space: nowrap; background: white; border: 1px solid #c8922a; color: #c8922a; padding: 8px 14px; border-radius: 16px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease;
}
.suggestion-chip:hover:not(:disabled) { background: #c8922a; color: white; }
.suggestion-chip:disabled { opacity: 0.6; cursor: not-allowed; }

.input-area { display: flex; padding: 12px; gap: 8px; background: white; border-top: 1px solid #eee; }
.input-area input { flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s; outline: none; }
.input-area input:focus { border-color: #1a2340; }
.input-area input:disabled { background: #f9f9f9; cursor: not-allowed; }
.input-area button { background: #c8922a; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; transition: background-color 0.2s, transform 0.1s; }
.input-area button:hover:not(:disabled) { cursor: pointer; background: #b58326; }
.input-area button:active:not(:disabled) { transform: scale(0.98); }
.input-area button:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
  .chat-window { width: calc(100vw - 32px); height: 70vh; right: 16px; bottom: 90px; }
}
</style>