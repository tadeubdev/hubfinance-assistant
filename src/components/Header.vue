<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faRobot } from '@fortawesome/free-solid-svg-icons'
</script>

<template>
  <header>
    <h1 id="header-title">
      <FontAwesomeIcon :icon="faRobot" />
      Assistente I.A.
    </h1>
  </header>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--primary-color);
}
#header-title {
  margin: 0;
  padding: 1rem;
  font-size: 1.1rem;
  color: var(--primary-color);
  font-weight: 100;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
</style>