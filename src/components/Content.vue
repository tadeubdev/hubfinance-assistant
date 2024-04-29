<script setup>
import saudacao from '@/helpers/saudacao';
import { v4 as uuidv4 } from 'uuid';
import {onMounted, ref} from 'vue';
import { useStore } from 'vuex';
import api from '@/infra/axios';
import sleepTime from '@/helpers/sleep-time';
import { faHome, faRepeat, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
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

const pushMessage = (message, time=0, buttons=null, fromMe=false, input=null, partial=null, partialData=null) => {
  const author = fromMe ? {
    name: 'Você',
    image: 'https://ip.hubfinanceiro.com/assistant/avatar.png'
  } : {
    name: 'FariaLima AI',
    image: 'https://ip.hubfinanceiro.com/assistant/icon.png'
  };
  const uuid = uuidv4();
  const newMessage = { uuid, author, time, fromMe, message, buttons, input, partial, partialData };
  messagesQueue.value.push(newMessage);
};

const handleClickOnPergunta = async (empresaId, pergunta, outrasPerguntas=[], empresaNome=null) => {
  pushMessage(pergunta.pergunta, 0, null, true);
  await sleepTime(1000);

  if (pergunta.id === 'dados-financeiros') {
    if (!empresaNome) {
      // algo deu errado
      pushMessage('Não encontrei nenhuma informação sobre a ação. 😔', 100)
      pushMessage('Por favor, tente novamente mais tarde.', 100);
      return;
    }
    const matches = empresaNome.match(/(.*)\s\((.*)\)/);
    if (!matches || matches.length < 3) {
      // algo deu errado
      pushMessage('Não encontrei nenhuma informação sobre a ação. 😔', 100)
      pushMessage('Por favor, tente novamente mais tarde.', 100);
      return;
    }
    const slug = matches[1];
    const symbol = `BMFBOVESPA:${slug}`;
    pushMessage('', 1500, [], false, null, 'analise-financeira', symbol);
    setTimeout(() => {
      pushMessage('Aqui estão as informações que encontrei. Você ainda pode:', 500, [
        {
          text: '🔍 Quero pesquisar por outro ativo...',
          type: 'button',
          action: () => handleDisplayAnaliseAcoes('Quero pesquisar por outro ativo')
        },
        {
          text: 'Voltar ao menu',
          type: 'button',
          icon: faHome,
          action: () => {
            pushMessage('Voltar ao menu', 0, null, true);
            setTimeout(() => {
              handleBotoesIniciais('Em que posso te ajudar?');
            }, 500);
          }
        }
      ]);
    }, 2000)
    return;
  }

  api.post(`api/bot/acoes/${empresaId}/perguntas/${pergunta.id}`)
    .then(async ({ data }) => {
      const respostas = data.respostas || [];
      respostas.forEach(resposta => pushMessage(resposta, 500));

      pushMessage('', 1500, [], false, null, 'stock-guide', {
        name: data.empresa.name || '',
        slug: data.empresa.slug || ''
      });

      pushMessage('', 1500, [], false, null, 'symbol-profile', `BMFBOVESPA:${data.empresa.slug}`);

      // se for a pergunta de saúde financeira, chama a análise financeira
      if (data.empresa.slug && pergunta.pergunta === 'Qual é a Saúde Financeira atual da empresa?') {
        const symbol = `BMFBOVESPA:${data.empresa.slug}`;
        pushMessage('', 1500, [], false, null, 'analise-financeira', symbol);
      }

      if (!outrasPerguntas || !outrasPerguntas.length) {
        pushMessage('Estas são as informações que tenho sobre a ação. 😊', 500, [
          {
            text: '🙋‍♂️ Gostaria de conversar com um especialista sobre esta empresa!',
            type: 'button',
            contrast: true,
            action: () => {
              handleMandaMenuEspecialista('Menu Ativos', 'Gostaria de conversar com um especialista sobre esta empresa!');
            }
          },
          {
            text: 'Quero pesquisar por outra ação...',
            type: 'button',
            icon: faMagnifyingGlass,
            action: () => {
              handleMandarInputDePesquisarAcao();
            }
          },
          {
            text: 'Voltar ao menu',
            icon: faHome,
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
      pushMessage('Estas são as informações que tenho sobre a ação. 😊 Você gostaria de fazer outra pergunta?', 500, outrasPerguntas.map(pergunta => {
        return {
          text: pergunta.pergunta,
          type: 'pergunta',
          action: () => handleClickOnPergunta(empresaId, pergunta, outrasPerguntas.filter(p => p.id !== pergunta.id))
        };
      }));
      await sleepTime(3000);
      pushMessage('Você também pode...', 500, [
        {
          text: '🙋‍♂️ Gostaria de conversar com um especialista sobre esta empresa!',
          type: 'button',
          contrast: true,
          action: () => {
            handleMandaMenuEspecialista('Menu Ativos', 'Gostaria de conversar com um especialista sobre esta empresa!');
          }
        },
        {
          text: 'Quero pesquisar por outra ação...',
          type: 'button',
          icon: faMagnifyingGlass,
          action: () => {
            handleMandarInputDePesquisarAcao();
          }
        },
        {
          text: 'Voltar ao menu',
          icon: faHome,
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
        icon: faRepeat,
        action: () => {
          handleMandaMenuEspecialista(assunto, title);
        }
      },
      {
        text: 'Voltar ao menu',
        type: 'button',
        icon: faHome,
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
        icon: faRepeat,
        action: () => {
          handleMandaMenuEspecialista(assunto, title);
        }
      },
      {
        text: 'Voltar ao menu',
        type: 'button',
        icon: faHome,
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
        icon: faRepeat,
        action: () => {
          handleMandaMenuEspecialista(assunto, title);
        }
      },
      {
        text: 'Voltar ao menu',
        type: 'button',
        icon: faHome,
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
        text: '📈 Gostaria de analisar Ações',
        type: 'button',
        action: () => handleDisplayAnaliseAcoes()
      },
      {
        text: '🌍 Gostaria de entender o cenário econômico',
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
        icon: faHome,
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

const handlePesquisarPorAnaliseTecnicas = async () => {
  pushMessage('Análise Técnica', 0, null, true);
  // add input para pesquisar ação
  pushMessage('Qual empresa você gostaria de analisar?<br/>Exemplo: PETR4, VALE3, ITUB4, etc.', 800, null, false, null);
  await sleepTime(1500);
  waitForInputMessage().then(async (value) => {
    if (!value || !value.trim()) {
      return;
    }
    value = value.toUpperCase();
    api.post('api/bot/analise-tecnica/search', { slug: value }).then(({ data }) => {
      const empresa = data.empresa || null;
      if (!empresa) {
        pushMessage('Não encontrei nenhuma ação com o nome informado. 😔', 100)
        pushMessage('Você pode pesquisar por outro ativo.', 100, [
          {
            text: '🔍 Quero pesquisar por outro ativo...',
            type: 'button',
            action: () => {
              handlePesquisarPorAnaliseTecnicas();
            }
          },
          {
            text: 'Voltar ao menu',
            type: 'button',
            icon: faHome,
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
      const symbol = `BMFBOVESPA:${empresa.slug}`;
      pushMessage(`Pesquisando informações sobre a ação ${value}...`, 500);
      pushMessage('', 1500, [], false, null, 'analise-tecnica', symbol);
      pushMessage('', 1500, [], false, null, 'symbol-profile', symbol);
      setTimeout(() => {
        pushMessage('Aqui estão as informações que encontrei. Você ainda pode:', 500, [
          {
            text: '🔍 Quero pesquisar por outro ativo...',
            type: 'button',
            action: () => handlePesquisarPorAnaliseTecnicas()
          },
          {
            text: 'Voltar ao menu',
            type: 'button',
            icon: faHome,
            action: () => {
              pushMessage('Voltar ao menu', 0, null, true);
              setTimeout(() => {
                handleBotoesIniciais('Em que posso te ajudar?');
              }, 500);
            }
          }
        ]);
      }, 2000)
    }).catch(() => {
      pushMessage(`Não encontrei nenhuma informação sobre: ${value}. 😔`, 100);
      pushMessage('Mas você pode pesquisar por outro ativo.', 100, [
        {
          text: 'Quero pesquisar por outro ativo...',
          type: 'button',
          action: () => {
            pushMessage('Quero pesquisar por outro ativo!', 0, null, true);
            handlePesquisarPorAnaliseTecnicas();
          }
        },
        {
          text: 'Voltar ao menu',
          type: 'button',
          icon: faHome,
          action: () => {
            pushMessage('Voltar ao menu', 0, null, true);
            setTimeout(() => {
              handleBotoesIniciais('Em que posso te ajudar?');
            }, 500);
          }
        }
      ]);
    });
  });
}

const handleAnalisarGraficoDasAcoes = async () => {
  pushMessage('Gostaria de analisar o gráfico das ações de uma empresa', 0, null, true);
  // add input para pesquisar ação
  pushMessage('Qual empresa você gostaria de analisar?<br/>Exemplo: PETR4, VALE3, ITUB4, etc.', 800, null, false, null);
  await sleepTime(1500);
  waitForInputMessage().then(async (value) => {
    if (!value || !value.trim()) {
      pushMessage('Por favor, informe o nome da empresa que deseja analisar.', 100, [
        {
          text: 'Tentar novamente',
          type: 'button',
          icon: faRepeat,
          action: () => {
            handleAnalisarGraficoDasAcoes();
          }
        },
        {
          text: 'Voltar ao menu',
          type: 'button',
          icon: faHome,
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
    api.post('api/bot/analise-tecnica/search', { slug: value }).then(({ data }) => {
      const empresa = data.empresa || null;
      if (!empresa) {
        pushMessage('Não encontrei nenhuma ação com o nome informado. 😔', 100)
        pushMessage('Você pode pesquisar por outro ativo.', 100, [
          {
            text: '🔍 Quero pesquisar por outro ativo...',
            type: 'button',
            action: () => {
              handlePesquisarPorAnaliseTecnicas();
            }
          },
          {
            text: 'Voltar ao menu',
            type: 'button',
            icon: faHome,
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
      pushMessage(`Pesquisando informações sobre a ação ${value}...`, 500);
      const symbol = `BMFBOVESPA:${value}`;
      pushMessage('', 1500, [], false, null, 'advanced-chart', symbol);
      setTimeout(() => {
        pushMessage('Aqui estão as informações que encontrei. Você ainda pode:', 500, [
          {
            text: '🔍 Quero pesquisar por outro ativo...',
            type: 'button',
            action: () => handleAnalisarGraficoDasAcoes()
          },
          {
            text: 'Voltar ao menu',
            type: 'button',
            icon: faHome,
            action: () => {
              pushMessage('Voltar ao menu', 0, null, true);
              setTimeout(() => {
                handleBotoesIniciais('Em que posso te ajudar?');
              }, 500);
            }
          }
        ]);
      }, 2000)
    }).catch(() => {
      pushMessage(`Não encontrei nenhuma informação sobre: ${value}. 😔`, 100);
      pushMessage('Mas você pode pesquisar por outro ativo.', 100, [
        {
          text: 'Quero pesquisar por outro ativo...',
          type: 'button',
          action: () => {
            handleAnalisarGraficoDasAcoes();
          }
        },
        {
          text: 'Voltar ao menu',
          type: 'button',
          icon: faHome,
          action: () => {
            pushMessage('Voltar ao menu', 0, null, true);
            setTimeout(() => {
              handleBotoesIniciais('Em que posso te ajudar?');
            }, 500);
          }
        }
      ]);
    });
  });
}

const handleVerificarMaioresAltasBolsasBR = () => {
  pushMessage('Verificar maiores altas da bolsa BR', 0, null, true);
  pushMessage('Ok! Vou buscar informações sobre as maiores altas da bolsa dos BR para você...', 1500);
  pushMessage('', 1500, [], false, null, 'hotlists', 'BMFBOVESPA');
  pushMessage('Espero ter ajudado! 😊 <br/> Caso precise de mais alguma coisa, estou por aqui.', 500, [
    {
      text: '🇺🇸 Verificar maiores altas da bolsa EUA',
      type: 'button',
      action: () => {
        handleVerificarMaioresAltasBolsasBR();
      }
    },
    {
      text: 'Voltar ao menu',
      type: 'button',
      icon: faHome,
      action: () => {
        pushMessage('Voltar ao menu', 0, null, true);
        setTimeout(() => {
          handleBotoesIniciais('Em que posso te ajudar?');
        }, 500);
      }
    }
  ]);
}

const handleVerificarMaioresAltasBolsasEua = () => {
  pushMessage('Verificar maiores altas da bolsa EUA', 0, null, true);
  pushMessage('Ok! Vou buscar informações sobre as maiores altas da bolsa dos EUA para você...', 1500);
  pushMessage('', 1500, [], false, null, 'hotlists', 'US');
  pushMessage('Espero ter ajudado! 😊 <br/> Caso precise de mais alguma coisa, estou por aqui.', 500, [
    {
      text: '🇧🇷 Verificar maiores altas da bolsa BR',
      type: 'button',
      action: () => {
        handleVerificarMaioresAltasBolsasBR();
      }
    },
    {
      text: 'Voltar ao menu',
      type: 'button',
      icon: faHome,
      action: () => {
        pushMessage('Voltar ao menu', 0, null, true);
        setTimeout(() => {
          handleBotoesIniciais('Em que posso te ajudar?');
        }, 500);
      }
    }
  ]);
}

const handleDisplayAnaliseAcoes = (title=null) => {
  pushMessage(title || 'Gostaria de analisar Ações', 0, null, true);
  pushMessage('Ótimo! Que tipo de Ánalise você gostaria de fazer?', 500, [
    {
      text: '📊 Análise Fundamentalista',
      type: 'button',
      action: () => {
        pushMessage('Análise Fundamentalista', 0, null, true);
        handleMandarEscolherEmpresa('Escolha abaixo uma das ações para que eu possa te ajudar:');
      }
    },
    {
      text: '🔍 Análise Técnica',
      type: 'button',
      action: async () => handlePesquisarPorAnaliseTecnicas()
    },
    {
      text: '📈 Analisar o gráfico das ações de uma empresa',
      type: 'button',
      action: () => handleAnalisarGraficoDasAcoes(),
    },
    {
      text: '🇺🇸 Verificar maiores altas da bolsa EUA',
      type: 'button',
      action: () => handleVerificarMaioresAltasBolsasEua(),
    },
    {
      text: '🇧🇷 Verificar maiores altas da bolsa BR',
      type: 'button',
      action: () => handleVerificarMaioresAltasBolsasBR(),
    },
    {
      text: 'Voltar ao menu',
      type: 'button',
      icon: faHome,
      action: () => {
        pushMessage('Voltar ao menu', 0, null, true);
        setTimeout(() => {
          handleBotoesIniciais('Em que posso te ajudar?');
        }, 500);
      }
    }
  ]);
};

const handleEntenderMercado = () => {
  pushMessage('Como estão os mercados?', 0, null, true);
  pushMessage('Escolha abaixo um dos mercados para que eu possa te ajudar:', 1000, [
    {
      text: '🇺🇸 Como está o mercado Americano?',
      type: 'button',
      action: () => {
        pushMessage('Como está o mercado Americano?', 0, null, true);
        pushMessage('Ok! Vou buscar informações sobre o mercado Americano para você...', 1500);
        pushMessage('', 1500, [], false, null, 'symbol-info', 'OANDA:SPX500USD');
        pushMessage('', 1500, [], false, null, 'stock-heatmap', 'SPX500');
        pushMessage('Espero ter ajudado! 😊 <br/> Caso precise de mais alguma coisa, estou por aqui.', 500, [
          {
            text: 'Entender outro mercado',
            type: 'button',
            action: () => {
              setTimeout(() => {
                handleEntenderMercado();
              }, 500);
            }
          },
          {
            text: 'Voltar ao menu',
            type: 'button',
            icon: faHome,
            action: () => {
              pushMessage('Voltar ao menu', 0, null, true);
              setTimeout(() => {
                handleBotoesIniciais('Em que posso te ajudar?');
              }, 500);
            }
          }
        ]);
      }
    },
    {
      text: '🇧🇷 Como está o mercado Brasileiro?',
      type: 'button',
      action: () => {
        pushMessage('Como está o mercado Brasileiro?', 0, null, true);
        pushMessage('Ok! Vou buscar informações sobre o mercado Brasileiro para você...', 1500);
        pushMessage('', 1500, [], false, null, 'symbol-info', 'IBOV');
        pushMessage('', 1500, [], false, null, 'stock-heatmap', 'IBOV');
        pushMessage('Espero ter ajudado! 😊 <br/> Caso precise de mais alguma coisa, estou por aqui.', 500, [
          {
            text: 'Entender outro mercado',
            type: 'button',
            action: () => {
              setTimeout(() => {
                handleEntenderMercado();
              }, 500);
            }
          },
          {
            text: 'Voltar ao menu',
            type: 'button',
            icon: faHome,
            action: () => {
              pushMessage('Voltar ao menu', 0, null, true);
              setTimeout(() => {
                handleBotoesIniciais('Em que posso te ajudar?');
              }, 500);
            }
          }
        ]);
      }
    },
    {
      text: '💰 Como estão as Criptomoedas?',
      type: 'button',
      action: () => {
        pushMessage('Como estão as Criptomoedas?', 0, null, true);
        pushMessage('Ok! Vou buscar informações sobre as Criptomoedas para você...', 1500);
        pushMessage('', 1500, [], false, null, 'crypto-coins-heatmap', '');
        pushMessage('Espero ter ajudado! 😊 <br/> Caso precise de mais alguma coisa, estou por aqui.', 500, [
          {
            text: 'Entender outro mercado',
            type: 'button',
            action: () => {
              setTimeout(() => {
                handleEntenderMercado();
              }, 500);
            }
          },
          {
            text: 'Voltar ao menu',
            type: 'button',
            icon: faHome,
            action: () => {
              pushMessage('Voltar ao menu', 0, null, true);
              setTimeout(() => {
                handleBotoesIniciais('Em que posso te ajudar?');
              }, 500);
            }
          }
        ]);
      }
    },
    {
      text: 'Voltar ao menu',
      type: 'button',
      icon: faHome,
      action: () => {
        pushMessage('Voltar ao menu', 0, null, true);
        setTimeout(() => {
          handleBotoesIniciais('Em que posso te ajudar?');
        }, 500);
      }
    }
  ]);
}

const handleNoticiasDoMercado = () => {
  pushMessage('Quais são as principais notícias do mercado hoje?', 0, null, true);
  pushMessage('Ok! Vou buscar as principais notícias do mercado para você...', 1500);
  pushMessage('', 1500, [], false, null, 'rss-magazine', '');
  pushMessage('Espero ter ajudado! 😊 <br/> Caso precise de mais alguma coisa, estou por aqui.', 500, [
    {
      text: 'Voltar ao menu',
      type: 'button',
      icon: faHome,
      action: () => {
        pushMessage('Voltar ao menu', 0, null, true);
        setTimeout(() => {
          handleBotoesIniciais('Em que posso te ajudar?');
        }, 500);
      }
    }
  ]);
}

const handleAnalisarTaxasDeCambio = () => {
  pushMessage('Analisar Taxas de Câmbio', 0, null, true);
  pushMessage('Ok! Vou buscar informações sobre as Taxas de Câmbio para você...', 1500);
  pushMessage('', 1500, [], false, null, 'currency-exchange', '');
  pushMessage('Espero ter ajudado! 😊 <br/> Caso precise de mais alguma coisa, estou por aqui.', 500, [
    {
      text: 'Voltar ao menu',
      type: 'button',
      icon: faHome,
      action: () => {
        pushMessage('Voltar ao menu', 0, null, true);
        setTimeout(() => {
          handleBotoesIniciais('Em que posso te ajudar?');
        }, 500);
      }
    }
  ]);
}

const handleVerCalendarioEconomico = () => {
  pushMessage('Ver Calendário Econômico', 0, null, true);
  pushMessage('Ok! Vou buscar informações sobre o Calendário Econômico para você...', 1500);
  pushMessage('', 1500, [], false, null, 'economic-calendar', '');
  pushMessage('Espero ter ajudado! 😊 <br/> Caso precise de mais alguma coisa, estou por aqui.', 500, [
    {
      text: 'Voltar ao menu',
      type: 'button',
      icon: faHome,
      action: () => {
        pushMessage('Voltar ao menu', 0, null, true);
        setTimeout(() => {
          handleBotoesIniciais('Em que posso te ajudar?');
        }, 500);
      }
    }
  ]);
}

const handleBotoesIniciais = async (title=null) => {
  pushMessage(title || 'Em que posso te ajudar?', 1000, [
    {
      text: '📈 Gostaria de analisar Ações',
      type: 'button',
      action: () => handleDisplayAnaliseAcoes()
    },
    {
      text: '🌍 Gostaria de entender o cenário econômico',
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
      text: '💲 Como estão os mercados?',
      type: 'button',
      action: () => handleEntenderMercado()
    },
    {
      text: '📰 Quais são as principais notícias do mercado hoje?',
      type: 'button',
      action: () => handleNoticiasDoMercado()
    },
    {
      text: '🔄 Analisar Taxas de Câmbio',
      type: 'button',
      action: () => handleAnalisarTaxasDeCambio(),
    },
    {
      text: '📅 Ver Calendário Econômico',
      type: 'button',
      action: () => handleVerCalendarioEconomico(),
    },
    {
      text: '📚 Eu não entendo nada sobre investimentos e gostaria de aprender a investir!',
      type: 'button',
      contrast: true,
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
              icon: faHome,
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
                      text: '🌍 Gostaria de entender outro cenário econômico',
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
                      icon: faHome,
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

const handleMandarInputDePesquisarAcao = async (title=null, displayFirstTitle=true) => {
  if (displayFirstTitle) {
    pushMessage('Quero pesquisar por outra ação...', 0, null, true);
  }
  setTimeout(async () => {
    // add input para pesquisar ação
    pushMessage(title || 'Digite o nome da ação que deseja pesquisar no campo de texto abaixo.<br/>Exemplo: PETR4, VALE3, ITUB4, etc.', 100, null, false, null);
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
              action: () => handleClickOnPergunta(empresa.id, pergunta, data.perguntas.filter(p => p.id !== pergunta.id))
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
                action: () => handleClickOnPergunta(empresa.id, pergunta, data.perguntas.filter(p => p.id !== pergunta.id), empresa.name)
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
                  icon: faMagnifyingGlass,
                  type: 'button',
                  action: () => {
                    handleMandarInputDePesquisarAcao();
                  }
                },
                {
                  text: 'Voltar ao menu',
                  type: 'button',
                  icon: faHome,
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
                icon: faMagnifyingGlass,
                action: () => {
                  handleMandarInputDePesquisarAcao();
                }
              },
              {
                text: 'Voltar ao menu',
                type: 'button',
                icon: faHome,
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
    icon: faMagnifyingGlass,
    action: () => {
      handleMandarInputDePesquisarAcao();
    }
  });
  botoesEmpresas.push({
    text: 'Voltar ao menu',
    type: 'button',
    icon: faHome,
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
  <div id="assistant-container">
    <div id="assistant-content">
      <chat-message
        v-for="message in messages"
        :key="message.uuid"
        :message="message"
      />
    </div>
  </div>
</template>

<style>
.window-small #assistant-container {
  width: 97%;
}

.window-small #assistant-content {
  height: 350px;
}

#assistant-container {
  width: 700px;
  margin: 1rem auto 0 auto;
  max-height: calc(100vh - 200px);
}

@media screen and (max-width: 800px) {
  #assistant-container {
    width: 95%;
    height: calc(100vh - 245px);
  }
}

@media screen and (min-width: 1201px) {
  #assistant-container {
    width: 1200px;
  }
}

#assistant-content {
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
  overflow: auto;
  padding: 0 20px;
}

@media screen and (max-width: 430px) {
  #assistant-content {
    padding: 0 10px;
  }
}
</style>