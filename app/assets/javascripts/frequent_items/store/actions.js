import _ from 'underscore';
import Api from '~/api';

import { FREQUENT_ITEMS } from '../constants';
import * as types from './mutation_types';
import { isLocalStorageAvailable, getTopFrequentItems, updateExistingFrequentItem } from './utils';

export const setSearchQuery = ({ commit }, query) => {
  commit(types.SET_SEARCH_QUERY, query);
};

export const receiveFrequentItemsSuccess = ({ commit }, data) => {
  commit(types.RECEIVE_FREQUENT_ITEMS_SUCCESS, data);
};
export const receiveFrequentItemsError = ({ commit }) => {
  commit(types.RECEIVE_FREQUENT_ITEMS_ERROR);
};

export const fetchFrequentItems = ({ state, dispatch }) => {
  if (isLocalStorageAvailable) {
    const storedFrequentItems = JSON.parse(localStorage.getItem(state.storageKey));

    dispatch(
      'receiveFrequentItemsSuccess',
      !storedFrequentItems ? [] : getTopFrequentItems(storedFrequentItems),
    );
  } else {
    dispatch('receiveFrequentItemsError');
  }
};

export const receiveSearchedItemsSuccess = ({ commit }, data) => {
  commit(types.RECEIVE_SEARCHED_ITEMS_SUCCESS, data);
};
export const receiveSearchedItemsError = ({ commit }) => {
  commit(types.RECEIVE_SEARCHED_ITEMS_ERROR);
};
export const fetchSearchedItems = ({ state, dispatch }, searchQuery) => {
  const params = {
    simple: true,
    per_page: 20,
    membership: !!gon.current_user_id,
  };

  if (state.namespace === 'projects') {
    params.order_by = 'last_activity_at';
  }

  return Api[state.namespace](searchQuery, params)
    .then(results => {
      dispatch('receiveSearchedItemsSuccess', results);
    })
    .catch(error => {
      dispatch('receiveSearchedItemsError', error);
    });
};

export const logItemAccess = ({ state }, item) => {
  if (!isLocalStorageAvailable) {
    return false;
  }

  // Check if there's any frequent items list set
  const storedRawItems = localStorage.getItem(state.storageKey);
  const storedFrequentItems = storedRawItems
    ? JSON.parse(storedRawItems)
    : [{ ...item, frequency: 1 }]; // No frequent items list set, set one up.

  // Check if item already exists in list
  const itemMatchIndex = _.findIndex(
    storedFrequentItems,
    frequentItem => frequentItem.id === item.id,
  );

  if (itemMatchIndex > -1) {
    storedFrequentItems[itemMatchIndex] = updateExistingFrequentItem(
      storedFrequentItems[itemMatchIndex],
      item,
    );
  } else {
    if (storedFrequentItems.length === FREQUENT_ITEMS.MAX_COUNT) {
      storedFrequentItems.shift();
    }

    storedFrequentItems.push({ ...item, frequency: 1 });
  }

  return localStorage.setItem(state.storageKey, JSON.stringify(storedFrequentItems));
};

// prevent babel-plugin-rewire from generating an invalid default during karma tests
export default () => {};
