<script setup>
import { ref, onMounted } from 'vue';

const widgetContainer = ref(null);

onMounted(() => {
  const iframe = document.createElement('iframe');
  iframe.src = "https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=17,32,37,5,35,4,72&calType=week&timeZone=12&lang=12";
  iframe.frameBorder = 0;
  iframe.scrolling = 'auto';
  iframe.width = '100%';
  iframe.height = 467;
  iframe.allowTransparency = true;
  iframe.marginWidth = 0;
  iframe.marginHeight = 0;
  iframe.align = 'center';
  widgetContainer.value.appendChild(iframe);
});
</script>

<template>
  <div ref="widgetContainer"></div>
</template>