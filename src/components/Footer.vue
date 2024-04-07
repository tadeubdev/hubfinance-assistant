<script setup>
import { ref } from 'vue';
import {computed} from 'vue';
import {useStore} from "vuex";

const props = defineProps({
  sendContent: Function
});

const store = useStore('store');

const content = ref('');

// create message const by store
const inputAllowed = computed(() => store.state.inputAllowed);

store.watch(() => store.state.inputAllowed, (newValue) => {
  content.value = '';
  if (newValue) {
    setTimeout(() => {
      document.querySelector('#footer-search-content input').focus();
      document.querySelector('#footer-search-content').classList.add('focus');
    }, 100);
    return;
  }
});

const handleSubmitForm = () => {
  if (!content.value) {
    return;
  }
  props.sendContent(content.value);
}

const onContentFocus = (event) => {
  event.target.parentElement.classList.add('focus');
}

const onContentBlur = (event) => {
  event.target.parentElement.classList.remove('focus');
}

const onContentInput = (event) => {
  if (event.target.value) {
    event.target.parentElement.classList.add('with-text');
  } else {
    event.target.parentElement.classList.remove('with-text');
  }
}
</script>

<template>
  <footer id="footer">
    <form @submit.prevent="handleSubmitForm">
      <div
        id="footer-search-content"
        :class="{ disabled: !inputAllowed }"
        :title="!inputAllowed ? 'Aguarde até que o chat te pergunte algo...' : 'Digite sua mensagem'"
      >
        <input 
          type="text" 
          placeholder="Hub Financeiro Chat"
          v-model="content"
          :disabled="!inputAllowed"
          @focus="onContentFocus"
          @blur="onContentBlur"
          @input="onContentInput"
        />
        <button
          type="submit"
          :disabled="!inputAllowed"
        >Enviar</button>
      </div>
      <div id="footer-description">
        <p>
          O chat pode conter erros. Verifique sempre as informações com o seu gerente de conta.
        </p>
      </div>
    </form>
  </footer>
</template>

<style scoped>
#footer {
  width: 700px;
  margin: 1rem auto 0 auto;
}

@media screen and (max-width: 800px) {
  #footer {
    width: 95%;
  }
}

@media screen and (min-width: 1201px) {
  #footer {
    width: 1200px;
  }
}

#footer form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

#footer-search-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 7px;
  margin: 0 0 0.3rem 0;
  border: 1px solid #777;
  border-radius: 17px;
}

#footer-search-content.disabled,
#footer-search-content.disabled * {
  cursor: not-allowed;
}

#footer-search-content.focus {
  border-color: #999;
}

#footer-search-content button:active,
#footer-search-content button:focus,
#footer-search-content button:hover {
  background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
}

#footer-search-content input {
  width: 87%;
  padding: 1.0rem 1.0rem;
  border: none;
  outline: none;
  background: none;
  color: #fff;
  font-size: 1.2rem;
  border-radius: 20px;
}

#footer-search-content button {
  padding: 0.7rem 1.1rem;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.3s;
}

#footer-search-content button:disabled {
  background-color: #999;
  color: #ccc;
  cursor: not-allowed;
}

#footer-search-content button:active:not(:disabled),
#footer-search-content button:focus:not(:disabled),
#footer-search-content button:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: #fff;
}

#footer-description {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.8rem;
  color: #999;
  font-size: 0.9rem;
  text-align: center;
  padding: 0 20px;
}
</style>