<script setup>
import { ref } from "vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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
    class="assistant-chat-button"
    @click="emit('button-click')"
    :disabled="props.disabled"
    :class="{
      'assistant-chat-button--disabled': props.disabled,
      'active': props.button.active,
      'contrast': props.button.contrast,
    }"
  >
    <font-awesome-icon
      :icon="button.icon"
      v-if="button.icon"
      style="margin-right:10px;"
    />
    <img
      v-if="button.image"
      :src="button.image"
      :alt="button.text"
    />
    <p v-html="button.text"></p>
  </button>
</template>

<style scoped>
.assistant-chat-button {
  padding: 10px;
  border: 2px solid var(--primary-color);
  border-radius: 6px;
  background-color: #1649ff36;
  color: var(--background-color);
  font-size: 1.0rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  white-space: wrap;
}

.assistant-chat-button.contrast {
  border-color: var(--primary-color);
  background-color: #1649ffad;
}

@media screen and (max-width: 800px) {
  .assistant-chat-button {
    white-space: normal;
    text-align: left;
  }
}

.assistant-chat-button p {
  margin: 0;
}

.assistant-chat-button img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border-radius: 3px;
  object-fit: cover;
}

.assistant-chat-button--disabled:not(.active) {
  background-color: var(--primary-color-light);
  border-color: var(--primary-color-light);
}

.assistant-chat-button--disabled {
  cursor: not-allowed;
}
</style>