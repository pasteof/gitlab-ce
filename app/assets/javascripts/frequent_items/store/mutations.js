import { VIEW_STATES } from '../constants';
import * as types from './mutation_types';
import { toggleViewStates } from './utils';

export default {
  [types.SET_SEARCH_QUERY](state, searchQuery) {
    const newViewStates = toggleViewStates(
      state,
      searchQuery ? VIEW_STATES.IS_LOADING_ITEMS : VIEW_STATES.IS_ITEMS_LIST_VISIBLE,
    );

    Object.assign(state, {
      ...newViewStates,
      searchQuery,
    });
  },
  [types.REQUEST_FREQUENT_ITEMS](state) {
    const newViewStates = toggleViewStates(state, VIEW_STATES.IS_LOADING_ITEMS);

    Object.assign(state, {
      ...newViewStates,
    });
  },
  [types.RECEIVE_FREQUENT_ITEMS_SUCCESS](state, rawItems) {
    const newViewStates = toggleViewStates(state, VIEW_STATES.IS_ITEMS_LIST_VISIBLE);

    Object.assign(state, {
      ...newViewStates,
      frequentItems: rawItems,
    });
  },
  [types.RECEIVE_FREQUENT_ITEMS_ERROR](state) {
    const newViewStates = toggleViewStates(state, VIEW_STATES.IS_ITEMS_LIST_VISIBLE);

    Object.assign(state, {
      ...newViewStates,
      isLocalStorageFailed: true,
    });
  },
  [types.REQUEST_SEARCHED_ITEMS](state) {
    const newViewStates = toggleViewStates(state, VIEW_STATES.IS_LOADING_ITEMS);

    Object.assign(state, {
      ...newViewStates,
    });
  },
  [types.RECEIVE_SEARCHED_ITEMS_SUCCESS](state, rawItems) {
    const newViewStates = toggleViewStates(
      state,
      state.searchQuery ? VIEW_STATES.IS_SEARCH_LIST_VISIBLE : VIEW_STATES.IS_ITEMS_LIST_VISIBLE,
    );

    Object.assign(state, {
      ...newViewStates,
      searchedItems: rawItems.map(rawItem => ({
        id: rawItem.id,
        name: rawItem.name,
        namespace: rawItem.name_with_namespace || rawItem.full_name,
        webUrl: rawItem.web_url,
        avatarUrl: rawItem.avatar_url,
      })),
    });
  },
  [types.RECEIVE_SEARCHED_ITEMS_ERROR](state) {
    const newViewStates = toggleViewStates(state, VIEW_STATES.IS_SEARCH_LIST_VISIBLE);

    Object.assign(state, {
      ...newViewStates,
      isSearchFailed: true,
    });
  },
};
