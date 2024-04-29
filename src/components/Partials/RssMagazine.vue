<script setup>
import { ref, onMounted } from 'vue';

const widgetContainer = ref(null);

onMounted(() => {
  const script = document.createElement('script');
  script.src = "https://widget.rss.app/v1/magazine.js";
  script.async = true;
  script.type = "text/javascript";
  widgetContainer.value.appendChild(script);
});
</script>

<template>
  <div ref="widgetContainer" class="tradingview-widget-container">
    <rssapp-magazine id="tg5AxeBD04PlaeQO"></rssapp-magazine>
  </div>
</template>