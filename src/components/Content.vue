<script setup>
import saudacao from '@/helpers/saudacao';
import { v4 as uuidv4 } from 'uuid';
import {onMounted, ref} from 'vue';
import { useStore } from 'vuex';
import api from '@/infra/axios';
import sleepTime from '@/helpers/sleep-time';
import avatarImage from '@/assets/avatar.png'
import iconImage from '@/assets/icon.png';

import ChatMessage from './Partials/ChatMessage.vue';

const messages = ref([]);
const messagesQueue = ref([]);
const executingQueue = ref(false);
const waitingForInput = ref(false);
const pagination = ref({
  page: 1,
  perPage: 6,
  total: 0,
  lastPage: 0
});

const store = useStore('store');

const onInputMessageChange = ref(undefined);

// on inputMessage from store
store.watch(() => store.state.inputMessage, (value) => {
  if (onInputMessageChange.value) {
    onInputMessageChange.value(value);
  }
  onInputMessageChange.value = () => {};
});

const waitForInputMessage = () => {
  return new Promise(async (resolve) => {
    store.commit('setInputAllowed', true);
    onInputMessageChange.value = async (value) => {
      waitingForInput.value = false;
      store.commit('setInputAllowed', false);
      store.commit('setInputMessage', '');
      onInputMessageChange.value = () => {};
      resolve(value);
    };
    waitingForInput.value = true;
  });
};

const moveChatToBottom = () => {
  setTimeout(() => {
    const chatContainer = document.getElementById('content');
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
  // limpa e desabilita input caso o usuário clique em outra coisa...
  if (onInputMessageChange.value) {
    onInputMessageChange.value = () => {};
    store.commit('setInputAllowed', false);
    store.commit('setInputMessage', '');
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
  const author = fromMe ? {
    name: 'Você',
    image: avatarImage
  } : {
    name: 'FariaLima AI',
    image: iconImage
  };
  const uuid = uuidv4();
  const newMessage = { uuid, author, time, fromMe, message, buttons, input };
  messagesQueue.value.push(newMessage);
};

const handleClickOnPergunta = async (empresaId, pergunta) => {
  pushMessage(pergunta.pergunta, 0, null, true);
  await sleepTime(1000);

  api.post(`api/bot/acoes/${empresaId}/perguntas/${pergunta.id}`)
    .then(async ({ data }) => {
      const respostas = data.respostas || [];
      respostas.forEach(resposta => pushMessage(resposta, 500));
      pushMessage('Estas são as informações que tenho sobre a ação. 😊 Caso queira:', 500, [
        {
          text: 'O que os analistas pensam disso?',
          type: 'button',
          action: () => {
            handleMandaMenuEspecialista('Menu Ativos', 'Gostaria de conversar com um especialista sobre esta empresa');
          }
        },
        {
          text: 'Quero pesquisar por outra ação...',
          type: 'button',
          action: () => {
            handleMandarInputDePesquisarAcao();
          }
        },
        {
          text: 'Voltar ao menu',
          type: 'button',
          action: () => {
            pushMessage('Voltar ao menu', 0, null, true);
            setTimeout(() => {
              handleBotoesIniciais('Em que posso te ajudar?');
            }, 500);
          }
        }
      ]);
    })
    .catch(error => {
      console.log(error);
    });
};

const handleMandaMenuEspecialista = async (assunto=null, title=null) => {
  const dadosContato = {
    nome: '',
    email: '',
    telefone: '',
    assunto: assunto,
  };
  pushMessage(title || 'Gostaria que um especialista me apresentasse esses produtos', 0, null, true);
  pushMessage('Está bem, vou precisar que me informe seu nome, email e telefone para que possamos entrar em contato.', 1000);
  pushMessage('Por favor, informe seu nome:', 1000, null, false);
  await sleepTime(3500);

  let nome = await waitForInputMessage();
  if (!nome || !nome.trim() || nome.length < 3) {
    return pushMessage('Nome inválido. Por favor, informe um nome válido!', 100, [
      {
        text: 'Tentar novamente',
        type: 'button',
        action: () => {
          handleMandaMenuEspecialista(assunto, title);
        }
      },
      {
        text: 'Voltar ao menu',
        type: 'button',
        action: () => {
          pushMessage('Voltar ao menu', 0, null, true);
          setTimeout(() => {
            handleBotoesIniciais('Em que posso te ajudar?');
          }, 500);
        }
      }
    ]);
  }

  dadosContato.nome = nome;
  pushMessage(`Nome: ${nome}`, 0, null, true);
  pushMessage('Agora, informe seu email:', 800, null, false);
  await sleepTime(2500);

  let email = await waitForInputMessage();
  if (!email || !email.trim() || !email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
    return pushMessage('Email inválido. Por favor, informe um email válido!', 100, [
      {
        text: 'Tentar novamente',
        type: 'button',
        action: () => {
          handleMandaMenuEspecialista(assunto, title);
        }
      },
      {
        text: 'Voltar ao menu',
        type: 'button',
        action: () => {
          pushMessage('Voltar ao menu', 0, null, true);
          setTimeout(() => {
            handleBotoesIniciais('Em que posso te ajudar?');
          }, 500);
        }
      }
    ]);
  }

  dadosContato.email = email;
  pushMessage(`Email: ${email}`, 0, null, true);
  pushMessage('Por fim, informe seu telefone com DDD, formato: DDD 9 99999999 :', 800, null, false);
  await sleepTime(2500);

  let telefone = await waitForInputMessage();
  if (!telefone || !telefone.trim() || telefone.length < 10) {
    return pushMessage('Telefone inválido. Por favor, informe um telefone válido!', 100, [
      {
        text: 'Tentar novamente',
        type: 'button',
        action: () => {
          handleMandaMenuEspecialista(assunto, title);
        }
      },
      {
        text: 'Voltar ao menu',
        type: 'button',
        action: () => {
          pushMessage('Voltar ao menu', 0, null, true);
          setTimeout(() => {
            handleBotoesIniciais('Em que posso te ajudar?');
          }, 500);
        }
      }
    ]);
  }

  dadosContato.telefone = telefone;
  pushMessage(`Telefone: ${telefone}`, 0, null, true);

  api.put('api/bot/contatos', dadosContato).then(() => {
    pushMessage('Ótimo! Seus dados foram enviados com sucesso. Em breve um especilista irá entrar em contato para lhe ajudar.', 1000);
    pushMessage('Caso precise de mais alguma coisa, estou por aqui.', 1000, [
      {
        text: 'Gostaria de analisar Ações',
        type: 'button',
        action: () => {
          pushMessage('Gostaria de analisar Ações', 0, null, true);
          setTimeout(() => {
            handleMandarEscolherEmpresa('Escolha abaixo uma das ações para que eu possa te ajudar:');
          }, 500);
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
          }, 500);
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
                      pushMessage('Ok! Vou simular 100 mil reais aplicados em cada título e comparar o resultado no vencimento...', 500);
                      setTimeout(() => {
                        api.post('api/bot/simulacao').then(({ data }) => {
                          pushMessage('Aqui estão os resultados da simulação...', 500);
                          for (let line in data.results) {
                            pushMessage(`${data.results[line]}`, 50);
                          }
                          const buttons = [
                            {
                              text: 'Gostaria que um especialista me apresentasse esses produtos',
                              type: 'button',
                              action: () => {
                                handleMandaMenuEspecialista('Menu Renda Fixa', 'Gostaria que um especialista me apresentasse esses produtos');
                              }
                            },
                            {
                              text: 'Voltar ao menu',
                              type: 'button',
                              action: () => {
                                pushMessage('Voltar ao menu', 0, null, true);
                                setTimeout(() => {
                                  handleBotoesIniciais('Em que posso te ajudar?');
                                }, 500);
                              }
                            }
                          ];
                          pushMessage('O que você gostaria de fazer?', 1000, buttons);
                        }).catch(error => {
                          pushMessage('Ocorreu um erro ao realizar a simulação. 😔', 100);
                          pushMessage('Por favor, tente novamente mais tarde.', 100);
                        });
                      }, 500);
                    }, 500);
                  }
                },
                {
                  text: 'Gostaria que um especialista me apresentasse esses produtos',
                  type: 'button',
                  action: () => {
                    handleMandaMenuEspecialista('Menu Renda Fixa', 'Gostaria que um especialista me apresentasse esses produtos');
                  }
                },
                {
                  text: 'Voltar ao menu',
                  type: 'button',
                  action: () => {
                    pushMessage('Voltar ao menu', 0, null, true);
                    setTimeout(() => {
                      handleBotoesIniciais('Em que posso te ajudar?');
                    }, 500);
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
              const statusCode = error.response.status || 500;
              if (statusCode === 404) {
                pushMessage('Não encontrei nenhum título de renda fixa para te mostrar. 😔', 1000);
                pushMessage('Por favor, tente novamente mais tarde.', 500, [
                  {
                    text: 'Voltar ao menu',
                    type: 'button',
                    action: () => {
                      pushMessage('Voltar ao menu', 0, null, true);
                      setTimeout(() => {
                        handleBotoesIniciais('Em que posso te ajudar?');
                      }, 500);
                    }
                  }
                ]);
                return;
              }
              console.log(error);
            });
        }, 500);
      }
    },
    {
      text: 'Gostaria de analisar Ações',
      type: 'button',
      action: () => {
        pushMessage('Gostaria de analisar Ações', 0, null, true);
        setTimeout(() => {
          handleMandarEscolherEmpresa('Escolha abaixo uma das ações para que eu possa te ajudar:');
        }, 500);
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
      text: 'Eu não entendo nada sobre investimentos e gostaria de aprender a investir!',
      type: 'button',
      action: () => {
        handleMandaMenuEspecialista('Menu Suporte', 'Eu não entendo nada sobre investimentos e gostaria de aprender a investir!');
      }
    },
  ]);
};

const handleEscolherCenarioEconomico = async (title=null) => {
  setTimeout(() => {
    api.post('api/bot/cenarios')
      .then(({ data }) => {
        if (!data.cenarios || !data.cenarios.length) {
          pushMessage('Não encontrei nenhuma informação sobre o cenário econômico. 😔', 1000);
          pushMessage('Por favor, tente novamente mais tarde.', 1000, [
            {
              text: 'Voltar ao menu',
              type: 'button',
              action: () => {
                pushMessage('Voltar ao menu', 0, null, true);
                setTimeout(() => {
                  handleBotoesIniciais('Em que posso te ajudar?');
                }, 500);
              }
            }
          ]);
          return;
        }
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
                    pushMessage(message, 500);
                  }
                  pushMessage('Espero ter ajudado! 😊', 500);
                  pushMessage('Caso precise de mais alguma coisa, estou por aqui.', 500, [
                    {
                      text: 'Gostaria de entender outro cenário econômico',
                      type: 'button',
                      action: () => {
                        pushMessage('Gostaria de entender outro cenário econômico', 0, null, true);
                        setTimeout(() => {
                          handleEscolherCenarioEconomico('Escolha abaixo um dos cenários econômicos para que eu possa te ajudar:');
                        }, 500);
                      }
                    },
                    {
                      text: 'Voltar ao menu',
                      type: 'button',
                      action: () => {
                        pushMessage('Voltar ao menu', 0, null, true);
                        setTimeout(() => {
                          handleBotoesIniciais('Em que posso te ajudar?');
                        }, 500);
                      }
                    },
                  ]);
                })
                .catch(error => console.log(error));
              }, 500);
            }
          };
        });
        pushMessage('Aqui estão os cenários econômicos disponíveis:', 500, buttons);
      })
      .catch(error => console.log(error));
  }, 500);
};

const handleMandarInputDePesquisarAcao = async () => {
  pushMessage('Quero pesquisar por outra ação...', 0, null, true);
  setTimeout(async () => {
    // add input para pesquisar ação
    pushMessage('Digite o nome da ação que deseja pesquisar no campo de texto abaixo.<br/>Exemplo: PETR4, VALE3, ITUB4, etc.', 100, null, false, null);
    await sleepTime(500);
    waitForInputMessage().then(async (value) => {
      if (!value || !value.trim()) {
        return;
      }
      pushMessage(`Pesquisando informações sobre a ação ${value}...`, 500);
      await api.post(`api/bot/acoes/search?acao=${value}`)
        .then(({ data }) => {
          const empresa = data.empresa;
          const buttons = (data.perguntas || []).map(pergunta => {
            return {
              text: pergunta.pergunta,
              type: 'pergunta',
              action: () => handleClickOnPergunta(empresa.id, pergunta)
            };
          });
          pushMessage(`Ok! Separei aqui algumas perguntas que você pode fazer sobre a ação ${empresa.name}:`, 2000, buttons);
        })
        .catch(error => {
          console.log(error);
          pushMessage('Não encontrei nenhuma ação com o nome informado. 😔', 100);
          pushMessage('Por favor, tente novamente.', 100);
        });
    });
  }, 500);
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
        await sleepTime(500);
        await api.post(`api/bot/acoes/${empresa.id}`)
          .then(({ data }) => {
            const buttons = (data.perguntas || []).map(pergunta => {
              return {
                text: pergunta.pergunta,
                type: 'pergunta',
                action: () => handleClickOnPergunta(empresa.id, pergunta)
              };
            });
            pushMessage(`Separei aqui algumas perguntas que você pode fazer sobre a ação ${empresa.name}:`, 2000, buttons);
          })
          .catch(error => {
            const statusCode = error.response.status || 500;
            if (statusCode === 404) {
              pushMessage('Não encontrei nenhuma informação sobre a ação. 😔', 100);
              pushMessage('Por favor, tente novamente mais tarde. Ou pesquise por outra ação.', 100, [
                {
                  text: 'Quero pesquisar por outra ação...',
                  type: 'button',
                  action: () => {
                    handleMandarInputDePesquisarAcao();
                  }
                },
                {
                  text: 'Voltar ao menu',
                  type: 'button',
                  action: () => {
                    pushMessage('Voltar ao menu', 0, null, true);
                    setTimeout(() => {
                      handleBotoesIniciais('Em que posso te ajudar?');
                    }, 500);
                  }
                }
              ]);
              return;
            }
            pushMessage('Ocorreu um erro ao buscar informações sobre a ação. 😔', 100)
            pushMessage('Por favor, tente novamente mais tarde. Ou pesquise por outra ação.', 100, [
              {
                text: 'Quero pesquisar por outra ação...',
                type: 'button',
                action: () => {
                  handleMandarInputDePesquisarAcao();
                }
              },
              {
                text: 'Voltar ao menu',
                type: 'button',
                action: () => {
                  pushMessage('Voltar ao menu', 0, null, true);
                  setTimeout(() => {
                    handleBotoesIniciais('Em que posso te ajudar?');
                  }, 500);
                }
              }
            ]);
          });
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
  botoesEmpresas.push({
    text: 'Voltar ao menu',
    type: 'button',
    action: () => {
      pushMessage('Voltar ao menu', 0, null, true);
      setTimeout(() => {
        handleBotoesIniciais('Em que posso te ajudar?');
      }, 500);
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
  <div id="container">
    <div id="content">
      <chat-message
        v-for="message in messages"
        :key="message.uuid"
        :message="message"
      />
    </div>
  </div>
</template>

<style scoped>
#container {
  width: 700px;
  margin: 1rem auto 0 auto;
  max-height: calc(100vh - 200px);
}

@media screen and (max-width: 800px) {
  #container {
    width: 95%;
    height: calc(100vh - 245px);
  }
}

@media screen and (min-width: 1201px) {
  #container {
    width: 1200px;
  }
}

#content {
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
  overflow: auto;
  padding: 0 20px;
}

@media screen and (max-width: 430px) {
  #content {
    padding: 0 10px;
  }
}
</style>