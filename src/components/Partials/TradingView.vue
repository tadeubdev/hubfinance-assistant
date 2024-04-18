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
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.async = true;
  script.type = "text/javascript";
  script.innerHTML = JSON.stringify(
  {
    "autosize": true,
    "symbol": props.symbol,
    "interval": "D",
    "timezone": "America/Sao_Paulo",
    "theme": "dark",
    "style": "1",
    "locale": "br",
    "enable_publishing": false,
    "allow_symbol_change": false,
    "save_image": false,
    "calendar": false,
    "hide_volume": true,
    "support_host": "https://www.tradingview.com"
  });
  widgetContainer.value.appendChild(script);
});
</script>

<template>
  <div class="tradingview-widget-container" ref="widgetContainer" style="height:100%;width:100%">
    <div class="tradingview-widget-container__widget" style="height:calc(100% - 32px);width:100%"></div>
  </div>
</template>