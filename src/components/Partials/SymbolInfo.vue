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
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
  script.async = true;
  script.type = "text/javascript";
  script.innerHTML = JSON.stringify({
    "symbol": props.symbol,
    "width": "100%",
    "locale": "br",
    "colorTheme": "dark",
    "isTransparent": false
  });
  widgetContainer.value.appendChild(script);
});
</script>

<template>
  <div ref="widgetContainer" class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
  </div>
</template>