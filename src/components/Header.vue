<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
</script>

<template>
  <header id="header">
    <h1>
      FLM
      <span>v0.2</span>
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
  font-size: 1.1rem;
  padding-right: 5px;
}
</style>