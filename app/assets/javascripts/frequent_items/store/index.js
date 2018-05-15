import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import mutations from './mutations';
import state from './state';

Vue.use(Vuex);

const namespaced = true;

export const storeModule = {
  namespaced,
  actions,
  mutations,
  state,
};

export default new Vuex.Store();
