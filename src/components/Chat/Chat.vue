<script setup>
import { onMounted, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import saudacao from '@/helpers/saudacao';
import { api } from '@/infra/axios';
import sleepTime from '@/helpers/sleep-time';
import ChatMessage from './Partials/ChatMessage.vue';

const messages = ref([]);
const messagesQueue = ref([]);
const executingQueue = ref(false);
const pagination = ref({
  page: 1,
  perPage: 6,
  total: 0,
  lastPage: 0
});

const moveChatToBottom = () => {
  const chatContainer = document.getElementById('chat-container');
  if (!chatContainer) {
    return;
  }
  chatContainer.scroll({
    top: chatContainer.scrollHeight,
    behavior: 'smooth'
  });
};

const popMessage = () => {
  if (messagesQueue.value.length === 0) {
    executingQueue.value = false;
    return;
  }
  const message = messagesQueue.value.shift();
  const time = message.time;
  if (!time) {
    messages.value.unshift(message);
    moveChatToBottom();
    return popMessage();
  }
  executingQueue.value = true;
  setTimeout(() => {
    messages.value.unshift(message);
    executingQueue.value = false;
    moveChatToBottom();
  }, time);
};

const watchMessagesQueue = () => {
  if (executingQueue.value) {
    return;
  }
  popMessage();
};

setInterval(watchMessagesQueue, 500);

const pushMessage = (message, time=0, buttons=null, fromMe=false) => {
  const author = fromMe ? { name: 'Você' } : { name: 'Assistente' };
  const uuid = uuidv4();
  const newMessage = { uuid, author, time, fromMe, message, buttons };
  messagesQueue.value.push(newMessage);
};

const handleClickOnPergunta = async (empresaId, pergunta) => {
  pushMessage(pergunta.pergunta, 0, null, true);

  api.get(`bot/acoes/${empresaId}/perguntas/${pergunta.id}`)
    .then(async ({ data }) => {
      const respostas = data.respostas || [];
      respostas.forEach(resposta => pushMessage(resposta, 1500));

      // exibe mensagem de finalização
      await handleMandarEscolherEmpresa('Espero ter ajudado! 😊 Caso precise ainda pode escolher outra ação:');
    })
    .catch(error => {
      console.log(error);
    });
};

const handleMandarEscolherEmpresa = async (title=null) => {
  const result = await api.get(`bot/acoes?page=${pagination.value.page}&per_page=${pagination.value.perPage}`);
  if (!result) {
    pushMessage('Algo deu errado ao tentar me conectar com o servidor. 😔', 100);
    pushMessage('Por favor, tente novamente mais tarde.', 100);
    return;
  }
  const acoes = result.data.data;
  if (acoes.length === 0) {
    pushMessage('Não encontrei nenhuma ação para te mostrar. 😔', 100);
    pushMessage('Por favor, tente novamente mais tarde.', 100);
    return;
  }
  const { current_page, last_page, per_page, total } = result.data;
  pagination.value = { page: current_page, lastPage: last_page, perPage: per_page, total };
  title = title || 'Escolha abaixo uma das ações para que eu possa te ajudar:';
  const botoesEmpresas = acoes.map(empresa => {
    return {
      ...empresa,
      text: empresa.name,
      type: 'empresa',
      action: async () => {
        pushMessage(`Me dê informações sobre a ação ${empresa.name}`, 0, null, true);
        await sleepTime(1500);
        pushMessage(`Ótimo! Vou buscar as informações sobre a ação ${empresa.name} para você...`, 1500);
        await api.get(`bot/acoes/${empresa.id}`)
          .then(({ data }) => {
            const buttons = (data.perguntas || []).map(pergunta => {
              return {
                text: pergunta.pergunta,
                type: 'pergunta',
                action: () => handleClickOnPergunta(empresa.id, pergunta)
              };
            });
            pushMessage(`Ok! Separei aqui algumas perguntas que você pode fazer sobre a ação ${empresa.name}:`, 4000, buttons);
          })
          .catch(error => console.log(error));
      }
    };
  });
  if (pagination.value.page < pagination.value.lastPage) {
    botoesEmpresas.push({
      text: `Ver mais ações (${pagination.value.page}/${pagination.value.lastPage})`,
      type: 'ver-mais',
      action: async () => {
        pagination.value.page++;
        pushMessage('Quero ver mais ações...', 0, null, true);
        await handleMandarEscolherEmpresa('Ótimo! Aqui estão mais ações para você escolher:');
      }
    });
  }
  pushMessage(title, 1000, botoesEmpresas);
}

onMounted(async () => {
  pushMessage(`${saudacao()} Seja bem vindo(a) ao chat!`, 1000);
  pushMessage('Estou aqui para te ajudar em sua jornada! 😊', 1000);
  await handleMandarEscolherEmpresa();
});
</script>

<template>
  <main id="chat">
    <div id="chat-container">
      <chat-message
        v-for="message in messages"
        :key="message.uuid"
        :message="message"
      />
    </div>
    <div v-if="executingQueue" class="loading-container">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </main>
</template>

<style scoped>
#chat {
  display: grid;
  grid-template-rows: 1fr 20px;
  height: calc(100% - 60px);
  margin: 20px 20px 40px 20px;
  padding: 20px;
}
#chat-container {
  display: flex;
  flex-direction: column-reverse;
  height: 440px;
  overflow: auto;
  padding: 0 20px;
}
.loading-container {
  margin: 0 20px;
}
.loading-container .dot {
  width: 10px;
  height: 10px;
  border: 1px solid var(--primary-color);
  border-radius: 50%;
  display: inline-block;
  margin: 0 5px;
  animation: bounce 0.5s infinite alternate;
}
.loading-container .dot:nth-child(2) {
  animation-delay: 0.2s;
}
.loading-container .dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes bounce {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.5);
  }
}
</style>