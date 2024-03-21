<script setup>
import Header from './components/Header.vue';
import ChatComponent from './components/Chat/Chat.vue';
</script>

<template>
  <main id="main-app">
    <Header></Header>
    <ChatComponent></ChatComponent>
  </main>
</template>

<style scoped>
#main-app {
  width: 100%;
  height: 600px;
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  display: grid;
  grid-template-rows: 60px 1fr;
}
</style>
