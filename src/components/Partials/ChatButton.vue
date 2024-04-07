<script setup>
import { ref } from "vue";
const emit = defineEmits(['button-click']);

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  button: {
    type: Object,
    required: true
  }
});

const button = ref(props.button);
</script>

<template>
  <button
    class="chat-button"
    @click="emit('button-click')"
    :disabled="props.disabled"
    :class="{
      'chat-button--disabled': props.disabled,
      'active': props.button.active,
    }"
  >
    <img
      v-if="button.image"
      :src="button.image"
      :alt="button.text"
    />
    <p v-html="button.text"></p>
  </button>
</template>

<style scoped>
.chat-button {
  padding: 10px;
  border: 2px solid rgba(255,255,255,.2);
  border-radius: 6px;
  background-color: transparent;
  color: var(--background-color);
  font-size: 1.0rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
}

.chat-button p {
  margin: 0;
}

.chat-button img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border-radius: 3px;
  object-fit: cover;
}

.chat-button--disabled:not(.active) {
  background-color: var(--primary-color-light);
  border-color: var(--primary-color-light);
}

.chat-button--disabled {
  cursor: not-allowed;
}
</style>