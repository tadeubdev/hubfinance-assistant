<script setup>
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ChatButton from './ChatButton.vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
});

const message = ref(props.message);
const buttons = ref(message.value.buttons || []);
const disableButtons = ref(false);
// { id, value, action }
const input = ref(message.value.input || '');

const handleOnButtonClick = (button) => {
  button.action && button.action();
};

const handleOnKeyUp = (value) => {
  if (!value.trim() || !input.value.action) {
    return;
  }
  input.value.action(value.trim());
};
</script>

<template>
  <div
    class="message"
    :class="{ 'message--from-me': message.fromMe }"
  >
    <img
      :src="message.author.image"
      :alt="message.author.name"
      class="message-author-image"
    />
    <div class="message-right">
      <div class="message-author">
        <span>{{ message.author.name }}</span>
      </div>
      <div class="message-conteudo" v-html="message.message"></div>
      <div class="message-buttons" v-if="buttons && buttons.length">
        <chat-button
          v-for="(button, btnIndex) in buttons"
          :key="`${message.uuid}-btn-${btnIndex}`"
          :button="button"
          :disabled="disableButtons"
          @button-click="handleOnButtonClick(button)"
        />
      </div>
      <div class="message-input" :class="{ 'text-uppercase': input.id === 'input-pesquisar-acao' }" v-if="input">
        <font-awesome-icon
          :icon="input.icon"
          v-if="input.icon"
        />
        <input
          v-model="input.value"
          :type="input.type || 'text'"
          class="message-input-field"
          :placeholder="input.placeholder || 'Digite algo...'"
          @keyup.enter="handleOnKeyUp($event.target.value)"
        />
        <button
          class="message-button-send"
          @click="handleOnKeyUp(input.value)"
          :disabled="!input.value.trim()"
        >
          Enter
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: grid;
  grid-template-columns: 30px 1fr;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
  animation: slide-up 0.5s ease;
}
@media screen and (max-width: 430px) {
  .message {
    grid-template-columns: 1fr;
  }
  .message img {
    display: none;
  }
}
.message-author-image {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 5px;
}
.message-right {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
.message-author {
  font-weight: 600;
}
.message-conteudo {
  color: var(--background-color);
  min-width: 40%;
  word-wrap: break-word;
  align-self: flex-start;
  justify-self: flex-start;
  display: inline-block;
  text-align: left;
  font-size: 1.0rem;
  line-height: 1.5;
}
.message-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-top: 10px;
  gap: 15px;
  flex-wrap: wrap;
}
.disabled {
  background-color: var(--primary-color);
  color: var(--background-color);
  cursor: not-allowed;
  pointer-events: none;
}
.message-input {
  width: 350px;
  margin: 20px 0;
  padding: 9px 10px;
  color: #ffffff;
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}
.message-input-field::placeholder {
  color: rgba(255,255,255,.6);
}
.message-input-field {
  width: 100%;
  border: none;
  background: none;
  font-size: 1.0rem;
  line-height: 1.5;
  font-weight: 600;
  color: #FFFFFF;
  padding: 0 10px;
  outline: none;
}
.message-input svg {
  margin: 0 5px 0 13px;
  color: var(--primary-color);
}
.message-button-send {
  background-color: var(--primary-color);
  color: var(--background-color);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.9rem;
  line-height: 1.5;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}
.text-uppercase {
  text-transform: uppercase;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>