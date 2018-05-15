import * as types from './mutation_types';

export default {
  [types.SET_SEARCH_QUERY](state, searchQuery) {
    Object.assign(state, {
      searchQuery,
    });
  },
  [types.RECEIVE_FREQUENT_ITEMS_SUCCESS](state, rawItems) {
    Object.assign(state, {
      frequentItems: rawItems,
    });
  },
  [types.RECEIVE_FREQUENT_ITEMS_ERROR](state) {
    Object.assign(state, {
      isLocalStorageFailed: true,
    });
  },
  [types.RECEIVE_SEARCHED_ITEMS_SUCCESS](state, rawItems) {
    Object.assign(state, {
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
    Object.assign(state, {
      isSearchFailed: true,
    });
  },
};
