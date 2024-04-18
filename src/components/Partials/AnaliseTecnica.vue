<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  symbol: {
    type: String,
    required: true
  },
});

const widgetContainer = ref(null);

onMounted(() => {
  const script = document.createElement('script');
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
  script.async = true;
  script.type = "text/javascript";
  script.innerHTML = JSON.stringify({
    "interval": "1m",
    "width": "100%",
    "isTransparent": false,
    "height": "100%",
    "symbol": props.symbol,
    "showIntervalTabs": true,
    "displayMode": "single",
    "locale": "br",
    "colorTheme": "dark"
  });
  widgetContainer.value.appendChild(script);
});
</script>

<template>
  <div ref="widgetContainer" class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
  </div>
</template>