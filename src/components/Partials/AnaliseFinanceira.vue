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
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";
  script.async = true;
  script.type = "text/javascript";
  script.innerHTML = JSON.stringify({
    "isTransparent": false,
    "largeChartUrl": "",
    "displayMode": "regular",
    "width": "100%",
    "height": "100%",
    "colorTheme": "dark",
    "symbol": props.symbol,
    "locale": "br"
  });
  widgetContainer.value.appendChild(script);
});
</script>

<template>
  <div ref="widgetContainer" class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
  </div>
</template>