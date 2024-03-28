<script setup>
import { onMounted, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import saudacao from '@/helpers/saudacao';
import api from '@/infra/axios';
import sleepTime from '@/helpers/sleep-time';
import ChatMessage from './Partials/ChatMessage.vue';
import { faEnvelope, faMagnifyingGlass, faPhone, faUser } from '@fortawesome/free-solid-svg-icons'

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
  setTimeout(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, 100);
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

const pushMessage = (message, time=0, buttons=null, fromMe=false, input=null) => {
  const author = fromMe ? { name: 'Você' } : { name: 'Assistente' };
  const uuid = uuidv4();
  const newMessage = { uuid, author, time, fromMe, message, buttons, input };
  messagesQueue.value.push(newMessage);
};

const handleClickOnPergunta = async (empresaId, pergunta) => {
  pushMessage(pergunta.pergunta, 0, null, true);

  api.post(`api/bot/acoes/${empresaId}/perguntas/${pergunta.id}`)
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

const handleMandaMenuEspecialista = (assunto=null) => {
  const dadosContato = {
    nome: '',
    email: '',
    telefone: '',
    assunto: assunto,
  };
  pushMessage('Gostaria que um especialista me apresentasse esses produtos', 0, null, true);
  pushMessage('Está bem, vou precisar que me informe seu nome, email e telefone para que possamos entrar em contato.', 1000);
  pushMessage('Por favor, informe seu nome:', 1000, null, false, {
    id: 'input-nome',
    value: '',
    type: 'text',
    icon: faUser,
    placeholder: 'Digite seu nome',
    action: (value) => {
      if (!value || !value.trim()) {
        return;
      }
      dadosContato.nome = value;
      pushMessage(`Nome: ${value}`, 0, null, true);
      pushMessage('Agora, informe seu email:', 100, null, false, {
        id: 'input-email',
        value: '',
        type: 'email',
        icon: faEnvelope,
        placeholder: 'Digite seu email',
        action: (value) => {
          if (!value || !value.trim() || !value.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)) {
            return;
          }
          dadosContato.email = value;
          pushMessage(`Email: ${value}`, 0, null, true);
          pushMessage('Por fim, informe seu telefone:', 100, null, false, {
            id: 'input-telefone',
            value: '',
            type: 'tel',
            icon: faPhone,
            placeholder: 'Digite seu telefone',
            action: (value) => {
              if (!value || !value.trim()) {
                return;
              }
              dadosContato.telefone = value;
              pushMessage(`Telefone: ${value}`, 0, null, true);
              api.put('api/bot/contatos', dadosContato).then(() => {
                pushMessage('Obrigado! Seus dados foram enviados com sucesso. Em breve entraremos em contato.', 1000);
                pushMessage('Caso precise de mais alguma coisa, estou por aqui.', 1000, [
                  {
                    text: 'Gostaria de analisar Ações',
                    type: 'button',
                    action: () => {
                      pushMessage('Gostaria de analisar Ações', 0, null, true);
                      setTimeout(() => {
                        handleMandarEscolherEmpresa('Escolha abaixo uma das ações para que eu possa te ajudar:');
                      }, 1500);
                    }
                  },
                  {
                    text: 'Gostaria de entender o cenário econômico',
                    type: 'button',
                    action: () => {
                      pushMessage('Gostaria de entender o cenário econômico', 0, null, true);
                      setTimeout(() => {
                        pushMessage('Entendi! Vou buscar informações sobre o cenário econômico para você...', 1000);
                        handleEscolherCenarioEconomico();
                      }, 1000);
                    }
                  },
                  {
                    text: 'Voltar ao menu',
                    type: 'button',
                    action: () => {
                      pushMessage('Voltar ao menu', 0, null, true);
                      setTimeout(() => {
                        handleBotoesIniciais('Em que posso te ajudar?');
                      }, 1500);
                    }
                  }
                ]);
                setTimeout(() => moveChatToBottom(), 1000);
              }).catch(error => {
                console.log(error);
                pushMessage('Ocorreu um erro ao enviar seus dados. 😔', 100);
                pushMessage('Por favor, tente novamente.', 100);
              });
            }
          });
        }
      });
    }
  });
}

const handleBotoesIniciais = async (title=null) => {
  pushMessage(title || 'Em que posso te ajudar?', 1000, [
    {
      text: 'Gostaria de analisar Renda Fixa',
      type: 'button',
      action: async () => {
        pushMessage('Quais são os melhores títulos de renda fixa para se investir?', 0, null, true);
        setTimeout(() => {
          api.post('api/bot/ativos')
            .then(async ({ data }) => {
              const buttons = [
                {
                  text: 'Simule 100 mil reais aplicados em cada título e compare o resultado no vencimento',
                  type: 'button',
                  action: () => {
                    pushMessage('Simule 100 mil reais aplicados em cada título e compare o resultado no vencimento', 0, null, true);
                    setTimeout(() => {
                      pushMessage('Ok! Vou simular 100 mil reais aplicados em cada título e comparar o resultado no vencimento...', 1500);
                      setTimeout(() => {
                        pushMessage('Aqui estão os resultados da simulação...', 1500);
                      }, 1500);
                    }, 1500);
                  }
                },
                {
                  text: 'Gostaria que um especialista me apresentasse esses produtos',
                  type: 'button',
                  action: () => {
                    handleMandaMenuEspecialista('Menu Renda Fixa');
                  }
                },
                {
                  text: 'Voltar ao menu',
                  type: 'button',
                  action: () => {
                    pushMessage('Voltar ao menu', 0, null, true);
                    setTimeout(() => {
                      handleBotoesIniciais('Em que posso te ajudar?');
                    }, 1500);
                  }
                }
              ];
              pushMessage(`Separei aqui alguns títulos de renda fixa para você:`, 1000);
              for (let line in data.results) {
                pushMessage(`${data.results[line]}`, 50);
              }
              pushMessage('O que você gostaria de fazer?', 1000, buttons);
            })
            .catch(error => {
              console.log(error);
            });
        }, 1500);
      }
    },
    {
      text: 'Gostaria de analisar Ações',
      type: 'button',
      action: () => {
        pushMessage('Gostaria de analisar Ações', 0, null, true);
        setTimeout(() => {
          handleMandarEscolherEmpresa('Escolha abaixo uma das ações para que eu possa te ajudar:');
        }, 1500);
      }
    },
    {
      text: 'Gostaria de entender o cenário econômico',
      type: 'button',
      action: () => {
        pushMessage('Gostaria de entender o cenário econômico', 0, null, true);
        setTimeout(() => {
          pushMessage('Entendi! Vou buscar informações sobre o cenário econômico para você...', 1000);
          handleEscolherCenarioEconomico();
        }, 1000);
      }
    }
  ]);
};

const handleEscolherCenarioEconomico = async (title=null) => {
  setTimeout(() => {
    api.post('api/bot/cenarios')
      .then(({ data }) => {
        const buttons = (data.cenarios || []).map(({ id, cenario }) => {
          return {
            text: cenario,
            type: 'button',
            action: () => {
              pushMessage(cenario, 0, null, true);
              pushMessage(`Ok! Vou buscar informações sobre o cenário ${cenario} para você...`, 2500);

              setTimeout(() => {
                api.post(`api/bot/cenarios/${id}`)
                .then(({ data }) => {
                  const respostas = data.respostas || [];
                  for (let message of respostas) {
                    pushMessage(message, 1500);
                  }
                  pushMessage('Espero ter ajudado! 😊', 1500);
                  pushMessage('Caso precise de mais alguma coisa, estou por aqui.', 1500, [
                    {
                      text: 'Gostaria de entender outro cenário econômico',
                      type: 'button',
                      action: () => {
                        pushMessage('Gostaria de entender outro cenário econômico', 0, null, true);
                        setTimeout(() => {
                          handleEscolherCenarioEconomico('Escolha abaixo um dos cenários econômicos para que eu possa te ajudar:');
                        }, 1500);
                      }
                    },
                    {
                      text: 'Voltar ao menu',
                      type: 'button',
                      action: () => {
                        pushMessage('Voltar ao menu', 0, null, true);
                        setTimeout(() => {
                          handleBotoesIniciais('Em que posso te ajudar?');
                        }, 1500);
                      }
                    },
                  ]);
                })
                .catch(error => console.log(error));
              }, 2000);
            }
          };
        });
        pushMessage('Aqui estão os cenários econômicos disponíveis:', 1500, buttons);
      })
      .catch(error => console.log(error));
  }, 2000);
};

const handleMandarInputDePesquisarAcao = async () => {
  pushMessage('Quero pesquisar por outra ação...', 0, null, true);
  setTimeout(() => {
    // add input para pesquisar ação
    pushMessage('Digite o nome da ação que deseja pesquisar... e pressione <em>ENTER</em><br/>Exemplo: PETR4, VALE3, ITUB4, etc.', 500, null, false, {
      // { id, value, action }
      id: 'input-pesquisar-acao',
      value: '',
      icon: faMagnifyingGlass,
      type: 'text',
      action: (value) => {
        if (!value || !value.trim()) {
          return;
        }
        pushMessage(`Pesquisando informações sobre a ação ${value}...`, 1500);

        setTimeout(() => {
          api.post(`api/bot/acoes/search?acao=${value}`)
          .then(({ data }) => {
            const empresa = data.empresa;
            const buttons = (data.perguntas || []).map(pergunta => {
              return {
                text: pergunta.pergunta,
                type: 'pergunta',
                action: () => handleClickOnPergunta(empresa.id, pergunta)
              };
            });
            pushMessage(`Ok! Separei aqui algumas perguntas que você pode fazer sobre a ação ${empresa.name}:`, 4000, buttons);
          })
          .catch(error => {
            console.log(error);
            pushMessage('Não encontrei nenhuma ação com o nome informado. 😔', 100);
            pushMessage('Por favor, tente novamente.', 100);
          });
        }, 2000);
      },
    });
  }, 1500);
};

const handleMandarEscolherEmpresa = async (title=null) => {
  const result = await api.post(`api/bot/acoes?page=${pagination.value.page}&per_page=${pagination.value.perPage}`);
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
        await api.post(`api/bot/acoes/${empresa.id}`)
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
  botoesEmpresas.push({
    text: 'Quero pesquisar por outra ação...',
    type: 'button',
    action: () => {
      handleMandarInputDePesquisarAcao();
    }
  });
  pushMessage(title, 1000, botoesEmpresas);
}

onMounted(async () => {
  pushMessage(`${saudacao()} Seja bem vindo(a) ao chat!`, 1000);
  await handleBotoesIniciais();
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