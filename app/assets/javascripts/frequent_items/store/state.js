import { VIEW_STATES } from '../constants';

export default {
  storageKey: '',
  searchQuery: '',
  isLocalStorageFailed: false,
  isSearchFailed: false,
  [VIEW_STATES.IS_LOADING_ITEMS]: false,
  [VIEW_STATES.IS_ITEMS_LIST_VISIBLE]: true,
  [VIEW_STATES.IS_SEARCH_LIST_VISIBLE]: false,
  frequentItems: [],
  searchedItems: [],
};
