<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMessage } from '@fortawesome/free-solid-svg-icons';
</script>

<template>
  <header id="header">
    <button
      id="menu-button"
    >
      <font-awesome-icon :icon="faMessage" />
    </button>
    <h1>
      Hub Financeiro <span>Chat</span>
    </h1>
  </header>
</template>

<style scoped>
#header {
  padding: 0 20px;
  display: flex;
  align-items: center;
  user-select: none;
}
#header button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary-color);
  margin-right: 10px;
}
#header h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
}
#header h1 span {
  color: #999;
  font-weight: 100;
}
</style>