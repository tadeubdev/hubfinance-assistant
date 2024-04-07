import { createStore } from 'vuex'

export default createStore({
  state () {
    return {
      inputAllowed: false,
      inputMessage: null,
    }
  },
  mutations: {
    setInputAllowed(state, inputAllowed) {
      state.inputAllowed = inputAllowed;
    },
    setInputMessage(state, inputMessage) {
      state.inputMessage = inputMessage;
    },
  },
  actions: {
    setInputAllowed(context, inputAllowed) {
      context.commit('setInputAllowed', inputAllowed);
    },
    setInputMessage(context, inputMessage) {
      context.commit('setInputMessage', inputMessage);
    },
    sendMessage(context, message) {
      context.dispatch('setInputMessage', message);
      context.dispatch('setInputAllowed', false);
    }
  },
  getters: {
    inputAllowed(state) {
      return state.inputAllowed;
    },
    inputMessage(state) {
      return state.inputMessage;
    },
  },
})