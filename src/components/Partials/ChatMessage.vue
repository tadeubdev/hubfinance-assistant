<script setup>
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ChatButton from './ChatButton.vue';
import AnaliseTecnica from './AnaliseTecnica.vue';
import AnaliseFinanceira from './AnaliseFinanceira.vue';
import SymbolInfo from './SymbolInfo.vue';
import StockHeatmap from './StockHeatmap.vue';
import CryptoCoinsHeatmap from './CryptoCoinsHeatmap.vue';
import TradingView from './TradingView.vue';
import StockGuide from './StockGuide.vue';
import RssMagazine from './RssMagazine.vue';
import AdvancedChart from './AdvancedChart.vue';
import CurrencyExchange from './CurrencyExchange.vue';
import EconomicCalendar from './EconomicCalendar.vue';
import SymbolProfile from './SymbolProfile.vue';
import Hotlists from './Hotlists.vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
});

const message = ref(props.message);
const buttons = ref(message.value.buttons || []);
const partial = ref(message.value.partial || null);
const partialData = ref(message.value.partialData || null);

const disableButtons = ref(false);
// { id, value, action }
const input = ref(message.value.input || '');

const handleOnButtonClick = (button) => {
  button.action && button.action();
};

const handleOnKeyUp = (value) => {
  if (!value.trim() || !input.value.action) {
    return;
  }
  input.value.action(value.trim());
};
</script>

<template>
  <div class="assistant-message">
    <img
      :src="message.author.image"
      :alt="message.author.name"
      class="assistant-message-author-image"
    />
    <div class="assistant-message-right">
      <div class="assistant-message-author">
        <span>{{ message.author.name }}</span>
      </div>
      <div class="assistant-message-partial assistant-message-rss-magazine" v-if="partial === 'rss-magazine'">
        <rss-magazine />
      </div>
      <div class="assistant-message-partial assistant-message-economic-calendar" v-if="partial === 'economic-calendar'">
        <economic-calendar />
      </div>
      <div class="assistant-message-partial assistant-message-hotlists" v-if="partial === 'hotlists'">
        <hotlists :symbol="partialData" />
      </div>
      <div class="assistant-message-partial assistant-message-symbol-profile" v-if="partial === 'symbol-profile'">
        <symbol-profile :symbol="partialData" />
      </div>
      <div class="assistant-message-partial assistant-message-currency-exchange" v-if="partial === 'currency-exchange'">
        <currency-exchange />
      </div>
      <div class="assistant-message-partial assistant-message-advanced-chart" v-if="partial === 'advanced-chart'">
        <advanced-chart :symbol="partialData" />
      </div>
      <div class="assistant-message-partial assistant-message-symbol-info" v-if="partial === 'symbol-info'">
        <symbol-info :symbol="partialData" />
      </div>
      <div class="assistant-message-partial assistant-message-stock-heatmap" v-if="partial === 'stock-heatmap'">
        <stock-heatmap :symbol="partialData" />
      </div>
      <div class="assistant-message-partial assistant-message-crypto-heatmap" v-if="partial === 'crypto-coins-heatmap'">
        <crypto-coins-heatmap />
      </div>
      <div class="assistant-message-partial assistant-message-analise-financeira" v-if="partial === 'analise-financeira'">
        <analise-financeira :symbol="partialData" />
      </div>
      <div class="assistant-message-partial assistant-message-analise-tecnica" v-if="partial === 'analise-tecnica'">
        <analise-tecnica :symbol="partialData" />
      </div>
      <div class="assistant-message-partial assistant-message-analise-tecnica" v-if="partial === 'analise-tecnica'">
        <trading-view :symbol="partialData" />
      </div>
      <div class="assistant-message-partial assistant-message-stock-guide" v-if="partial === 'stock-guide'">
        <stock-guide :name="partialData.name" :slug="partialData.slug" />
      </div>
      <div class="assistant-message-conteudo" v-else v-html="message.message"></div>
      <div class="assistant-message-buttons" v-if="buttons && buttons.length">
        <chat-button
          v-for="(button, btnIndex) in buttons"
          :key="`${message.uuid}-btn-${btnIndex}`"
          :button="button"
          :disabled="disableButtons"
          @button-click="handleOnButtonClick(button)"
        />
      </div>
      <div class="assistant-message-input" :class="{ 'assistant-text-uppercase': input.id === 'input-pesquisar-acao' }" v-if="input">
        <font-awesome-icon
          :icon="input.icon"
          v-if="input.icon"
        />
        <input
          v-model="input.value"
          :type="input.type || 'text'"
          class="assistant-message-input-field"
          :placeholder="input.placeholder || 'Digite algo...'"
          @keyup.enter="handleOnKeyUp($event.target.value)"
        />
        <button
          class="assistant-message-button-send"
          @click="handleOnKeyUp(input.value)"
          :disabled="!input.value.trim()"
        >
          Enter
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.assistant-message {
  display: grid;
  grid-template-columns: 30px 1fr;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
  animation: slide-up 0.5s ease;
}
@media screen and (max-width: 430px) {
  .assistant-message {
    grid-template-columns: 1fr;
  }
  .assistant-message img {
    display: none;
  }
}
.assistant-message-author-image {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 5px;
}
.assistant-message-right {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
.assistant-message-author {
  font-weight: 600;
}
.assistant-message-conteudo {
  color: var(--background-color);
  min-width: 40%;
  word-wrap: break-word;
  align-self: flex-start;
  justify-self: flex-start;
  display: inline-block;
  text-align: left;
  font-size: 1.0rem;
  line-height: 1.5;
}
.assistant-message-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-top: 10px;
  gap: 15px;
  flex-wrap: wrap;
}
.assistant-message-buttons .disabled {
  background-color: var(--primary-color);
  color: var(--background-color);
  cursor: not-allowed;
  pointer-events: none;
}
.assistant-message-input {
  width: 350px;
  margin: 20px 0;
  padding: 9px 10px;
  color: #ffffff;
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}
.assistant-message-input-field::placeholder {
  color: rgba(255,255,255,.6);
}
.assistant-message-input-field {
  width: 100%;
  border: none;
  background: none;
  font-size: 1.0rem;
  line-height: 1.5;
  font-weight: 600;
  color: #FFFFFF;
  padding: 0 10px;
  outline: none;
}
.assistant-message-input svg {
  margin: 0 5px 0 13px;
  color: var(--primary-color);
}
.assistant-message-button-send {
  background-color: var(--primary-color);
  color: var(--background-color);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.9rem;
  line-height: 1.5;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}
.assistant-text-uppercase {
  text-transform: uppercase;
}
.assistant-message-general {
  width: 100%;
  max-width: 600px;
  height: 560px;
  margin: 20px 0;
}
.assistant-message-stock-heatmap {
  width: 100%;
  height: 600px;
  margin: 20px 0;
}
.assistant-message-crypto-heatmap {
  width: 100%;
  height: 600px;
  margin: 20px 0;
}
.assistant-message-symbol-info {
  width: 100%;
  max-width: 100%;
  height: 160px;
  margin: 20px 0;
}
.assistant-message-analise-tecnica {
  width: 100%;
  max-width: 600px;
  height: 460px;
  margin: 20px 0;
}
.assistant-message-stock-guide {
  width: 100%;
  max-width: 600px;
  height: 400px;
  margin: 20px 0;
}
.assistant-message-advanced-chart {
  width: 100%;
  max-width: 600px;
  height: 400px;
  margin: 20px 0;
}
.assistant-message-currency-exchange {
  width: 555px;
  max-width: 555px;
  height: 195px;
  margin: 20px 0;
}
.assistant-message-economic-calendar {
  width: 650px;
  max-width: 90%;
  height: 467px;
  margin: 20px 0;
}
.assistant-message-symbol-profile {
  width: 100%;
  max-width: 100%;
  height: 460px;
  margin: 20px 0;
}
.assistant-message-hotlists {
  width: 100%;
  max-width: 100%;
  height: 550px;
  margin: 20px 0;
}
.assistant-message-analise-financeira {
  width: 100%;
  max-width: 100%;
  height: 550px;
  margin: 20px 0;
}
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>