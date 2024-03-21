<script setup>
import { ref } from 'vue';
import ChatButton from './ChatButton.vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
});

const message = ref(props.message);
const buttons = ref(message && message.value.buttons);
const disableButtons = ref(false);

const handleOnButtonClick = (button) => {
  button.action && button.action();
};
</script>

<template>
  <div
    class="message"
    :class="{ 'message--from-me': message.fromMe }"
  >
    <div class="message-author">
      {{ message.author.name }}
    </div>
    <div class="message-conteudo">
      {{ message.message }}
    </div>
    <div class="message-buttons" v-if="buttons">
      <chat-button
        v-for="(button, btnIndex) in buttons"
        :key="`${message.uuid}-btn-${btnIndex}`"
        :button="button"
        :disabled="disableButtons"
        @button-click="handleOnButtonClick(button)"
      />
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  margin: 10px 10px 10px 0;
  animation: slide-up 0.5s ease;
}
.message--from-me {
  align-items: flex-end;
  justify-content: flex-end;
}
.message-conteudo {
  color: var(--background-color);
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  padding: 10px;
  min-width: 40%;
  max-width: 80%;
  word-wrap: break-word;
  align-self: flex-start;
  justify-self: flex-start;
  display: inline-block;
  text-align: left;
  font-size: 1.0rem;
  line-height: 1.5;
  border-bottom-left-radius: 0;
}
.message--from-me .message-conteudo {
  align-self: flex-end;
  justify-self: flex-end;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 0;
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