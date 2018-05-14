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

export const fetchFrequentItems = ({ commit }) => {
  if (this.isLocalStorageAvailable) {
    const storedFrequentItems = JSON.parse(localStorage.getItem(this.storageKey));

    return !storedFrequentItems ? [] : this.getTopFrequentItems(storedFrequentItems);
  }

  return null;
  // this.setFrequentItems(items);
  // this.setFrequentItems([]);
};

// prevent babel-plugin-rewire from generating an invalid default during karma tests
export default () => {};
