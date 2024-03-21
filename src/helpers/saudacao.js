const messages = {
  'Olá! Bom dia!': [0, 12],
  'Olá! Boa tarde!': [12, 18],
  'Olá! Boa noite!': [18, 24],
};

export default function saudacao() {
  const hora = new Date().getHours();
  const message = Object.entries(messages).find(([_, [start, end]]) => hora >= start && hora < end);
  return message ? message[0] : 'Olá!';
}