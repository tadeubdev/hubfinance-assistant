<script setup>
import { ref, onMounted } from 'vue';

const widgetContainer = ref(null);

onMounted(() => {
  const script = document.createElement('script');
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js";
  script.async = true;
  script.type = "text/javascript";
  script.innerHTML = JSON.stringify({
    "dataSource": "Crypto",
    "blockSize": "market_cap_calc",
    "blockColor": "change",
    "locale": "br",
    "symbolUrl": "",
    "colorTheme": "dark",
    "hasTopBar": false,
    "isDataSetEnabled": false,
    "isZoomEnabled": true,
    "hasSymbolTooltip": true,
    "width": "100%",
    "height": "100%"
  });
  widgetContainer.value.appendChild(script);
});
</script>

<template>
  <div ref="widgetContainer" class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
  </div>
</template>