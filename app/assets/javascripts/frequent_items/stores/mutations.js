import * as types from './mutation_types';

export default {
  [types.SET_FREQUENT_ITEMS](state, rawItems) {
    Object.assign(state, {
      frequentItems: rawItems,
    });
  },
  [types.SET_SEARCHED_ITEMS](state, rawItems) {
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
  [types.CLEAR_SEARCHED_ITEMS](state) {
    Object.assign(state, {
      searchedItems: [],
    });
  },
};
