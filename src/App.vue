<script setup>
import Header from './components/Header.vue'
import Content from './components/Content.vue'
import Footer from './components/Footer.vue'
import { useStore } from 'vuex';

const store = useStore('store');

const onSendContent = (content) => {
  store.dispatch('sendMessage', content);
}
</script>

<template>
  <main id="main-app">
    <Header></Header>
    <Content></Content>
    <Footer
      :send-content="onSendContent"
    ></Footer>
  </main>
</template>

<style scoped>
#main-app {
  height: 100vh;
  display: grid;
  grid-template-rows: 50px 1fr auto;
}
</style>
