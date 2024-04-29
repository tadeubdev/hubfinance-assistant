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
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js";
  script.async = true;
  script.type = "text/javascript";
  script.innerHTML = JSON.stringify({
    "colorTheme": "dark",
    "dateRange": "12M",
    "exchange": props.symbol,
    "showChart": true,
    "locale": "br",
    "width": "100%",
    "height": "100%",
    "largeChartUrl": "",
    "isTransparent": false,
    "showSymbolLogo": false,
    "showFloatingTooltip": false,
    "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
    "plotLineColorFalling": "rgba(41, 98, 255, 1)",
    "gridLineColor": "rgba(240, 243, 250, 0)",
    "scaleFontColor": "rgba(106, 109, 120, 1)",
    "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
    "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
    "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
    "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
    "symbolActiveColor": "rgba(41, 98, 255, 0.12)"
  });
  widgetContainer.value.appendChild(script);
});
</script>

<template>
  <div ref="widgetContainer" class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
  </div>
</template>