<script setup>
import { ref, onMounted } from 'vue';

const widgetContainer = ref(null);

onMounted(() => {
  // <iframe frameborder="0" scrolling="auto" height="195" width="555" allowtransparency="true" marginwidth="0" marginheight="0" src="" align="center"></iframe>
  const iframe = document.createElement('iframe');
  iframe.src = "https://sslfxrates.investing.com/index_exchange.php?params&inner-border-color=%23CBCBCB&border-color=%23cbcbcb&bg1=%23F6F6F6&bg2=%23ffffff&inner-text-color=%23000000&currency-name-color=%23000000&header-text-color=%23FFFFFF&force_lang=12";
  iframe.frameBorder = 0;
  iframe.scrolling = 'auto';
  iframe.height = 195;
  iframe.width = 555;
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