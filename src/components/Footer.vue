<script setup>
import { onMounted, ref } from 'vue';
import {computed} from 'vue';
import {useStore} from "vuex";

const props = defineProps({
  sendContent: Function
});

const store = useStore('store');

const content = ref('');

// create message const by store
// const inputAllowed = computed(() => store.state.inputAllowed);
const inputAllowed = computed(() => true);

store.watch(() => store.state.inputAllowed, (newValue) => {
  content.value = '';
  if (newValue) {
    setTimeout(() => {
      document.querySelector('#assistant-footer-search-content input').focus();
      document.querySelector('#assistant-footer-search-content').classList.add('focus');
    }, 100);
    return;
  }
});

const handleSubmitForm = () => {
  if (!content.value || !inputAllowed) {
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
  if (!inputAllowed) {
    return;
  }
  if (event.target.value) {
    event.target.parentElement.classList.add('with-text');
  } else {
    event.target.parentElement.classList.remove('with-text');
  }
}
</script>

<template>
  <footer id="assistant-footer">
    <form @submit.prevent="handleSubmitForm">
      <div
        id="assistant-footer-search-content"
        :class="{ disabled: !inputAllowed }"
        :title="!inputAllowed ? 'Aguarde até que o chat te pergunte algo...' : 'Digite sua mensagem'"
      >
        <input 
          type="text" 
          placeholder="Faria Lima AI Chat"
          v-model="content"
          @focus="onContentFocus"
          @blur="onContentBlur"
          @input="onContentInput"
        />
        <button
          type="submit"
          :disabled="!inputAllowed"
        >Enviar</button>
      </div>
      <div id="assistant-footer-description">
        <p>
          O chat pode conter erros. Verifique sempre as informações com o seu gerente de conta.
        </p>
      </div>
    </form>
  </footer>
</template>

<style>
.window-small #assistant-footer {
  width: 97%;
}

#assistant-footer {
  width: 700px;
  margin: 1rem auto 0 auto;
}

@media screen and (max-width: 800px) {
  #assistant-footer {
    width: 95%;
  }
}

@media screen and (min-width: 1201px) {
  #assistant-footer {
    width: 1200px;
  }
}

#assistant-footer form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

#assistant-footer-search-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 7px;
  margin: 0 0 0.3rem 0;
  border: 1px solid #777;
  border-radius: 17px;
}

#assistant-footer-search-content.disabled,
#assistant-footer-search-content.disabled * {
  cursor: not-allowed;
}

#assistant-footer-search-content.focus {
  border-color: #999;
}

#assistant-footer-search-content button:active,
#assistant-footer-search-content button:focus,
#assistant-footer-search-content button:hover {
  background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
}

#assistant-footer-search-content input {
  width: 87%;
  padding: 1.0rem 1.0rem;
  border: none;
  outline: none;
  background: none;
  color: #fff;
  font-size: 1.2rem;
  border-radius: 20px;
}

#assistant-footer-search-content button {
  padding: 0.7rem 1.1rem;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.3s;
}

#assistant-footer-search-content button:disabled {
  background-color: #999;
  color: #ccc;
  cursor: not-allowed;
}

#assistant-footer-search-content button:active:not(:disabled),
#assistant-footer-search-content button:focus:not(:disabled),
#assistant-footer-search-content button:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: #fff;
}

#assistant-footer-description {
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