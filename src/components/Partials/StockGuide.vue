<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
});

const widgetContainer = ref(null);

onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
  script.type = "text/javascript";
  script.async = true;
  script.innerHTML = `
    {
      "symbols": [
        [
          "${props.name}",
          "${props.slug}|1D"
        ]
      ],
      "chartOnly": false,
      "width": 550,
      "height": 400,
      "locale": "en",
      "colorTheme": "dark",
      "autosize": false,
      "showVolume": false,
      "showMA": false,
      "hideDateRanges": false,
      "hideMarketStatus": false,
      "hideSymbolLogo": false,
      "scalePosition": "right",
      "scaleMode": "Normal",
      "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      "fontSize": "10",
      "noTimeScale": false,
      "valuesTracking": "1",
      "changeMode": "price-and-percent",
      "chartType": "area",
      "maLineColor": "#2962FF",
      "maLineWidth": 1,
      "maLength": 9,
      "lineWidth": 2,
      "lineType": 0,
      "dateRanges": [
        "1d|1",
        "1m|30",
        "3m|60",
        "12m|1D",
        "60m|1W",
        "all|1M"
      ]
    }`;
  widgetContainer.value.appendChild(script);
});
</script>

<template>
  <div className="tradingview-widget-container" ref="widgetContainer">
    <div className="tradingview-widget-container__widget"></div>
  </div>
</template>