import * as types from './mutation_types';

export const setFrequentItems = ({ commit }, rawItems) => {
  commit(types.SET_FREQUENT_ITEMS, rawItems);
};

export const setSearchedItems = ({ commit }, rawItems) => {
  commit(types.SET_SEARCHED_ITEMS, rawItems);
};

export const clearSearchedItems = ({ commit }) => {
  commit(types.CLEAR_SEARCHED_ITEMS);
};

export default setFrequentItems;
